import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Trash2, Loader2, FileCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DocumentUploader } from './DocumentUploader';
import { useNotification } from '../contexts/NotificationContext';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_text: string | null;
  metadata: any;
  created_at: string;
}

interface DocumentsTabProps {
  dossierId: string;
}

export function DocumentsTab({ dossierId }: DocumentsTabProps) {
  const { user } = useAuth();
  const { showToast, showConfirm } = useNotification();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showExtract, setShowExtract] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [dossierId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('dossier_id', dossierId)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch {
      showToast('Erreur lors du chargement des documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (documentId: string) => {
    showConfirm('Supprimer ce document ?', async () => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user?.id);

      if (dbError) throw dbError;

      setDocuments(documents.filter(d => d.id !== documentId));
      showToast('Document supprimé', 'success');
    } catch {
      showToast('Erreur lors de la suppression du document', 'error');
    }
    }, 'Supprimer le document');
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(doc.storage_path);

      window.open(data.publicUrl, '_blank');
    } catch {
      showToast('Erreur lors du téléchargement', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const getExtractionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <FileCheck className="w-3 h-3" />
            <span>Extrait</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>En cours</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Erreur</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
            <Loader2 className="w-3 h-3" />
            <span>En attente</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
          <p className="text-sm text-slate-600 mt-1">
            {documents.length} document{documents.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowUploader(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Importer un document</span>
        </button>
      </div>

      {/* Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Importer des documents</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <DocumentUploader
                dossierId={dossierId}
                onUploadComplete={() => {
                  loadDocuments();
                  setShowUploader(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Aucun document</p>
          <p className="text-sm text-slate-500 mt-1">Importez vos premiers documents pour ce dossier</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="text-4xl">{getFileIcon(doc.file_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base font-semibold text-slate-900 truncate">
                        {doc.file_name}
                      </h4>
                      {getExtractionStatusBadge(doc.extraction_status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>
                        {new Date(doc.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Extract Preview */}
                    {doc.extraction_status === 'completed' && doc.extracted_text && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setShowExtract(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Voir l'extrait de contexte</span>
                        </button>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {doc.extracted_text.substring(0, 150)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extract Modal */}
      {showExtract && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Extrait de contexte
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{selectedDocument.file_name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowExtract(false);
                    setSelectedDocument(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedDocument.extracted_text}
                </pre>
              </div>

              {selectedDocument.metadata && Object.keys(selectedDocument.metadata).length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Métadonnées</h4>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <dl className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedDocument.metadata).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            {key}
                          </dt>
                          <dd className="text-sm text-slate-900 mt-1">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => {
                  setShowExtract(false);
                  setSelectedDocument(null);
                }}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
