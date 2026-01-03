import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileCategory, determineFileCategory } from '@/types';

export interface FileWithMetadata {
  id: string;                    // UUID único
  file: File;                    // Objeto File original
  category: FileCategory;        // Determinada automaticamente
  previewUrl?: string;           // Para imagens (URL.createObjectURL)
  displayOrder: number;          // Ordem de exibição
}

export interface FileValidationError {
  fileName: string;
  error: string;
}

// Configurações de validação por categoria
const FILE_VALIDATIONS: Record<FileCategory, { extensions: string[]; maxSize: number }> = {
  [FileCategory.MODEL]: {
    extensions: ['.blend', '.fbx', '.obj', '.gltf', '.glb', '.dae', '.stl', '.3ds', '.max', '.ma', '.mb'],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  [FileCategory.TEXTURE]: {
    extensions: ['.png', '.jpg', '.jpeg', '.tga', '.exr', '.hdr', '.tiff'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  [FileCategory.IMAGE]: {
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  [FileCategory.ARCHIVE]: {
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
  },
  [FileCategory.OTHER]: {
    extensions: [],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
};

/**
 * Hook para gerenciar arquivos de produto antes do upload
 *
 * Funcionalidades:
 * - Adicionar/remover arquivos
 * - Categorização automática
 * - Preview de imagens
 * - Seleção de thumbnail
 * - Validações
 */
export function useProductFiles() {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [selectedThumbnailId, setSelectedThumbnailId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FileValidationError[]>([]);

  /**
   * Valida um arquivo individual
   */
  const validateFile = useCallback((file: File, category: FileCategory): string | null => {
    const validation = FILE_VALIDATIONS[category];

    // Validar extensão
    if (validation.extensions.length > 0) {
      const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
      if (!validation.extensions.includes(fileExtension)) {
        return `Formato ${fileExtension} não é válido para categoria ${category}. Formatos aceitos: ${validation.extensions.join(', ')}`;
      }
    }

    // Validar tamanho
    if (file.size > validation.maxSize) {
      const maxSizeMB = Math.round(validation.maxSize / (1024 * 1024));
      return `Arquivo excede o tamanho máximo de ${maxSizeMB}MB para categoria ${category}`;
    }

    return null;
  }, []);

  /**
   * Adiciona novos arquivos
   */
  const addFiles = useCallback((newFiles: File[]) => {
    const validatedFiles: FileWithMetadata[] = [];
    const newErrors: FileValidationError[] = [];

    newFiles.forEach((file) => {
      // Determinar categoria automaticamente
      const category = determineFileCategory(file.name);

      // Validar arquivo
      const error = validateFile(file, category);
      if (error) {
        newErrors.push({ fileName: file.name, error });
        return;
      }

      // Gerar preview para imagens
      let previewUrl: string | undefined;
      if (category === FileCategory.IMAGE || category === FileCategory.TEXTURE) {
        previewUrl = URL.createObjectURL(file);
      }

      // Adicionar arquivo
      validatedFiles.push({
        id: uuidv4(),
        file,
        category,
        previewUrl,
        displayOrder: files.length + validatedFiles.length,
      });
    });

    setFiles((prev) => [...prev, ...validatedFiles]);
    setErrors(newErrors);

    return validatedFiles;
  }, [files.length, validateFile]);

  /**
   * Remove um arquivo
   */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);

      // Revogar URL de preview se existir
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      // Reajustar displayOrder
      const filtered = prev.filter((f) => f.id !== id);
      return filtered.map((f, index) => ({ ...f, displayOrder: index }));
    });

    // Se era a thumbnail selecionada, limpar seleção
    if (selectedThumbnailId === id) {
      setSelectedThumbnailId(null);
    }
  }, [selectedThumbnailId]);

  /**
   * Atualiza a categoria de um arquivo
   */
  const updateCategory = useCallback((id: string, category: FileCategory) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;

        // Validar novo categoria
        const error = validateFile(f.file, category);
        if (error) {
          setErrors((prevErrors) => [
            ...prevErrors,
            { fileName: f.file.name, error },
          ]);
          return f;
        }

        return { ...f, category };
      })
    );
  }, [validateFile]);

  /**
   * Reordena arquivos (drag & drop)
   */
  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);

      // Atualizar displayOrder
      return result.map((f, index) => ({ ...f, displayOrder: index }));
    });
  }, []);

  /**
   * Define a thumbnail
   */
  const setThumbnail = useCallback((id: string) => {
    setSelectedThumbnailId(id);
  }, []);

  /**
   * Valida todos os arquivos antes do submit
   */
  const validateFiles = useCallback((): string[] => {
    const validationErrors: string[] = [];

    // Pelo menos 1 arquivo
    if (files.length === 0) {
      validationErrors.push('Adicione pelo menos um arquivo ao produto');
    }

    // Pelo menos 1 imagem
    const images = files.filter(
      (f) => f.category === FileCategory.IMAGE || f.category === FileCategory.TEXTURE
    );

    if (images.length === 0) {
      validationErrors.push('Adicione pelo menos uma imagem para thumbnail');
    }

    // Thumbnail selecionada
    if (images.length > 0 && !selectedThumbnailId) {
      validationErrors.push('Selecione uma imagem como thumbnail');
    }

    // Validar thumbnail pertence às imagens
    if (selectedThumbnailId) {
      const thumbnailFile = files.find((f) => f.id === selectedThumbnailId);
      if (!thumbnailFile || (thumbnailFile.category !== FileCategory.IMAGE && thumbnailFile.category !== FileCategory.TEXTURE)) {
        validationErrors.push('Thumbnail selecionada inválida');
      }
    }

    return validationErrors;
  }, [files, selectedThumbnailId]);

  /**
   * Retorna apenas imagens (para seletor de thumbnail)
   */
  const getImages = useCallback((): FileWithMetadata[] => {
    return files.filter(
      (f) => f.category === FileCategory.IMAGE || f.category === FileCategory.TEXTURE
    );
  }, [files]);

  /**
   * Limpa todos os arquivos
   */
  const reset = useCallback(() => {
    // Revogar todas as preview URLs
    files.forEach((f) => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });

    setFiles([]);
    setSelectedThumbnailId(null);
    setErrors([]);
  }, [files]);

  /**
   * Cleanup de preview URLs ao desmontar
   */
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, [files]);

  return {
    files,
    selectedThumbnailId,
    errors,
    addFiles,
    removeFile,
    updateCategory,
    reorderFiles,
    setThumbnail,
    validateFiles,
    getImages,
    reset,
  };
}
