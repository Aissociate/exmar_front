import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, FileText, Ship, ClipboardList, Calculator, Eye, Loader2, Sparkles, Download, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SectionEditor } from '../components/SectionEditor';
import { EstimationCalculator } from '../components/EstimationCalculator';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { exportToDocx } from '../lib/docxExporter';
import { useNotification } from '../contexts/NotificationContext';

interface Step {
  id: string;
  title: string;
  icon: typeof FileText;
  completed: boolean;
}

export function ExpertiseReportWizardPage() {
  const { dossierId, reportId } = useParams<{ dossierId?: string; reportId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, showConfirm } = useNotification();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [, setAudioTranscriptions] = useState<any[]>([]);
  const [, setPhotos] = useState<any[]>([]);
  const [photosWithUrls, setPhotosWithUrls] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [generatingSection, setGeneratingSection] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  const [sections, setSections] = useState({
    expert_presentation: '',
    identification: '',
    contexte: '',
    constatations: '',
    analyse: '',
    estimation: '',
  });

  const [customPrompts, setCustomPrompts] = useState({
    expert_presentation: '',
    identification: '',
    contexte: '',
    constatations: '',
    analyse: '',
    estimation: '',
  });

  const [estimationData, setEstimationData] = useState({
    method: 'cost_based' as 'cost_based' | 'market_based' | 'depreciation',
    baseValue: 0,
    depreciation: 0,
    repairCosts: [] as Array<{
      item: string;
      quantity: number;
      unitCost: number;
      total: number;
    }>,
  });

  const [formData, setFormData] = useState({
    expert_name: 'Yannick DURAND',
    expert_title: 'Expert près de la Cour d\'Appel',
    expert_address: '2, impasse de Tromelin, 97419 La Possession',
    expert_contact: '06 92 86 01 10 - exmar.oi.contact@gmail.com',
    visit_date: new Date().toISOString().split('T')[0],
    visit_location: '',
    navigation_history: '',
  });

  const steps: Step[] = [
    { id: 'expert_presentation', title: 'Expert', icon: User, completed: !!sections.expert_presentation },
    { id: 'identification', title: 'Identification', icon: Ship, completed: !!sections.identification },
    { id: 'contexte', title: 'Contexte', icon: ClipboardList, completed: !!sections.contexte },
    { id: 'constatations', title: 'Constatations', icon: FileText, completed: !!sections.constatations },
    { id: 'analyse', title: 'Analyse', icon: FileText, completed: !!sections.analyse },
    { id: 'estimation', title: 'Estimation', icon: Calculator, completed: !!sections.estimation },
    { id: 'preview', title: 'Aperçu', icon: Eye, completed: false },
  ];

  useEffect(() => {
    if (user && (dossierId || reportId)) {
      loadData();
    }
  }, [user, dossierId, reportId]);

  useEffect(() => {
    if (!report?.id) return;

    setAutoSaving(true);
    const timeoutId = setTimeout(() => {
      supabase
        .from('expertise_reports')
        .update({
          expert_presentation_section: sections.expert_presentation,
          identification_section: sections.identification,
          contexte_section: sections.contexte,
          constatations_section: sections.constatations,
          analyse_section: sections.analyse,
          estimation_section: sections.estimation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id)
        .then(({ error }) => {
          if (error) {
            showToast('Erreur lors de la sauvegarde automatique', 'error');
          }
          setAutoSaving(false);
        });
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      setAutoSaving(false);
    };
  }, [sections, report?.id]);

  useEffect(() => {
    if (!report?.id) return;

    const timeoutId = setTimeout(() => {
      supabase
        .from('expertise_reports')
        .update({
          estimation_data: estimationData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id)
        .then(({ error }) => {
          if (error) {
            showToast('Erreur lors de la sauvegarde automatique de l\'estimation', 'error');
          }
        });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [estimationData, report?.id]);

  const loadData = async () => {
    try {
      let dossierData: any;
      let reportData: any;

      if (reportId) {
        const { data: report, error: reportError } = await supabase
          .from('expertise_reports')
          .select('*, dossier:dossiers(*)')
          .eq('id', reportId)
          .eq('expert_id', user?.id)
          .single();

        if (reportError) throw reportError;
        reportData = report;
        dossierData = report.dossier;
      } else if (dossierId) {
        const { data: dossier, error: dossierError } = await supabase
          .from('dossiers')
          .select('*')
          .eq('id', dossierId)
          .eq('user_id', user?.id)
          .single();

        if (dossierError) throw dossierError;
        dossierData = dossier;

        let { data: existingReport, error: reportError } = await supabase
          .from('expertise_reports')
          .select('*')
          .eq('dossier_id', dossierId)
          .maybeSingle();

        if (reportError && reportError.code !== 'PGRST116') throw reportError;

        if (!existingReport) {
          const { data: newReport, error: createError } = await supabase
            .from('expertise_reports')
            .insert({
              dossier_id: dossierId,
              expert_id: user?.id,
              owner_name: dossierData.client_name,
              owner_address: dossierData.client_address,
              requester_name: dossierData.client_name,
              requester_address: dossierData.client_address,
            })
            .select()
            .single();

          if (createError) throw createError;
          reportData = newReport;
        } else {
          reportData = existingReport;
        }
      }

      setDossier(dossierData);
      setReport(reportData);

      const actualDossierId = dossierId || dossierData.id;

      if (dossierData.questionnaire_data) {
        setQuestionnaireData(dossierData.questionnaire_data);
      }

      const { data: audioData } = await supabase
        .from('questionnaire_audio')
        .select('*')
        .eq('dossier_id', actualDossierId)
        .eq('transcription_status', 'completed');

      setAudioTranscriptions(audioData || []);

      const { data: photosData } = await supabase
        .from('questionnaire_photos')
        .select('*')
        .eq('dossier_id', actualDossierId);

      setPhotos(photosData || []);

      if (photosData && photosData.length > 0) {
        const photosWithSignedUrls = await Promise.all(
          photosData.map(async (photo, index) => {
            const { data: urlData } = await supabase.storage
              .from('questionnaire-media')
              .createSignedUrl(photo.storage_path, 3600);

            return {
              ...photo,
              url: urlData?.signedUrl || '',
              caption: photo.caption || `Photo ${index + 1}`,
            };
          })
        );
        setPhotosWithUrls(photosWithSignedUrls);
      }

      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('dossier_id', actualDossierId);

      setDocuments(documentsData || []);

      if (reportData) {
        setSections({
          expert_presentation: reportData.expert_presentation_section || '',
          identification: reportData.identification_section || '',
          contexte: reportData.contexte_section || '',
          constatations: reportData.constatations_section || '',
          analyse: reportData.analyse_section || '',
          estimation: reportData.estimation_section || '',
        });

        if (reportData.estimation_data) {
          setEstimationData({
            method: reportData.estimation_data.method || 'cost_based',
            baseValue: reportData.estimation_data.baseValue || 0,
            depreciation: reportData.estimation_data.depreciation || 0,
            repairCosts: reportData.estimation_data.repairCosts || [],
          });
        }
      }

      setFormData(prev => ({
        ...prev,
        visit_location: dossierData.inspection_location || '',
        navigation_history: reportData.navigation_history || '',
      }));

    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSection = async (sectionName: 'expert_presentation' | 'identification' | 'contexte' | 'constatations' | 'analyse' | 'estimation') => {
    setGeneratingSection(true);
    try {
      let expertProfile = null;
      if (sectionName === 'expert_presentation') {
        const { data: profile } = await supabase
          .from('expert_profiles')
          .select('*')
          .eq('user_id', user?.id)
          .maybeSingle();
        expertProfile = profile;
      }

      const historicalContext = documents
        .map(doc => doc.extracted_text || doc.metadata?.historical_context)
        .filter(Boolean)
        .join('\n\n');

      const questionnaireAnswers = questionnaireData ? Object.entries(questionnaireData).map(([question, answer]) => ({
        question,
        answer,
        photos: photosWithUrls.filter(p => p.question_id === question).map(p => p.url),
      })) : [];

      const photoData = photosWithUrls.map((p, index) => ({
        url: p.url,
        caption: p.caption || `Photo ${index + 1}`,
        checkpoint: p.question_id,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-report-section`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: sectionName,
          customPrompt: customPrompts[sectionName] || undefined,
          expertProfile: expertProfile || undefined,
          dossierData: {
            vessel_name: dossier.vessel_name,
            vessel_type: dossier.vessel_type,
            imo_number: dossier.imo_number,
            flag: dossier.flag,
            port: dossier.port,
            owner: dossier.owner,
            incident_date: dossier.incident_date,
            inspection_date: dossier.inspection_date,
            notes: dossier.notes,
          },
          historicalContext,
          questionnaireAnswers,
          photos: photoData,
          previousSections: {
            expert_presentation: sections.expert_presentation,
            identification: sections.identification,
            contexte: sections.contexte,
            constatations: sections.constatations,
            analyse: sections.analyse,
          },
          estimationMethod: sectionName === 'estimation' ? estimationData : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      const result = await response.json();

      setSections(prev => ({
        ...prev,
        [sectionName]: result.content,
      }));

      const { error: saveError } = await supabase
        .from('expertise_reports')
        .update({
          [`${sectionName}_section`]: result.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      if (saveError) {
        showToast('Section générée mais erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
        return;
      }

      showToast('Section générée et sauvegardée avec succès!', 'success');
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur inconnue', 'error');
    } finally {
      setGeneratingSection(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('expertise_reports')
        .update({
          ...formData,
          identification_section: sections.identification,
          contexte_section: sections.contexte,
          constatations_section: sections.constatations,
          analyse_section: sections.analyse,
          estimation_section: sections.estimation,
          estimation_data: estimationData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      if (error) throw error;
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGenerateAll = () => {
    showConfirm(
      'Voulez-vous générer toutes les sections du rapport ? Les sections existantes seront écrasées.',
      async () => {
        setGeneratingAll(true);
        try {
          const sectionsToGenerate: ('expert_presentation' | 'identification' | 'contexte' | 'constatations' | 'analyse' | 'estimation')[] = [
            'expert_presentation',
            'identification',
            'contexte',
            'constatations',
            'analyse',
            'estimation'
          ];

          for (const sectionName of sectionsToGenerate) {
            try {
              await generateSection(sectionName);
              await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error: unknown) {
              showToast(`Erreur lors de la génération de la section ${sectionName}`, 'error');
            }
          }

          showToast('Toutes les sections ont été générées avec succès!', 'success');
        } catch (error: unknown) {
          showToast(error instanceof Error ? error.message : 'Erreur lors de la génération complète du rapport', 'error');
        } finally {
          setGeneratingAll(false);
        }
      },
      'Générer toutes les sections'
    );
  };

  const handlePrevious = async () => {
    await handleSave();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => reportId ? navigate('/reports') : navigate(`/dossiers/${dossierId}`)}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 self-start"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">{reportId ? 'Retour aux rapports' : 'Retour au dossier'}</span>
            </button>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 hidden sm:block">
              Assistant de rédaction de rapport d'expertise
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={handleGenerateAll}
                disabled={generatingAll || generatingSection}
                className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm min-w-[120px] sm:min-w-[140px]"
              >
                {generatingAll ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                    <span className="whitespace-nowrap">Génération...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Générer tout</span>
                  </>
                )}
              </button>
              <div className="w-[100px] sm:w-[120px] flex items-center justify-start">
                {autoSaving && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                    <span className="hidden sm:inline">Sauvegarde...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-6 mb-4 sm:mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max sm:min-w-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => setCurrentStep(index)}
                    className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-blue-100'
                          : isCompleted
                          ? 'bg-green-100'
                          : 'bg-slate-100'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8">
          {currentStep === 0 && (
            <SectionEditor
              title="Présentation de l'expert"
              sectionName="expert_presentation"
              content={sections.expert_presentation}
              onContentChange={(content) => setSections(prev => ({ ...prev, expert_presentation: content }))}
              onGenerate={() => generateSection('expert_presentation')}
              generating={generatingSection}
              description="Section de présentation de l'expert basée sur votre profil (paramètres)."
              customPrompt={customPrompts.expert_presentation}
              onCustomPromptChange={(prompt) => setCustomPrompts(prev => ({ ...prev, expert_presentation: prompt }))}
            />
          )}

          {currentStep === 1 && (
            <SectionEditor
              title="Identification du navire"
              sectionName="identification"
              content={sections.identification}
              onContentChange={(content) => setSections(prev => ({ ...prev, identification: content }))}
              onGenerate={() => generateSection('identification')}
              generating={generatingSection}
              description="Section d'identification complète du navire incluant les caractéristiques techniques."
              customPrompt={customPrompts.identification}
              onCustomPromptChange={(prompt) => setCustomPrompts(prev => ({ ...prev, identification: prompt }))}
            />
          )}

          {currentStep === 2 && (
            <SectionEditor
              title="Contexte et historique"
              sectionName="contexte"
              content={sections.contexte}
              onContentChange={(content) => setSections(prev => ({ ...prev, contexte: content }))}
              onGenerate={() => generateSection('contexte')}
              generating={generatingSection}
              description="Contexte de la mission d'expertise et historique du navire."
              customPrompt={customPrompts.contexte}
              onCustomPromptChange={(prompt) => setCustomPrompts(prev => ({ ...prev, contexte: prompt }))}
            />
          )}

          {currentStep === 3 && (
            <SectionEditor
              title="Constatations"
              sectionName="constatations"
              content={sections.constatations}
              onContentChange={(content) => setSections(prev => ({ ...prev, constatations: content }))}
              onGenerate={() => generateSection('constatations')}
              generating={generatingSection}
              description="Constatations détaillées lors de l'inspection avec références aux photos."
              showPhotos={true}
              photos={photosWithUrls}
              customPrompt={customPrompts.constatations}
              onCustomPromptChange={(prompt) => setCustomPrompts(prev => ({ ...prev, constatations: prompt }))}
            />
          )}

          {currentStep === 4 && (
            <SectionEditor
              title="Analyse technique"
              sectionName="analyse"
              content={sections.analyse}
              onContentChange={(content) => setSections(prev => ({ ...prev, analyse: content }))}
              onGenerate={() => generateSection('analyse')}
              generating={generatingSection}
              description="Analyse technique des constatations et recommandations."
              customPrompt={customPrompts.analyse}
              onCustomPromptChange={(prompt) => setCustomPrompts(prev => ({ ...prev, analyse: prompt }))}
            />
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Estimation</h2>
                <p className="text-sm text-slate-600">
                  Configurez la méthode d'estimation et les coûts de réparation.
                </p>
              </div>

              <EstimationCalculator
                data={estimationData}
                onChange={setEstimationData}
              />

              <div className="border-t border-slate-200 pt-6">
                <SectionEditor
                  title="Rapport d'estimation"
                  sectionName="estimation"
                  content={sections.estimation}
                  onContentChange={(content) => setSections(prev => ({ ...prev, estimation: content }))}
                  onGenerate={() => generateSection('estimation')}
                  generating={generatingSection}
                  description="Rapport détaillé de l'estimation avec méthodologie et justifications."
                  customPrompt={customPrompts.estimation}
                  onCustomPromptChange={(prompt) => setCustomPrompts(prev => ({ ...prev, estimation: prompt }))}
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <PreviewStep reportId={report.id} sections={sections} />
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 border border-slate-300 text-slate-700 text-sm sm:text-base rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            <button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <span>{currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStep({ reportId, sections }: any) {
  const { showToast } = useNotification();
  const [exporting, setExporting] = useState(false);

  const sectionTitles = {
    expert_presentation: "L'EXPERT",
    identification: 'I - Identification du navire',
    contexte: 'II - Contexte et historique',
    constatations: 'III - Constatations',
    analyse: 'IV - Analyse technique',
    estimation: 'V - Estimation',
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      const reportSections = Object.entries(sections)
        .filter(([, content]) => content)
        .map(([key, content]) => ({
          title: sectionTitles[key as keyof typeof sectionTitles],
          content: content as string,
        }));

      await exportToDocx(
        {
          title: 'RAPPORT D\'EXPERTISE MARITIME',
          sections: reportSections,
        },
        `rapport_expertise_${reportId}.docx`
      );

      const { error: updateError } = await supabase
        .from('expertise_reports')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (updateError) {
        showToast('Erreur lors de la mise à jour du statut du rapport', 'error');
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de l\'export du document', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Aperçu du rapport</h2>
          <p className="text-sm sm:text-base text-slate-600">Visualisation finale du rapport d'expertise</p>
        </div>
        <button
          onClick={handleExportDocx}
          disabled={exporting}
          className="px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 shadow-sm flex-shrink-0"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Export en cours...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>Exporter en DOCX</span>
            </>
          )}
        </button>
      </div>

      <div id="report-content" className="bg-white rounded-lg shadow-sm print:shadow-none">
        <div className="max-w-4xl mx-auto">
          {Object.entries(sections).map(([key, content]) => {
            if (!content) return null;
            return (
              <div key={key} className="mb-8 sm:mb-10 break-inside-avoid">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-blue-600">
                  {sectionTitles[key as keyof typeof sectionTitles]}
                </h2>
                <MarkdownRenderer content={content as string} />
              </div>
            );
          })}

          {!Object.values(sections).some(Boolean) && (
            <div className="text-center text-slate-400 py-12 sm:py-20 print:hidden">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg">Aucune section générée</p>
              <p className="text-xs sm:text-sm mt-2 px-4">
                Revenez aux étapes précédentes pour générer les sections du rapport
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
