import { useState, useEffect } from 'react';
import { CheckCircle, Circle, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { QUESTIONNAIRES, VesselQuestionnaireType, QuestionnaireSection } from '../lib/vesselQuestionnaires';
import { QuestionPhotoCapture } from './QuestionPhotoCapture';
import { QuestionAudioRecorder } from './QuestionAudioRecorder';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export type CheckStatus = 'RAS' | 'AS' | 'D' | 'NA';

interface QuestionnaireState {
  [itemId: number]: {
    status: CheckStatus;
    comment: string;
  };
}

interface VesselQuestionnaireProps {
  questionnaireType: VesselQuestionnaireType;
  dossierId?: string;
  onDataChange?: (data: QuestionnaireState) => void;
}

const STATUS_CONFIG: Record<CheckStatus, { label: string; icon: typeof Circle; color: string; bgColor: string }> = {
  RAS: {
    label: 'Rien à signaler',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100 border-green-300',
  },
  AS: {
    label: 'À surveiller',
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100 border-amber-300',
  },
  D: {
    label: 'Défectueux',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100 border-red-300',
  },
  NA: {
    label: 'Non applicable',
    icon: HelpCircle,
    color: 'text-slate-400',
    bgColor: 'bg-slate-50 hover:bg-slate-100 border-slate-300',
  },
};

export function VesselQuestionnaire({ questionnaireType, dossierId, onDataChange }: VesselQuestionnaireProps) {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireState>({});
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [, setIsLoading] = useState(true);

  const sections = QUESTIONNAIRES[questionnaireType];

  useEffect(() => {
    if (dossierId) {
      loadChecklistResponses();
    } else {
      setIsLoading(false);
    }
  }, [dossierId]);

  const loadChecklistResponses = async () => {
    if (!dossierId || !user) return;

    try {
      const { data, error } = await supabase
        .from('questionnaire_checklist_responses')
        .select('item_id, status, comment')
        .eq('dossier_id', dossierId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const loadedData: QuestionnaireState = {};
        data.forEach((response) => {
          loadedData[response.item_id] = {
            status: response.status as CheckStatus,
            comment: response.comment || '',
          };
        });
        setQuestionnaireData(loadedData);
        onDataChange?.(loadedData);
      }
    } catch {
      showToast('Erreur lors du chargement du questionnaire', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (itemId: number, status: CheckStatus, comment: string = '') => {
    const newData = {
      ...questionnaireData,
      [itemId]: { status, comment },
    };
    setQuestionnaireData(newData);
    onDataChange?.(newData);

    if (dossierId && user) {
      try {
        const { error } = await supabase
          .from('questionnaire_checklist_responses')
          .upsert({
            dossier_id: dossierId,
            item_id: itemId,
            status,
            comment,
            user_id: user.id,
          }, {
            onConflict: 'dossier_id,item_id',
          });

        if (error) throw error;
      } catch {
        showToast('Erreur lors de la sauvegarde', 'error');
      }
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionStats = (section: QuestionnaireSection) => {
    const stats = { RAS: 0, AS: 0, D: 0, NA: 0, total: section.items.length };
    section.items.forEach((item) => {
      const itemData = questionnaireData[item.id];
      if (itemData) {
        stats[itemData.status]++;
      }
    });
    return stats;
  };

  const getStatusButton = (itemId: number, status: CheckStatus) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;
    const isActive = questionnaireData[itemId]?.status === status;

    return (
      <button
        type="button"
        onClick={() => updateItem(itemId, status, questionnaireData[itemId]?.comment || '')}
        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-1.5 ${
          isActive
            ? `${config.bgColor} border-opacity-100 shadow-sm`
            : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
        title={config.label}
      >
        <Icon className={`w-4 h-4 ${isActive ? config.color : 'text-slate-400'}`} />
        <span className={`text-xs font-medium ${isActive ? config.color : 'text-slate-500'}`}>
          {status}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">
              Questionnaire de contrôle
            </h3>
            <p className="text-sm text-blue-700">
              Remplissez chaque point de contrôle avec le statut approprié et ajoutez des commentaires si nécessaire.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center space-x-1.5">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="text-xs font-medium text-slate-700">
                      <span className={config.color}>{key}</span> - {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.has(sectionIndex);
        const stats = getSectionStats(section);
        const progress = stats.total > 0
          ? ((stats.RAS + stats.AS + stats.D + stats.NA) / stats.total) * 100
          : 0;

        return (
          <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(sectionIndex)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-3">
                  <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                    {stats.RAS + stats.AS + stats.D + stats.NA} / {stats.total}
                  </span>
                </div>
                {progress > 0 && (
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{Math.round(progress)}%</span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 space-y-3">
                {section.items.map((item) => {
                  const itemData = questionnaireData[item.id];

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        itemData?.status
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-slate-200 bg-white hover:border-blue-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mt-1">
                          <span className="text-xs font-bold text-slate-600">{item.id}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 mb-3 leading-relaxed">
                            {item.label}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {getStatusButton(item.id, 'RAS')}
                            {getStatusButton(item.id, 'AS')}
                            {getStatusButton(item.id, 'D')}
                            {getStatusButton(item.id, 'NA')}
                          </div>

                          {itemData?.status && (
                            <div className="mt-3 space-y-3">
                              <textarea
                                value={itemData.comment}
                                onChange={(e) => updateItem(item.id, itemData.status, e.target.value)}
                                placeholder="Commentaires (optionnel)..."
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                              />

                              {dossierId && (
                                <>
                                  <QuestionPhotoCapture
                                    dossierId={dossierId}
                                    questionId={`q_${item.id}`}
                                  />

                                  <QuestionAudioRecorder
                                    dossierId={dossierId}
                                    questionId={`q_${item.id}`}
                                    onTranscriptionUpdate={(transcription) => {
                                      const currentComment = itemData.comment || '';
                                      const separator = currentComment ? '\n\n---\n\n' : '';
                                      updateItem(item.id, itemData.status, currentComment + separator + transcription);
                                    }}
                                  />
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
