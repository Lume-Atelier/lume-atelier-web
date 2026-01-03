import { FileCategory } from '@/types';
import type { FileWithMetadata } from '@/hooks/useProductFiles';
import { FileUploadZone } from './FileUploadZone';
import { FileList } from './FileList';
import { ThumbnailSelector } from './ThumbnailSelector';

export interface ProductFileManagerProps {
  files: FileWithMetadata[];
  onFilesAdded: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onCategoryChange?: (id: string, category: FileCategory) => void;
  selectedThumbnailId: string | null;
  onThumbnailSelect: (id: string) => void;
  uploadProgress?: Map<string, { progress: number; status: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error'; error?: string }>;
  disabled?: boolean;
  errors?: Array<{ fileName: string; error: string }>;
}

/**
 * Componente orquestrador para gerenciamento de arquivos do produto
 *
 * Integra:
 * - FileUploadZone (drag-and-drop)
 * - FileList (lista com tabs)
 * - ThumbnailSelector (escolha de thumbnail)
 */
export function ProductFileManager({
  files,
  onFilesAdded,
  onRemoveFile,
  onCategoryChange,
  selectedThumbnailId,
  onThumbnailSelect,
  uploadProgress,
  disabled = false,
  errors = [],
}: ProductFileManagerProps) {
  // Filtrar apenas imagens de preview para o seletor de thumbnail (não texturas 3D)
  const images = files.filter(
    (f) => f.category === FileCategory.IMAGE
  );

  return (
    <div className="space-y-6">
      {/* Zona de upload */}
      <FileUploadZone
        onFilesAdded={onFilesAdded}
        disabled={disabled}
      />

      {/* Erros de validação */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            Alguns arquivos não puderam ser adicionados:
          </p>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            {errors.map((err, index) => (
              <li key={index}>
                <strong>{err.fileName}:</strong> {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Arquivos selecionados ({files.length})
            </h3>
            <FileList
              files={files}
              uploadProgress={uploadProgress}
              onRemoveFile={onRemoveFile}
              onCategoryChange={disabled ? undefined : onCategoryChange}
            />
          </div>

          {/* Seletor de thumbnail */}
          {images.length > 0 && (
            <div>
              <ThumbnailSelector
                images={images}
                selectedId={selectedThumbnailId}
                onSelect={onThumbnailSelect}
              />
            </div>
          )}
        </>
      )}

      {/* Progresso geral (se estiver fazendo upload) */}
      {uploadProgress && uploadProgress.size > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Upload em progresso...
            </span>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {Array.from(uploadProgress.values()).filter((p) => p.status === 'completed').length} de {uploadProgress.size} completos
            </span>
          </div>

          {/* Lista de status por arquivo */}
          <div className="mt-2 space-y-1">
            {Array.from(uploadProgress.entries()).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center justify-between text-xs">
                <span className="text-blue-800 dark:text-blue-200 truncate max-w-xs">
                  {fileName}
                </span>
                <span className={`ml-2 ${progress.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {progress.status === 'completed' ? '✓' :
                   progress.status === 'error' ? '✗' :
                   progress.status === 'confirming' ? 'Confirmando...' :
                   `${progress.progress}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Erros de upload (arquivos que falharam durante o upload) */}
      {uploadProgress && Array.from(uploadProgress.values()).some((p) => p.status === 'error') && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            ⚠️ Alguns arquivos falharam no upload:
          </p>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            {Array.from(uploadProgress.entries())
              .filter(([, progress]) => progress.status === 'error')
              .map(([fileName, progress]) => (
                <li key={fileName}>
                  <strong>{fileName}:</strong> {progress.error || 'Erro desconhecido'}
                </li>
              ))}
          </ul>
          <p className="text-xs text-red-600 dark:text-red-400 mt-3">
            Os arquivos que foram enviados com sucesso foram salvos. Você pode tentar adicionar novamente os arquivos que falharam.
          </p>
        </div>
      )}
    </div>
  );
}
