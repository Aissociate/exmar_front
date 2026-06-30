import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Loader2, Play, Pause, Sparkles, RefreshCw, CreditCard as Edit2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface QuestionAudioRecorderProps {
  dossierId: string;
  questionId: string;
  onTranscriptionUpdate?: (transcription: string) => void;
}

interface AudioRecording {
  id: string;
  storage_path: string;
  file_name: string;
  duration: number;
  transcription: string | null;
  transcription_status: string;
  ai_analysis: string | null;
  ai_analysis_status: string;
  created_at: string;
}

export function QuestionAudioRecorder({ dossierId, questionId, onTranscriptionUpdate }: QuestionAudioRecorderProps) {
  const { user } = useAuth();
  const { showToast, showConfirm } = useNotification();
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);
  const [retryingTranscriptionId, setRetryingTranscriptionId] = useState<string | null>(null);
  const [editingTranscriptionId, setEditingTranscriptionId] = useState<string | null>(null);
  const [editedTranscription, setEditedTranscription] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadRecordings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [dossierId, questionId]);

  const loadRecordings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('questionnaire_audio')
        .select('*')
        .eq('dossier_id', dossierId)
        .eq('question_id', questionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);

      const allTranscriptions = data
        ?.filter(r => r.transcription)
        .map(r => r.transcription)
        .join('\n\n');

      if (allTranscriptions && onTranscriptionUpdate) {
        onTranscriptionUpdate(allTranscriptions);
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur inconnue', 'error');
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Votre navigateur ne supporte pas l\'enregistrement audio. Utilisez un navigateur moderne (Chrome, Firefox, Safari).', 'error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!window.MediaRecorder) {
        showToast('Votre navigateur ne supporte pas l\'enregistrement audio.', 'error');
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      let mimeType = 'audio/webm';
      const supportedTypes = [
        'audio/wav',
        'audio/webm;codecs=opus',
        'audio/webm',
      ];

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await uploadRecording(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (error: unknown) {
      let errorMessage = 'Impossible d\'accéder au microphone.';
      const errorName = error instanceof DOMException ? error.name : '';

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        errorMessage = 'Permission refusée. Autorisez l\'accès au microphone dans les paramètres de votre navigateur.';
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        errorMessage = 'Aucun microphone détecté sur cet appareil.';
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        errorMessage = 'Le microphone est déjà utilisé par une autre application.';
      } else if (errorName === 'SecurityError') {
        errorMessage = 'Erreur de sécurité. Assurez-vous d\'utiliser HTTPS.';
      }

      showToast(errorMessage, 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const uploadRecording = async (blob: Blob) => {
    setLoading(true);

    try {
      const fileName = `${dossierId}/${questionId}/${Date.now()}.webm`;
      const filePath = `questionnaire-audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('questionnaire-media')
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: audioData, error: dbError } = await supabase
        .from('questionnaire_audio')
        .insert({
          dossier_id: dossierId,
          question_id: questionId,
          storage_path: filePath,
          file_name: `Audio_${Date.now()}.webm`,
          file_size: blob.size,
          duration: recordingTime,
          transcription_status: 'pending',
          user_id: user?.id,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await requestTranscription(audioData.id, filePath);
      await loadRecordings();
    } catch (error: unknown) {
      showToast(`Erreur lors de l'enregistrement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestTranscription = async (audioId: string, storagePath: string) => {
    try {
      await supabase
        .from('questionnaire_audio')
        .update({ transcription_status: 'processing' })
        .eq('id', audioId)
        .eq('user_id', user?.id);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_id: audioId,
          storage_path: storagePath,
        }),
      });

      if (!response.ok) {
        throw new Error('Transcription request failed');
      }
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de la transcription', 'error');
      await supabase
        .from('questionnaire_audio')
        .update({ transcription_status: 'failed' })
        .eq('id', audioId)
        .eq('user_id', user?.id);
    }
  };

  const retryTranscription = async (audioId: string, storagePath: string) => {
    try {
      setRetryingTranscriptionId(audioId);

      await supabase
        .from('questionnaire_audio')
        .update({ transcription_status: 'processing', transcription: null })
        .eq('id', audioId)
        .eq('user_id', user?.id);

      await requestTranscription(audioId, storagePath);
      await loadRecordings();
    } catch (error: unknown) {
      showToast('Erreur lors de la nouvelle tentative de transcription', 'error');
    } finally {
      setRetryingTranscriptionId(null);
    }
  };

  const requestAnalysis = async (audioId: string) => {
    try {
      setAnalyzingId(audioId);

      await supabase
        .from('questionnaire_audio')
        .update({ ai_analysis_status: 'processing' })
        .eq('id', audioId)
        .eq('user_id', user?.id);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-audio`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_id: audioId,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis request failed');
      }

      await loadRecordings();
      setExpandedAnalysisId(audioId);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de l\'analyse', 'error');
      await supabase
        .from('questionnaire_audio')
        .update({ ai_analysis_status: 'failed' })
        .eq('id', audioId)
        .eq('user_id', user?.id);
    } finally {
      setAnalyzingId(null);
    }
  };

  const deleteRecording = (recordingId: string, storagePath: string) => {
    showConfirm('Supprimer cet enregistrement ?', async () => {
      try {
        await supabase.storage.from('questionnaire-media').remove([storagePath]);

        const { error } = await supabase
          .from('questionnaire_audio')
          .delete()
          .eq('id', recordingId)
          .eq('user_id', user?.id);

        if (error) throw error;

        await loadRecordings();
      } catch (error: unknown) {
        showToast(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
      }
    }, 'Suppression');
  };

  const togglePlay = async (recording: AudioRecording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const { data } = supabase.storage
        .from('questionnaire-media')
        .getPublicUrl(recording.storage_path);

      const audio = new Audio(data.publicUrl);
      audioRef.current = audio;

      audio.onended = () => setPlayingId(null);
      audio.play();
      setPlayingId(recording.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startEditingTranscription = (recording: AudioRecording) => {
    setEditingTranscriptionId(recording.id);
    setEditedTranscription(recording.transcription || '');
  };

  const cancelEditingTranscription = () => {
    setEditingTranscriptionId(null);
    setEditedTranscription('');
  };

  const saveTranscription = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('questionnaire_audio')
        .update({ transcription: editedTranscription })
        .eq('id', recordingId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadRecordings();
      setEditingTranscriptionId(null);
      setEditedTranscription('');
    } catch (error: unknown) {
      showToast(`Erreur lors de la mise à jour: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Mic className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700">
            Commentaires audio ({recordings.length})
          </span>
        </div>
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={loading}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span>Enregistrer</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-mono text-red-600">{formatTime(recordingTime)}</span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs sm:text-sm rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Square className="w-4 h-4" />
              <span>Arrêter</span>
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-slate-600">Traitement en cours...</span>
        </div>
      )}

      {recordings.length > 0 && (
        <div className="space-y-2">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex items-center space-x-3 flex-1">
                <button
                  type="button"
                  onClick={() => togglePlay(recording)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {playingId === recording.id ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-slate-900">{recording.file_name}</p>
                    <span className="text-xs text-slate-500">{formatTime(recording.duration)}</span>
                  </div>
                  {recording.transcription_status === 'processing' && (
                    <p className="text-xs text-blue-600 mt-1">Transcription en cours...</p>
                  )}
                  {recording.transcription_status === 'completed' && recording.transcription && (
                    <div className="mt-1">
                      {editingTranscriptionId === recording.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editedTranscription}
                            onChange={(e) => setEditedTranscription(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs text-slate-700 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                          />
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => saveTranscription(recording.id)}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Enregistrer</span>
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingTranscription}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              <span>Annuler</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative">
                          <p className="text-xs text-slate-600 pr-8">{recording.transcription}</p>
                          <button
                            type="button"
                            onClick={() => startEditingTranscription(recording)}
                            className="absolute top-0 right-0 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Modifier la transcription"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {recording.ai_analysis_status === 'completed' && recording.ai_analysis && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setExpandedAnalysisId(expandedAnalysisId === recording.id ? null : recording.id)}
                            className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Analyse IA</span>
                          </button>
                          {expandedAnalysisId === recording.id && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs text-slate-700 whitespace-pre-wrap">{recording.ai_analysis}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {recording.transcription_status === 'failed' && (
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="text-xs text-red-600">Échec de la transcription</p>
                      <button
                        type="button"
                        onClick={() => retryTranscription(recording.id, recording.storage_path)}
                        disabled={retryingTranscriptionId === recording.id}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                        title="Réessayer la transcription"
                      >
                        {retryingTranscriptionId === recording.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Réessai...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3 h-3" />
                            <span>Réessayer</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {recording.transcription_status === 'completed' && recording.transcription && recording.ai_analysis_status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => requestAnalysis(recording.id)}
                    disabled={analyzingId === recording.id}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Analyser avec IA"
                  >
                    {analyzingId === recording.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteRecording(recording.id, recording.storage_path)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
