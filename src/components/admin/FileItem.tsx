import { X, FileArchive, Image as ImageIcon, Box, Palette, File as FileIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { FileCategory, formatFileSize } from '@/types';
import type { FileWithMetadata } from '@/hooks/useProductFiles';
import Image from 'next/image';

export interface FileItemProps {
  file: FileWithMetadata;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error';
  onRemove: (id: string) => void;
  onCategoryChange?: (id: string, category: FileCategory) => void;
}

/**
 * Componente que exibe um arquivo individual
 *
 * Features:
 * - Preview de imagem (se aplicável)
 * - Ícone por tipo de arquivo
 * - Nome + categoria + tamanho
 * - Barra de progresso de upload
 * - Status visual
 * - Botão de remoção
 */
export function FileItem({
  file,
  uploadProgress = 0,
  uploadStatus = 'pending',
  onRemove,
  onCategoryChange,
}: FileItemProps) {
  // Ícone por categoria
  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case FileCategory.MODEL:
        return <Box className="w-10 h-10 text-blue-500" />;
      case FileCategory.TEXTURE:
        return <Palette className="w-10 h-10 text-purple-500" />;
      case FileCategory.IMAGE:
        return <ImageIcon className="w-10 h-10 text-green-500" />;
      case FileCategory.ARCHIVE:
        return <FileArchive className="w-10 h-10 text-orange-500" />;
      default:
        return <FileIcon className="w-10 h-10 text-gray-500" />;
    }
  };

  // Cor do badge por categoria
  const getCategoryColor = (category: FileCategory) => {
    switch (category) {
      case FileCategory.MODEL:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case FileCategory.TEXTURE:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case FileCategory.IMAGE:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case FileCategory.ARCHIVE:
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Ícone de status
  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
      case 'confirming':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  // Texto de status
  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return `${uploadProgress}%`;
      case 'confirming':
        return 'Confirmando...';
      case 'completed':
        return 'Completo';
      case 'error':
        return 'Erro';
      default:
        return 'Aguardando';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Preview ou ícone */}
      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
        {file.previewUrl ? (
          <Image
            src={file.previewUrl}
            alt={file.file.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        ) : (
          getCategoryIcon(file.category)
        )}
      </div>

      {/* Informações do arquivo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.file.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {/* Badge de categoria */}
              {onCategoryChange ? (
                <select
                  value={file.category}
                  onChange={(e) => onCategoryChange(file.id, e.target.value as FileCategory)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${getCategoryColor(file.category)}`}
                  disabled={uploadStatus !== 'pending'}
                >
                  {Object.values(FileCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(file.category)}`}>
                  {file.category}
                </span>
              )}

              {/* Tamanho do arquivo */}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.file.size)}
              </span>

              {/* Status */}
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>

          {/* Botão de remoção */}
          <button
            onClick={() => onRemove(file.id)}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'confirming'}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remover arquivo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progresso */}
        {(uploadStatus === 'uploading' || uploadStatus === 'confirming') && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${uploadStatus === 'confirming' ? 100 : uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
