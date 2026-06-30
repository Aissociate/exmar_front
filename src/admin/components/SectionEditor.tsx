import { useState } from 'react';
import { Sparkles, Loader2, Eye, CreditCard as Edit2, Settings, Image } from 'lucide-react';

interface SectionEditorProps {
  title: string;
  sectionName: 'expert_presentation' | 'identification' | 'contexte' | 'constatations' | 'analyse' | 'estimation';
  content: string;
  onContentChange: (content: string) => void;
  onGenerate: () => Promise<void>;
  generating: boolean;
  description?: string;
  showPhotos?: boolean;
  photos?: Array<{
    url: string;
    caption?: string;
  }>;
  customPrompt?: string;
  onCustomPromptChange?: (prompt: string) => void;
}

export function SectionEditor({
  title,
  sectionName: _,
  content,
  onContentChange,
  onGenerate,
  generating,
  description,
  showPhotos = false,
  photos = [],
  customPrompt = '',
  onCustomPromptChange,
}: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(customPrompt);
  const [showPhotosPanel, setShowPhotosPanel] = useState(false);

  const insertPhoto = (photoIndex: number) => {
    const photo = photos[photoIndex];
    const imageMarkup = `<div style="margin: 20px 0; page-break-inside: avoid;">
  <img src="${photo.url}" alt="${photo.caption || `Photo ${photoIndex + 1}`}" style="max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 8px;" />
  <p style="margin-top: 8px; font-size: 14px; color: #64748b; font-style: italic;">Figure ${photoIndex + 1}${photo.caption ? `: ${photo.caption}` : ''}</p>
</div>`;

    // Insert at the end
    onContentChange(content + (content ? '\n\n' : '') + imageMarkup);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-xs sm:text-sm"
            title="Personnaliser le prompt de génération"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Personnaliser</span>
          </button>
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs sm:text-sm min-w-[120px] sm:min-w-[150px]"
          >
            {generating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                <span className="whitespace-nowrap">Génération...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Générer avec IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showPromptEditor && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900">Personnaliser le prompt de génération</h3>
            <button
              onClick={() => {
                if (onCustomPromptChange) {
                  onCustomPromptChange(editedPrompt);
                }
                setShowPromptEditor(false);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Appliquer
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Ajoutez des instructions spécifiques pour personnaliser la génération de cette section.
            Laissez vide pour utiliser le prompt par défaut.
          </p>
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            className="w-full h-32 p-3 text-sm border border-amber-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Ex: Ajouter plus de détails techniques, utiliser un ton formel, inclure des recommandations spécifiques..."
          />
          {customPrompt && (
            <button
              onClick={() => {
                setEditedPrompt('');
                if (onCustomPromptChange) {
                  onCustomPromptChange('');
                }
              }}
              className="text-xs text-red-600 hover:text-red-700 underline"
            >
              Réinitialiser au prompt par défaut
            </button>
          )}
        </div>
      )}

      {showPhotos && photos.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowPhotosPanel(!showPhotosPanel)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Image className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-900">
                Photos disponibles ({photos.length})
              </h3>
            </div>
            <span className="text-xs text-slate-600">
              {showPhotosPanel ? 'Masquer' : 'Afficher'}
            </span>
          </button>

          {showPhotosPanel && (
            <div className="p-4 border-t border-slate-200">
              <p className="text-xs text-slate-600 mb-3">
                Cliquez sur une photo pour l'insérer dans le rapport
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => insertPhoto(index)}
                    className="relative group text-left hover:ring-2 hover:ring-blue-500 rounded-lg transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center">
                        Insérer Photo {index + 1}
                      </span>
                    </div>
                    {photo.caption && (
                      <p className="text-xs text-slate-600 mt-1 truncate px-1">
                        {photo.caption}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-3 sm:px-4 py-2 flex items-center justify-between border-b border-slate-300">
          <span className="text-xs sm:text-sm font-medium text-slate-700">
            {isEditing ? 'Mode édition' : 'Aperçu'}
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 text-xs sm:text-sm bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Aperçu</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Éditer</span>
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full h-64 sm:h-96 p-3 sm:p-4 font-mono text-xs sm:text-sm border-0 focus:ring-0 focus:outline-none resize-none"
            placeholder="Le contenu de la section apparaîtra ici. Cliquez sur 'Générer avec IA' pour créer automatiquement le contenu basé sur vos données."
          />
        ) : (
          <div className="p-4 sm:p-6 min-h-64 sm:min-h-96 prose prose-sm max-w-none">
            {content ? (
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="text-center text-slate-400 py-20">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun contenu généré</p>
                <p className="text-xs mt-2">
                  Cliquez sur "Générer avec IA" pour créer automatiquement cette section
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {content && (
        <div className="text-xs sm:text-sm text-slate-600 bg-blue-50 border border-blue-200 rounded-lg p-2.5 sm:p-3">
          <p>
            <strong>Conseil:</strong> Vous pouvez modifier manuellement le texte en cliquant sur "Éditer",
            ou régénérer entièrement la section avec l'IA.
          </p>
        </div>
      )}
    </div>
  );
}
