import { Check } from 'lucide-react';
import Image from 'next/image';
import type { FileWithMetadata } from '@/hooks/useProductFiles';

export interface ThumbnailSelectorProps {
  images: FileWithMetadata[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Seletor de thumbnail do produto
 *
 * Features:
 * - Grid horizontal de imagens clicáveis
 * - Destaque visual da selecionada
 * - Label obrigatório
 */
export function ThumbnailSelector({
  images,
  selectedId,
  onSelect,
}: ThumbnailSelectorProps) {
  if (images.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
          Nenhuma imagem de preview disponível
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          Adicione pelo menos uma imagem de preview (.png, .jpg, .webp) para usar como thumbnail do produto no catálogo.
        </p>
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          <strong>Nota:</strong> Texturas 3D (.tga, .exr, .hdr) não podem ser usadas como thumbnail.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Selecione a imagem de thumbnail <span className="text-red-500">*</span>
      </label>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image) => {
          const isSelected = selectedId === image.id;

          return (
            <button
              key={image.id}
              type="button"
              onClick={() => onSelect(image.id)}
              className={`
                relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden
                border-2 transition-all
                ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                }
              `}
              title={image.fileName}
            >
              {/* Imagem */}
              {image.previewUrl && (
                <Image
                  src={image.previewUrl}
                  alt={image.fileName}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              )}

              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <div className="bg-blue-500 rounded-full p-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Nome do arquivo (tooltip) */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <p className="text-xs text-white truncate">{image.fileName}</p>
              </div>

              {/* Indicador de arquivo existente */}
              {image.source === 'server' && (
                <div className="absolute top-1 right-1 bg-blue-500 rounded-full w-3 h-3" title="Arquivo existente" />
              )}
            </button>
          );
        })}
      </div>

      {!selectedId && images.length > 0 && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          Selecione uma imagem como thumbnail do produto
        </p>
      )}
    </div>
  );
}
