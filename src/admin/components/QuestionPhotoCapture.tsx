import { useState, useRef, useEffect } from 'react';
import { Camera, X, Trash2, Loader2, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface QuestionPhotoCaptureProps {
  dossierId: string;
  questionId: string;
}

interface Photo {
  id: string;
  storage_path: string;
  file_name: string;
  created_at: string;
  signed_url?: string;
}

export function QuestionPhotoCapture({ dossierId, questionId }: QuestionPhotoCaptureProps) {
  const { user } = useAuth();
  const { showToast, showConfirm } = useNotification();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadPhotos();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [dossierId, questionId]);

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : 'Erreur inconnue', 'error');
      });
    }
  }, [showCamera, stream]);

  const loadPhotos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('questionnaire_photos')
        .select('*')
        .eq('dossier_id', dossierId)
        .eq('question_id', questionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: urlData, error: urlError } = await supabase.storage
            .from('questionnaire-media')
            .createSignedUrl(photo.storage_path, 3600);

          if (urlError) {
            return { ...photo, signed_url: '' };
          }

          return { ...photo, signed_url: urlData.signedUrl };
        })
      );

      setPhotos(photosWithUrls);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : 'Erreur inconnue', 'error');
    }
  };

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast('Votre navigateur ne supporte pas l\'acces a la camera. Utilisez un navigateur moderne (Chrome, Firefox, Safari).', 'error');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
      });

      setStream(mediaStream);
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((error: unknown) => {
            showToast(error instanceof Error ? error.message : 'Erreur inconnue', 'error');
          });
        }
      }, 100);
    } catch (error: unknown) {
      let errorMessage = 'Impossible d\'acceder a la camera.';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = 'Permission refusee. Autorisez l\'acces a la camera dans les parametres de votre navigateur.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = 'Aucune camera detectee sur cet appareil.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage = 'La camera est deja utilisee par une autre application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Impossible de satisfaire les contraintes de la camera. Essayez avec une camera differente.';
        } else if (error.name === 'SecurityError') {
          errorMessage = 'Erreur de securite. Assurez-vous d\'utiliser HTTPS.';
        }
      }

      showToast(errorMessage, 'error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    setLoading(true);

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85);
      });

      const fileName = `${dossierId}/${questionId}/${Date.now()}.jpg`;
      const filePath = `questionnaire-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('questionnaire-media')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const insertData = {
        dossier_id: dossierId,
        question_id: questionId,
        storage_path: filePath,
        file_name: `Photo_${Date.now()}.jpg`,
        file_size: blob.size,
        mime_type: 'image/jpeg',
        user_id: user?.id,
      };

      const { error: dbError } = await supabase
        .from('questionnaire_photos')
        .insert(insertData);

      if (dbError) {
        throw dbError;
      }

      await loadPhotos();
      stopCamera();
    } catch (error: unknown) {
      showToast(`Erreur lors de la capture: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = (photoId: string, storagePath: string) => {
    showConfirm('Supprimer cette photo ?', async () => {
      try {
        await supabase.storage.from('questionnaire-media').remove([storagePath]);

        const { error } = await supabase
          .from('questionnaire_photos')
          .delete()
          .eq('id', photoId)
          .eq('user_id', user?.id);

        if (error) throw error;

        await loadPhotos();
        showToast('Photo supprimée', 'success');
      } catch (error: unknown) {
        showToast(`Erreur lors de la suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
      }
    }, 'Supprimer la photo');
  };


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          showToast(`${file.name} n'est pas une image valide`, 'error');
          continue;
        }

        const fileName = `${dossierId}/${questionId}/${Date.now()}_${i}.jpg`;
        const filePath = `questionnaire-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('questionnaire-media')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const insertData = {
          dossier_id: dossierId,
          question_id: questionId,
          storage_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          user_id: user?.id,
        };

        const { error: dbError } = await supabase
          .from('questionnaire_photos')
          .insert(insertData);

        if (dbError) {
          throw dbError;
        }
      }

      await loadPhotos();
      event.target.value = '';
    } catch (error: unknown) {
      showToast(`Erreur lors du telechargement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Camera className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700">
            Photos ({photos.length})
          </span>
        </div>
        {!showCamera && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={startCamera}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Camera</span>
            </button>
            <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-600 text-white text-xs sm:text-sm rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>Galerie</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="bg-slate-900 p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={stopCamera}
              disabled={loading}
              className="text-white p-3 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              disabled={loading}
              className="bg-white text-slate-900 px-8 py-3 rounded-full font-semibold hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Capturer</span>
                </>
              )}
            </button>
            <div className="w-12" />
          </div>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              {photo.signed_url ? (
                <img
                  src={photo.signed_url}
                  alt={photo.file_name}
                  className="w-full h-full object-cover rounded-lg border border-slate-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
                  <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => deletePhoto(photo.id, photo.storage_path)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{photo.file_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
