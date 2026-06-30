import { useState, useCallback } from 'react';
import { Upload, File, X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useActivityLogger } from '../contexts/ActivityLoggerContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface UploadedDocument {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  extractedData?: any;
  error?: string;
}

interface DocumentUploaderProps {
  dossierId?: string;
  onDocumentsProcessed?: (extractedData: any[]) => void;
  onUploadComplete?: () => void;
  onFileProcessed?: (file: File, extractedText: string | null, metadata: any) => void;
}

export function DocumentUploader({ dossierId, onDocumentsProcessed, onUploadComplete, onFileProcessed }: DocumentUploaderProps) {
  const { logActivity } = useActivityLogger();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const extractTextFromFile = async (file: File): Promise<{ text?: string; imageData?: string; isImage: boolean }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          resolve({ imageData, isImage: true });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read image'));
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);

            // Load PDF.js dynamically from CDN
            const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

            const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: any) => item.str).join(' ');
              fullText += pageText + '\n';
            }

            resolve({ text: fullText, isImage: false });
          } catch (error) {
            reject(new Error('Failed to parse PDF: ' + (error as Error).message));
          }
        };
        reader.onerror = () => {
          reject(new Error('Failed to read PDF file'));
        };
        reader.readAsArrayBuffer(file);
      } else {
        reader.onload = (e) => {
          const text = e.target?.result as string;
          resolve({ text, isImage: false });
        };
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        reader.readAsText(file);
      }
    });
  };

  const processDocument = async (file: File, index: number) => {
    setDocuments((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, status: 'processing' } : doc))
    );

    logActivity('document_upload_started', 'info', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      isImage: file.type.startsWith('image/'),
    });

    try {
      const fileData = await extractTextFromFile(file);

      logActivity('file_content_extracted', 'info', {
        fileName: file.name,
        isImage: fileData.isImage,
        textLength: fileData.text?.length || 0,
        textPreview: fileData.text?.substring(0, 200) || 'No text',
        hasImageData: !!fileData.imageData,
      });

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const requestBody = fileData.isImage
        ? {
            imageData: fileData.imageData,
            documentType: file.type,
            isImage: true,
          }
        : {
            documentText: fileData.text,
            documentType: file.type,
            isImage: false,
          };

      logActivity('request_sent_to_ai', 'info', {
        fileName: file.name,
        requestBody: JSON.stringify(requestBody, null, 2).substring(0, 500),
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/extract-vessel-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to extract information';
        throw new Error(errorMessage);
      }

      const result = await response.json();

      logActivity('ai_response_received', 'info', {
        fileName: file.name,
        fullResponse: JSON.stringify(result, null, 2),
      });

      logActivity('ai_extracted_data', 'info', {
        fileName: file.name,
        extractedData: JSON.stringify(result.data, null, 2),
      });

      logActivity('document_extraction_success', 'success', {
        fileName: file.name,
        extractedFields: Object.keys(result.data || {}).length,
      });

      setDocuments((prev) =>
        prev.map((doc, i) =>
          i === index
            ? { ...doc, status: 'success', extractedData: result.data }
            : doc
        )
      );

      // Notify parent component that a file has been processed
      if (onFileProcessed) {
        onFileProcessed(file, fileData.text || null, result.data || {});
      }

      // Save document to database if dossierId is provided
      if (dossierId && user) {
        try {
          // Upload file to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/${dossierId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Create document record in database
          const { error: dbError } = await supabase
            .from('documents')
            .insert({
              dossier_id: dossierId,
              user_id: user.id,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
              storage_path: filePath,
              extraction_status: 'completed',
              extracted_text: fileData.text || null,
              metadata: result.data || {},
            });

          if (dbError) throw dbError;

          logActivity('document_saved_to_database', 'success', {
            fileName: file.name,
            dossierId,
          });

          if (onUploadComplete) {
            onUploadComplete();
          }
        } catch (error) {
          showToast('Erreur lors de la sauvegarde du document', 'error');
          logActivity('document_save_failed', 'error', {
            fileName: file.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const allDocs = [...documents];
      allDocs[index] = { ...allDocs[index], status: 'success', extractedData: result.data };

      const successfulDocs = allDocs.filter(d => d.status === 'success' && d.extractedData);
      if (onDocumentsProcessed) {
        onDocumentsProcessed(successfulDocs.map(d => d.extractedData));
      }

    } catch (error) {
      showToast('Erreur lors du traitement du document', 'error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logActivity('document_extraction_failed', 'error', {
        fileName: file.name,
        error: errorMessage,
      });

      let displayError = 'Erreur lors de l\'extraction';
      if (errorMessage.includes('OpenRouter API key')) {
        displayError = 'Clé OpenRouter non configurée. Ajoutez OPENROUTER_API_KEY dans les secrets Supabase.';
      }

      setDocuments((prev) =>
        prev.map((doc, i) =>
          i === index
            ? { ...doc, status: 'error', error: displayError }
            : doc
        )
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [documents]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newDocs: UploadedDocument[] = files.map((file) => ({
      file,
      status: 'pending',
    }));

    setDocuments((prev) => [...prev, ...newDocs]);

    newDocs.forEach((doc, index) => {
      processDocument(doc.file, documents.length + index);
    });
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));

    const remainingDocs = documents.filter((_, i) => i !== index);
    const successfulDocs = remainingDocs.filter(d => d.status === 'success' && d.extractedData);
    if (onDocumentsProcessed) {
      onDocumentsProcessed(successfulDocs.map(d => d.extractedData));
    }
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-2">
          Déposez vos documents ici
        </p>
        <p className="text-sm text-slate-500 mb-4">
          ou cliquez pour sélectionner des fichiers
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx,.json,image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Sélectionner des fichiers
        </label>
        <p className="text-xs text-slate-500 mt-3">
          PDF, TXT, DOC, DOCX, JSON, Images (JPG, PNG, etc.) - L'IA extraira automatiquement les informations du navire
        </p>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700">Documents téléchargés</h3>
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(doc.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {doc.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(doc.file.size / 1024).toFixed(1)} KB
                      {doc.status === 'processing' && ' - Extraction en cours...'}
                      {doc.status === 'success' && ' - Données extraites'}
                      {doc.status === 'error' && ` - ${doc.error}`}
                    </p>
                  </div>
                </div>
                {doc.status === 'success' && doc.extractedData && (
                  <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Réponse de l'IA:</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      {Object.entries(doc.extractedData).filter(([_, value]) => value !== null && value !== undefined && value !== '').length === 0 ? (
                        <div className="text-amber-600">Aucune donnée extraite - vérifiez le format du document</div>
                      ) : (
                        <>
                          {doc.extractedData.vessel_name && (
                            <div><span className="font-medium">Navire:</span> {doc.extractedData.vessel_name}</div>
                          )}
                          {doc.extractedData.vessel_type && (
                            <div><span className="font-medium">Type:</span> {doc.extractedData.vessel_type}</div>
                          )}
                          {doc.extractedData.imo_number && (
                            <div><span className="font-medium">IMO:</span> {doc.extractedData.imo_number}</div>
                          )}
                          {doc.extractedData.flag && (
                            <div><span className="font-medium">Pavillon:</span> {doc.extractedData.flag}</div>
                          )}
                          {doc.extractedData.year_built && (
                            <div><span className="font-medium">Année:</span> {doc.extractedData.year_built}</div>
                          )}
                          {doc.extractedData.owner && (
                            <div><span className="font-medium">Armateur:</span> {doc.extractedData.owner}</div>
                          )}
                          {doc.extractedData.length && (
                            <div><span className="font-medium">Longueur:</span> {doc.extractedData.length}m</div>
                          )}
                          {doc.extractedData.beam && (
                            <div><span className="font-medium">Largeur:</span> {doc.extractedData.beam}m</div>
                          )}
                          {doc.extractedData.gross_tonnage && (
                            <div><span className="font-medium">Jauge brute:</span> {doc.extractedData.gross_tonnage} GT</div>
                          )}
                          {doc.extractedData.historical_context && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <span className="font-medium">Contexte:</span> {doc.extractedData.historical_context}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeDocument(index)}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {documents.some(d => d.status === 'success') && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Informations extraites avec succès
              </p>
              <p className="text-xs text-green-700 mt-1">
                Les champs du formulaire seront automatiquement remplis avec les données extraites
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
