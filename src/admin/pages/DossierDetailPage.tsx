import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useActivityLogger } from '../contexts/ActivityLoggerContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { Dossier, DossierStatus } from '../lib/types';
import { ArrowLeft, FileText, Image, Mic, Upload, ClipboardList, CreditCard as Edit2, Save, X, Trash2, AlertTriangle, Ship } from 'lucide-react';
import { VesselQuestionnaire } from '../components/VesselQuestionnaire';
import { DocumentsTab } from '../components/DocumentsTab';
import { VESSEL_QUESTIONNAIRE_TYPES, VESSEL_DIVISIONS, VesselQuestionnaireType, VesselDivision, getQuestionnaireTypesByDivision } from '../lib/vesselQuestionnaires';

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

const statusOptions: DossierStatus[] = ['draft', 'in_progress', 'report_generated', 'archived'];

export function DossierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logActivity } = useActivityLogger();
  const { showToast } = useNotification();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'questionnaire' | 'photos' | 'audio' | 'report'>('info');
  const [selectedDivision, setSelectedDivision] = useState<VesselDivision | null>(null);
  const [selectedQuestionnaireType, setSelectedQuestionnaireType] = useState<VesselQuestionnaireType | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [isSavingQuestionnaire, setIsSavingQuestionnaire] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [audioRecordings, setAudioRecordings] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [existingReport, setExistingReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [editForm, setEditForm] = useState({
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
    status: 'draft' as DossierStatus,
  });

  useEffect(() => {
    if (user && id) {
      loadDossier();
    }
  }, [user, id]);

  useEffect(() => {
    if (activeTab === 'photos') {
      loadPhotos();
    } else if (activeTab === 'audio') {
      loadAudioRecordings();
    } else if (activeTab === 'report') {
      loadExistingReport();
    }
  }, [activeTab, id]);

  const loadPhotos = async () => {
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from('questionnaire_photos')
        .select('*')
        .eq('dossier_id', id)
        .order('question_id', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du chargement des photos', 'error');
    } finally {
      setLoadingMedia(false);
    }
  };

  const loadExistingReport = async () => {
    setLoadingReport(true);
    try {
      const { data, error } = await supabase
        .from('expertise_reports')
        .select('*')
        .eq('dossier_id', id)
        .eq('expert_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setExistingReport(data);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du chargement du rapport', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

  const loadAudioRecordings = async () => {
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from('questionnaire_audio')
        .select('*')
        .eq('dossier_id', id)
        .eq('transcription_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudioRecordings(data || []);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du chargement des enregistrements audio', 'error');
    } finally {
      setLoadingMedia(false);
    }
  };

  const loadDossier = async () => {
    try {
      const { data, error } = await supabase
        .from('dossiers')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setDossier(data);

      setEditForm({
        vessel_name: data.vessel_name || '',
        vessel_type: data.vessel_type || '',
        imo_number: data.imo_number || '',
        flag: data.flag || '',
        port: data.port || '',
        owner: data.owner || '',
        insurer: data.insurer || '',
        incident_date: data.incident_date || '',
        inspection_date: data.inspection_date || '',
        notes: data.notes || '',
        status: data.status,
      });

      if (data.questionnaire_type) {
        const qType = data.questionnaire_type as VesselQuestionnaireType;
        setSelectedQuestionnaireType(qType);

        const qConfig = VESSEL_QUESTIONNAIRE_TYPES[qType];
        if (qConfig?.division) {
          setSelectedDivision(qConfig.division);
        }
      }
      if (data.questionnaire_data) {
        setQuestionnaireData(data.questionnaire_data);
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du chargement du dossier', 'error');
      logActivity('dossier_load_failed', 'error', { error: error instanceof Error ? error.message : 'Erreur inconnue' });
      navigate('/dossiers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    logActivity('dossier_edit_started', 'info', { dossier_id: id }, 'dossier', id);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (dossier) {
      setEditForm({
        vessel_name: dossier.vessel_name || '',
        vessel_type: dossier.vessel_type || '',
        imo_number: dossier.imo_number || '',
        flag: dossier.flag || '',
        port: dossier.port || '',
        owner: dossier.owner || '',
        insurer: dossier.insurer || '',
        incident_date: dossier.incident_date || '',
        inspection_date: dossier.inspection_date || '',
        notes: dossier.notes || '',
        status: dossier.status,
      });
    }
    logActivity('dossier_edit_cancelled', 'info', { dossier_id: id }, 'dossier', id);
  };

  const handleSave = async () => {
    if (!dossier) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('dossiers')
        .update({
          vessel_name: editForm.vessel_name || null,
          vessel_type: editForm.vessel_type || null,
          imo_number: editForm.imo_number || null,
          flag: editForm.flag || null,
          port: editForm.port || null,
          owner: editForm.owner || null,
          insurer: editForm.insurer || null,
          incident_date: editForm.incident_date || null,
          inspection_date: editForm.inspection_date || null,
          notes: editForm.notes || null,
          status: editForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadDossier();
      setIsEditing(false);

      logActivity('dossier_updated', 'success', {
        dossier_id: id,
        vessel_name: editForm.vessel_name,
        status: editForm.status,
      }, 'dossier', id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      showToast(`Erreur lors de la mise à jour: ${message}`, 'error');
      logActivity('dossier_update_failed', 'error', {
        error: message,
        dossier_id: id,
      }, 'dossier', id);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dossier) return;

    try {
      const { error } = await supabase
        .from('dossiers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      logActivity('dossier_deleted', 'warning', {
        dossier_id: id,
        vessel_name: dossier.vessel_name,
      }, 'dossier', id);

      navigate('/dossiers');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      showToast(`Erreur lors de la suppression: ${message}`, 'error');
      logActivity('dossier_delete_failed', 'error', {
        error: message,
        dossier_id: id,
      }, 'dossier', id);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveQuestionnaire = async () => {
    if (!dossier || !selectedQuestionnaireType) return;

    setIsSavingQuestionnaire(true);

    try {
      const { error } = await supabase
        .from('dossiers')
        .update({
          questionnaire_type: selectedQuestionnaireType,
          questionnaire_data: questionnaireData || {},
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadDossier();

      logActivity('questionnaire_saved', 'success', {
        dossier_id: id,
        questionnaire_type: selectedQuestionnaireType,
      }, 'dossier', id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      showToast(`Erreur lors de la sauvegarde du questionnaire: ${message}`, 'error');
      logActivity('questionnaire_save_failed', 'error', {
        error: message,
        dossier_id: id,
      }, 'dossier', id);
    } finally {
      setIsSavingQuestionnaire(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return null;
  }

  const tabs = [
    { id: 'info' as const, label: 'Informations', icon: FileText },
    { id: 'documents' as const, label: 'Documents', icon: Upload },
    { id: 'questionnaire' as const, label: 'Questionnaire', icon: ClipboardList },
    { id: 'photos' as const, label: 'Photos', icon: Image },
    { id: 'audio' as const, label: 'Commentaires audio', icon: Mic },
    { id: 'report' as const, label: 'Rapport', icon: FileText },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <button
            onClick={() => navigate('/dossiers')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{dossier.vessel_name || 'Sans nom'}</h1>
            <p className="text-sm sm:text-base text-slate-600">Dossier N° {dossier.dossier_number}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Modifier</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Annuler</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Confirmer la suppression
                </h3>
                <p className="text-slate-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer le dossier <strong>{dossier.vessel_name || 'Sans nom'}</strong> ?
                  Cette action est irréversible.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex overflow-x-auto gap-1 p-2 scrollbar-hide" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'info' && (
            <div className="space-y-4 sm:space-y-6">
              {isEditing ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="vessel_name" className="block text-sm font-medium text-slate-700 mb-2">
                        Nom du navire
                      </label>
                      <input
                        type="text"
                        id="vessel_name"
                        name="vessel_name"
                        value={editForm.vessel_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: MV Atlantic Explorer"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                        Statut
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={editForm.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="vessel_type" className="block text-sm font-medium text-slate-700 mb-2">
                        Type de navire
                      </label>
                      <select
                        id="vessel_type"
                        name="vessel_type"
                        value={editForm.vessel_type}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={editForm.imo_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={editForm.flag}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={editForm.port}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={editForm.owner}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={editForm.insurer}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Maritime Insurance Co."
                      />
                    </div>

                    {dossier.type !== 'vessel_evaluation' && (
                      <div>
                        <label htmlFor="incident_date" className="block text-sm font-medium text-slate-700 mb-2">
                          Date du sinistre
                        </label>
                        <input
                          type="date"
                          id="incident_date"
                          name="incident_date"
                          value={editForm.incident_date}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        value={editForm.inspection_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={editForm.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Informations complémentaires..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Type de dossier</label>
                    <p className="text-sm sm:text-base text-slate-900">
                      {dossier.type === 'vessel_incident' && 'Sinistre navire'}
                      {dossier.type === 'container_incident' && 'Sinistre container'}
                      {dossier.type === 'vessel_evaluation' && 'Évaluation navire'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Statut</label>
                    <span className={`inline-flex px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      dossier.status === 'draft' ? 'bg-slate-100 text-slate-800' :
                      dossier.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      dossier.status === 'report_generated' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dossier.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  {dossier.vessel_type && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Type de navire</label>
                      <p className="text-sm sm:text-base text-slate-900 capitalize">{dossier.vessel_type.replace(/_/g, ' ')}</p>
                    </div>
                  )}
                  {dossier.imo_number && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Numéro IMO</label>
                      <p className="text-sm sm:text-base text-slate-900">{dossier.imo_number}</p>
                    </div>
                  )}
                  {dossier.flag && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Pavillon</label>
                      <p className="text-sm sm:text-base text-slate-900">{dossier.flag}</p>
                    </div>
                  )}
                  {dossier.port && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Port</label>
                      <p className="text-sm sm:text-base text-slate-900">{dossier.port}</p>
                    </div>
                  )}
                  {dossier.owner && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Armateur</label>
                      <p className="text-sm sm:text-base text-slate-900">{dossier.owner}</p>
                    </div>
                  )}
                  {dossier.insurer && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Assureur</label>
                      <p className="text-sm sm:text-base text-slate-900">{dossier.insurer}</p>
                    </div>
                  )}
                  {dossier.incident_date && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Date du sinistre</label>
                      <p className="text-sm sm:text-base text-slate-900">
                        {new Date(dossier.incident_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {dossier.inspection_date && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Date d'inspection</label>
                      <p className="text-sm sm:text-base text-slate-900">
                        {new Date(dossier.inspection_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {dossier.notes && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Notes</label>
                      <p className="text-sm sm:text-base text-slate-900 whitespace-pre-wrap">{dossier.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentsTab dossierId={id!} />
          )}

          {activeTab === 'questionnaire' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Questionnaire de contrôle</h3>
                {selectedQuestionnaireType && (
                  <button
                    onClick={handleSaveQuestionnaire}
                    disabled={isSavingQuestionnaire}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingQuestionnaire ? 'Enregistrement...' : 'Enregistrer le questionnaire'}</span>
                  </button>
                )}
              </div>

              {!selectedDivision && (
                <div>
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Étape 1: Sélectionnez la division du navire</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.keys(VESSEL_DIVISIONS) as VesselDivision[]).map((division) => {
                      const config = VESSEL_DIVISIONS[division];

                      return (
                        <button
                          key={division}
                          type="button"
                          onClick={() => {
                            setSelectedDivision(division);
                            if (division === 'division_227') {
                              setSelectedQuestionnaireType('division_227_general');
                            } else {
                              setSelectedQuestionnaireType(null);
                            }
                          }}
                          className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-md bg-white transition-all text-left group"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100 group-hover:bg-blue-100 transition-colors">
                              <Ship className="w-7 h-7 text-slate-600 group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold text-slate-900 mb-1">{config.label}</p>
                              <p className="text-sm text-slate-600">{config.description}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedDivision === 'division_240' && !selectedQuestionnaireType && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-slate-900">Étape 2: Type de navire</h4>
                    <button
                      onClick={() => {
                        setSelectedDivision(null);
                        setSelectedQuestionnaireType(null);
                      }}
                      className="text-sm text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Retour aux divisions</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {getQuestionnaireTypesByDivision('division_240').map((type) => {
                      const config = VESSEL_QUESTIONNAIRE_TYPES[type];

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedQuestionnaireType(type)}
                          className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-sm bg-white transition-all text-left"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100">
                              <Ship className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{config.shortLabel}</p>
                              <p className="text-xs mt-1 text-slate-500">{config.label}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedQuestionnaireType ? (
                <div>
                  <div className="flex items-center justify-between mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Ship className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {VESSEL_QUESTIONNAIRE_TYPES[selectedQuestionnaireType].label}
                        </p>
                        <p className="text-xs text-blue-700">
                          {selectedDivision && VESSEL_DIVISIONS[selectedDivision].label}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedDivision === 'division_227') {
                          setSelectedDivision(null);
                        }
                        setSelectedQuestionnaireType(null);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Changer</span>
                    </button>
                  </div>
                  <VesselQuestionnaire
                    questionnaireType={selectedQuestionnaireType}
                    dossierId={id}
                    onDataChange={setQuestionnaireData}
                  />
                </div>
              ) : (
                !selectedDivision && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                    <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">Commencez par sélectionner la division du navire</p>
                    <p className="text-sm text-slate-500 mt-1">Division 227 ou Division 240</p>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              {loadingMedia ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Chargement des photos...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <Image className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Aucune photo pour le moment</p>
                  <p className="text-sm text-slate-500 mt-1">Les photos prises dans le questionnaire apparaîtront ici</p>
                </div>
              ) : (
                <>
                  {(Object.entries(
                    photos.reduce((acc, photo) => {
                      const questionId = photo.question_id;
                      if (!acc[questionId]) acc[questionId] = [];
                      acc[questionId].push(photo);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ) as [string, any[]][]).map(([questionId, questionPhotos]) => {
                    const downloadAllPhotos = async () => {
                      for (const photo of questionPhotos) {
                        try {
                          const { data } = supabase.storage
                            .from('questionnaire-media')
                            .getPublicUrl(photo.storage_path);

                          const response = await fetch(data.publicUrl);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = photo.file_name;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          await new Promise(resolve => setTimeout(resolve, 500));
                        } catch (error: unknown) {
                          showToast(error instanceof Error ? error.message : 'Erreur lors du téléchargement de la photo', 'error');
                        }
                      }
                    };

                    return (
                      <div key={questionId} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">
                                {questionId.replace('q_', '')}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              Question {questionId.replace('q_', '')}
                            </h3>
                            <span className="text-sm text-slate-500">
                              ({questionPhotos.length} photo{questionPhotos.length > 1 ? 's' : ''})
                            </span>
                          </div>
                          <button
                            onClick={downloadAllPhotos}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                            title="Télécharger toutes les photos"
                          >
                            <Upload className="w-4 h-4 transform rotate-180" />
                            <span>Tout télécharger</span>
                          </button>
                        </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {questionPhotos.map((photo) => {
                          const { data } = supabase.storage
                            .from('questionnaire-media')
                            .getPublicUrl(photo.storage_path);

                          const handleDownload = async (e: React.MouseEvent) => {
                            e.stopPropagation();
                            try {
                              const response = await fetch(data.publicUrl);
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = photo.file_name;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error: unknown) {
                              showToast(error instanceof Error ? error.message : 'Erreur lors du téléchargement de la photo', 'error');
                            }
                          };

                          return (
                            <div key={photo.id} className="relative group aspect-square">
                              <img
                                src={data.publicUrl}
                                alt={photo.file_name}
                                className="w-full h-full object-cover rounded-lg border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => window.open(data.publicUrl, '_blank')}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-between p-3">
                                <button
                                  onClick={handleDownload}
                                  className="self-end w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-all"
                                  title="Télécharger"
                                >
                                  <Upload className="w-4 h-4 text-slate-700 transform rotate-180" />
                                </button>
                                <p className="text-white text-xs truncate">{photo.file_name}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              {loadingMedia ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-600">Chargement des enregistrements...</p>
                </div>
              ) : audioRecordings.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <Mic className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Aucun commentaire audio pour le moment</p>
                  <p className="text-sm text-slate-500 mt-1">Les enregistrements audio transcrits apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {audioRecordings.map((recording) => (
                    <div key={recording.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {recording.question_id.replace('q_', '')}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              Question {recording.question_id.replace('q_', '')}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {new Date(recording.created_at).toLocaleString('fr-FR', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mic className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">
                            {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {recording.transcription && (
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                              Transcription
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {recording.transcription}
                          </p>
                        </div>
                      )}

                      <div className="mt-4">
                        <audio
                          controls
                          className="w-full"
                          src={
                            supabase.storage
                              .from('questionnaire-media')
                              .getPublicUrl(recording.storage_path).data.publicUrl
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <div className="text-center py-12">
              {loadingReport ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : existingReport ? (
                <>
                  <FileText className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Rapport d'expertise en cours
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Un rapport d'expertise existe déjà pour ce dossier
                  </p>
                  <button
                    onClick={() => navigate(`/reports/${existingReport.id}/wizard`)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Continuer le rapport</span>
                  </button>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Rapport d'expertise maritime
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Utilisez l'assistant de rédaction pour créer un rapport d'expertise professionnel
                  </p>
                  <button
                    onClick={() => navigate(`/dossiers/${id}/expertise-report`)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Créer le rapport d'expertise</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
