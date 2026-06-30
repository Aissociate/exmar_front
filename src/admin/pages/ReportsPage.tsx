import { useEffect, useState } from 'react';
import { FileText, Eye, Download, Calendar, Ship, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { exportToDocx } from '../lib/docxExporter';

export function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, showConfirm } = useNotification();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const { data: reportsData, error } = await supabase
        .from('expertise_reports')
        .select(`
          *,
          dossier:dossiers(
            vessel_name,
            vessel_type,
            incident_date
          )
        `)
        .eq('expert_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(reportsData || []);
    } catch {
      showToast('Erreur lors du chargement des rapports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = (report: any) => {
    const sections = [
      report.identification_section,
      report.contexte_section,
      report.constatations_section,
      report.analyse_section,
      report.estimation_section,
    ];
    const completed = sections.filter(s => s && s.trim()).length;
    return Math.round((completed / sections.length) * 100);
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage === 100) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Terminé</span>;
    } else if (percentage > 0) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">En cours ({percentage}%)</span>;
    } else {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">Non commencé</span>;
    }
  };

  const handleDeleteReport = (reportId: string) => {
    showConfirm('Cette action est irréversible. Voulez-vous continuer ?', async () => {
      setDeleting(reportId);
      try {
        const { error } = await supabase
          .from('expertise_reports')
          .delete()
          .eq('id', reportId)
          .eq('expert_id', user?.id);

        if (error) throw error;

        setReports(prev => prev.filter(r => r.id !== reportId));
        showToast('Rapport supprimé', 'success');
      } catch {
        showToast('Erreur lors de la suppression du rapport', 'error');
      } finally {
        setDeleting(null);
      }
    }, 'Supprimer le rapport');
  };

  const handleDownloadReport = async (report: any) => {
    setDownloading(report.id);
    try {
      const sectionTitles = {
        expert_presentation: "L'EXPERT",
        identification: 'I - Identification du navire',
        contexte: 'II - Contexte et historique',
        constatations: 'III - Constatations',
        analyse: 'IV - Analyse technique',
        estimation: 'V - Estimation',
      };

      const sections = Object.entries({
        expert_presentation: report.expert_presentation_section,
        identification: report.identification_section,
        contexte: report.contexte_section,
        constatations: report.constatations_section,
        analyse: report.analyse_section,
        estimation: report.estimation_section,
      })
        .filter(([, content]) => content)
        .map(([key, content]) => ({
          title: sectionTitles[key as keyof typeof sectionTitles],
          content: content as string,
        }));

      await exportToDocx(
        { sections },
        `rapport_expertise_${report.dossier?.vessel_name || 'navire'}_${new Date().toISOString().split('T')[0]}.docx`
      );
    } catch {
      showToast('Erreur lors du téléchargement du rapport', 'error');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rapports d'expertise</h1>
        <p className="text-slate-600 mt-1">Consultez et gérez vos rapports d'expertise maritimes</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucun rapport</h3>
          <p className="text-slate-600">
            Les rapports générés à partir de vos dossiers apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => {
            const completion = getCompletionPercentage(report);
            return (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Rapport d'expertise - {report.dossier?.vessel_name || 'Navire'}
                        </h3>
                        {getStatusBadge(completion)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Ship className="w-4 h-4" />
                          <span>{report.dossier?.vessel_type || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      {completion > 0 && completion < 100 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>Progression</span>
                            <span>{completion}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/reports/${report.id}/wizard`)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {completion === 100 ? (
                        <>
                          <Eye className="w-4 h-4 flex-shrink-0" />
                          <span>Voir</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span>Continuer</span>
                        </>
                      )}
                    </button>
                    {completion === 100 && (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        disabled={downloading === report.id}
                        className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {downloading === report.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                            <span className="hidden sm:inline">Téléchargement...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={deleting === report.id}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleting === report.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                          <span className="hidden sm:inline">Suppression...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden sm:inline">Supprimer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
