import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useActivityLogger } from '../contexts/ActivityLoggerContext';
import { supabase } from '../lib/supabase';
import { DossierType } from '../lib/types';
import { ArrowLeft, Ship, Container, Clipboard, Save, FileText, Anchor } from 'lucide-react';
import { DocumentUploader } from '../components/DocumentUploader';

const vesselTypes = [
  'cargo',
  'tanker',
  'container_ship',
  'yacht',
  'trawler',
  'tugboat',
  'barge',
  'ferry',
  'fishing_vessel',
  'passenger_ship',
  'other',
];

interface UploadedDocumentData {
  file: File;
  extractedText: string | null;
  metadata: any;
}

export function NewDossierPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const { logActivity } = useActivityLogger();
  const [loading, setLoading] = useState(false);
  const [historicalContext, setHistoricalContext] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocumentData[]>([]);

  const [formData, setFormData] = useState({
    type: 'vessel_evaluation' as DossierType,
    vessel_name: '',
    vessel_type: '',
    imo_number: '',
    flag: '',
    port: '',
    owner: '',
    insurer: '',
    incident_date: '',
    inspection_date: '',
    notes: '',
  });

  const handleFileProcessed = (file: File, extractedText: string | null, metadata: any) => {
    setUploadedDocuments(prev => {
      const updated = [...prev, { file, extractedText, metadata }];
      return updated;
    });

    logActivity('file_stored_for_save', 'info', {
      fileName: file.name,
      hasExtractedText: !!extractedText,
      metadataKeys: Object.keys(metadata || {}).length,
    });
  };

  const handleDocumentsProcessed = (extractedDataArray: any[]) => {
    if (extractedDataArray.length === 0) return;

    logActivity('extracted_data_received', 'info', {
      data: extractedDataArray,
    });

    logActivity('documents_processed', 'success', {
      count: extractedDataArray.length,
    });

    const mergedData: any = {};
    const contexts: string[] = [];

    extractedDataArray.forEach((data) => {
      Object.keys(data).forEach((key) => {
        if (data[key] && data[key] !== 'null' && data[key] !== null) {
          if (key === 'historical_context' && data[key]) {
            contexts.push(data[key]);
          } else if (!mergedData[key] || mergedData[key] === '') {
            mergedData[key] = data[key];
          }
        }
      });
    });

    const combinedContext = contexts.length > 0
      ? contexts.join('\n\n')
      : '';

    setHistoricalContext(combinedContext);

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        vessel_name: mergedData.vessel_name || prev.vessel_name,
        vessel_type: mergedData.vessel_type || prev.vessel_type,
        imo_number: mergedData.imo_number || prev.imo_number,
        flag: mergedData.flag || prev.flag,
        port: mergedData.port || prev.port,
        owner: mergedData.owner || prev.owner,
        notes: combinedContext || prev.notes,
      };
      logActivity('form_data_updated', 'info', {
        newFormData,
      });
      return newFormData;
    });

    logActivity('form_auto_filled', 'info', {
      vessel_name: mergedData.vessel_name,
      vessel_type: mergedData.vessel_type,
    });
  };

  const saveDocumentsToDossier = async (dossierId: string) => {
    if (uploadedDocuments.length === 0) return;

    logActivity('saving_documents_to_dossier', 'info', {
      dossierId,
      documentCount: uploadedDocuments.length,
    });

    const errors: string[] = [];

    for (const docData of uploadedDocuments) {
      try {
        const fileExt = docData.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `public/${dossierId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, docData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          showToast(`Erreur lors de l'envoi du fichier ${docData.file.name}`, 'error');
          throw new Error(`Erreur upload storage: ${uploadError.message}`);
        }

        const { data: docRecord, error: dbError } = await supabase
          .from('documents')
          .insert({
            dossier_id: dossierId,
            user_id: user?.id ?? null,
            file_name: docData.file.name,
            file_path: filePath,
            file_type: docData.file.type,
            file_size: docData.file.size,
            storage_path: filePath,
            extraction_status: 'completed',
            extracted_text: docData.extractedText,
            metadata: docData.metadata,
          })
          .select()
          .single();

        if (dbError) {
          showToast(`Erreur lors de l'enregistrement du document ${docData.file.name}`, 'error');
          throw new Error(`Erreur DB: ${dbError.message}`);
        }

        logActivity('document_saved', 'success', {
          fileName: docData.file.name,
          dossierId,
          documentId: docRecord?.id,
        });
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
        showToast(`Erreur lors de la sauvegarde du document ${docData.file.name}`, 'error');
        errors.push(`${docData.file.name}: ${errorMsg}`);

        logActivity('document_save_failed', 'error', {
          fileName: docData.file.name,
          error: errorMsg,
        });
      }
    }

    if (errors.length > 0) {
      showToast(`Certains documents n'ont pas pu être sauvegardés`, 'error');
    }

    logActivity('all_documents_saved', errors.length === 0 ? 'success' : 'warning', {
      dossierId,
      totalCount: uploadedDocuments.length,
      savedCount: uploadedDocuments.length - errors.length,
      failedCount: errors.length,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    logActivity('dossier_creation_started', 'info', {
      type: formData.type,
      vessel_name: formData.vessel_name,
    });

    try {
      const { data, error } = await supabase
        .from('dossiers')
        .insert({
          user_id: null,
          type: formData.type,
          vessel_name: formData.vessel_name || null,
          vessel_type: formData.vessel_type || null,
          imo_number: formData.imo_number || null,
          flag: formData.flag || null,
          port: formData.port || null,
          owner: formData.owner || null,
          insurer: formData.insurer || null,
          incident_date: formData.incident_date || null,
          inspection_date: formData.inspection_date || null,
          notes: formData.notes || null,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        showToast(`Erreur lors de la création du dossier: ${error.message}`, 'error');
        logActivity('dossier_creation_failed', 'error', {
          error: error.message,
          code: error.code,
          details: error.details,
        });
        throw new Error(`Erreur de base de données: ${error.message}`);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée après la création du dossier');
      }

      logActivity('dossier_created', 'success', {
        dossier_id: data.id,
        vessel_name: data.vessel_name,
        type: data.type,
      }, 'dossier', data.id);

      if (uploadedDocuments.length > 0) {
        await saveDocumentsToDossier(data.id);
      }

      navigate(`/dossiers/${data.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';

      showToast(`Erreur lors de la création du dossier: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={() => navigate('/dossiers')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Nouveau dossier</h1>
          <p className="text-sm sm:text-base text-slate-600 truncate">Créez un nouveau dossier d'expertise maritime</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-start sm:items-center space-x-3 mb-4 sm:mb-6">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Documents historiques du navire</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Téléchargez des documents pour extraction automatique des informations.
                Les fichiers seront sauvegardés lors de la création du dossier.
              </p>
            </div>
          </div>

          {uploadedDocuments.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              {uploadedDocuments.length} document(s) prêt(s) à être sauvegardé(s) lors de la création du dossier
            </div>
          )}

          <DocumentUploader
            onDocumentsProcessed={handleDocumentsProcessed}
            onFileProcessed={handleFileProcessed}
          />

          {historicalContext && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Contexte historique extrait:</h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{historicalContext}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6">Type de dossier</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <label
              className={`relative flex flex-col items-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
                formData.type === 'vessel_incident'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="vessel_incident"
                checked={formData.type === 'vessel_incident'}
                onChange={handleChange}
                className="sr-only"
              />
              <Ship className={`w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 ${formData.type === 'vessel_incident' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`font-semibold text-center text-sm sm:text-base ${formData.type === 'vessel_incident' ? 'text-blue-600' : 'text-slate-700'}`}>
                Sinistre navire
              </span>
              <span className="text-xs text-slate-500 mt-1 text-center">Expertise après incident</span>
            </label>

            <label
              className={`relative flex flex-col items-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
                formData.type === 'container_incident'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="container_incident"
                checked={formData.type === 'container_incident'}
                onChange={handleChange}
                className="sr-only"
              />
              <Container className={`w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 ${formData.type === 'container_incident' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`font-semibold text-center text-sm sm:text-base ${formData.type === 'container_incident' ? 'text-blue-600' : 'text-slate-700'}`}>
                Sinistre container
              </span>
              <span className="text-xs text-slate-500 mt-1 text-center">Dommages marchandises</span>
            </label>

            <label
              className={`relative flex flex-col items-center p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
                formData.type === 'vessel_evaluation'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="vessel_evaluation"
                checked={formData.type === 'vessel_evaluation'}
                onChange={handleChange}
                className="sr-only"
              />
              <Clipboard className={`w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 ${formData.type === 'vessel_evaluation' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`font-semibold text-center text-sm sm:text-base ${formData.type === 'vessel_evaluation' ? 'text-blue-600' : 'text-slate-700'}`}>
                Évaluation navire
              </span>
              <span className="text-xs text-slate-500 mt-1 text-center">Diagnostic prévente</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <Anchor className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Informations du navire</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="vessel_name" className="block text-sm font-medium text-slate-700 mb-2">
                Nom du navire *
              </label>
              <input
                type="text"
                id="vessel_name"
                name="vessel_name"
                value={formData.vessel_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: MV Atlantic Explorer"
              />
            </div>

            <div>
              <label htmlFor="vessel_type" className="block text-sm font-medium text-slate-700 mb-2">
                Type de navire
              </label>
              <select
                id="vessel_type"
                name="vessel_type"
                value={formData.vessel_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Sélectionner un type</option>
                {vesselTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="imo_number" className="block text-sm font-medium text-slate-700 mb-2">
                Numéro IMO
              </label>
              <input
                type="text"
                id="imo_number"
                name="imo_number"
                value={formData.imo_number}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: IMO 1234567"
              />
            </div>

            <div>
              <label htmlFor="flag" className="block text-sm font-medium text-slate-700 mb-2">
                Pavillon
              </label>
              <input
                type="text"
                id="flag"
                name="flag"
                value={formData.flag}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Panama"
              />
            </div>

            <div>
              <label htmlFor="port" className="block text-sm font-medium text-slate-700 mb-2">
                Port
              </label>
              <input
                type="text"
                id="port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Le Havre"
              />
            </div>

            <div>
              <label htmlFor="owner" className="block text-sm font-medium text-slate-700 mb-2">
                Armateur
              </label>
              <input
                type="text"
                id="owner"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Atlantic Shipping Ltd"
              />
            </div>

            <div>
              <label htmlFor="insurer" className="block text-sm font-medium text-slate-700 mb-2">
                Assureur
              </label>
              <input
                type="text"
                id="insurer"
                name="insurer"
                value={formData.insurer}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: Maritime Insurance Co."
              />
            </div>

            {formData.type !== 'vessel_evaluation' && (
              <div>
                <label htmlFor="incident_date" className="block text-sm font-medium text-slate-700 mb-2">
                  Date du sinistre
                </label>
                <input
                  type="date"
                  id="incident_date"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label htmlFor="inspection_date" className="block text-sm font-medium text-slate-700 mb-2">
                Date d'inspection
              </label>
              <input
                type="date"
                id="inspection_date"
                name="inspection_date"
                value={formData.inspection_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="Informations complémentaires..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 sticky bottom-4 sm:bottom-6 bg-white rounded-xl shadow-lg border border-slate-200 p-3 sm:p-4">
          <button
            type="button"
            onClick={() => navigate('/dossiers')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-slate-300 rounded-lg font-semibold text-sm sm:text-base text-slate-700 hover:bg-slate-50 transition-all order-2 sm:order-1"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{loading ? 'Création en cours...' : 'Créer le dossier'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
