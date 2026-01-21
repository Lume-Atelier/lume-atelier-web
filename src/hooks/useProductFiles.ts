import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileCategory, determineFileCategory, UnifiedFile, ProductFile } from '@/types';
import { AdminService } from '@/lib/api/services';

export interface FileValidationError {
  fileName: string;
  error: string;
}

export interface UseProductFilesOptions {
  productId?: string;
}

export interface UseProductFilesReturn {
  allFiles: UnifiedFile[];
  existingFiles: UnifiedFile[];
  newFiles: UnifiedFile[];
  filesToDelete: string[];
  loading: boolean;
  loadError: string | null;
  selectedThumbnailId: string | null;
  errors: FileValidationError[];
  addFiles: (files: File[]) => UnifiedFile[];
  removeFile: (id: string) => void;
  updateCategory: (id: string, category: FileCategory) => void;
  reorderFiles: (fromIndex: number, toIndex: number) => void;
  setThumbnail: (id: string) => void;
  validateFiles: () => string[];
  getImages: () => UnifiedFile[];
  reset: () => void;
  refetch: () => Promise<void>;
}

// Configurações de validação por categoria
const FILE_VALIDATIONS: Record<FileCategory, { extensions: string[]; maxSize: number }> = {
  [FileCategory.MODEL]: {
    extensions: ['.blend', '.fbx', '.obj', '.mtl', '.gltf', '.glb', '.dae', '.stl', '.3ds', '.max', '.ma', '.mb'],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  [FileCategory.TEXTURE]: {
    extensions: ['.tga', '.exr', '.hdr', '.tiff', '.dds', '.zip'], // Texturas específicas + .zip
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB (para .zip de texturas)
  },
  [FileCategory.IMAGE]: {
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp'], // Imagens comuns
    maxSize: 50 * 1024 * 1024, // 50MB
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
 * Converte ProductFile do servidor para UnifiedFile
 */
function serverFileToUnified(file: ProductFile): UnifiedFile {
  return {
    id: file.id,
    fileName: file.fileName,
    fileSize: file.fileSize,
    category: file.category,
    displayOrder: file.displayOrder,
    previewUrl: file.publicUrl,
    source: 'server',
    serverId: file.id,
    publicUrl: file.publicUrl,
    fileType: file.fileType,
    uploadedAt: file.uploadedAt,
  };
}

/**
 * Hook para gerenciar arquivos de produto (novos e existentes)
 *
 * Funcionalidades:
 * - Carregar arquivos existentes do servidor
 * - Adicionar/remover arquivos
 * - Categorização automática
 * - Preview de imagens
 * - Seleção de thumbnail
 * - Rastrear arquivos a serem deletados
 * - Validações
 */
export function useProductFiles(options: UseProductFilesOptions = {}): UseProductFilesReturn {
  const { productId } = options;

  // Arquivos existentes (do servidor)
  const [existingFiles, setExistingFiles] = useState<UnifiedFile[]>([]);
  // Novos arquivos (locais, ainda não uploadados)
  const [newFiles, setNewFiles] = useState<UnifiedFile[]>([]);
  // IDs de arquivos do servidor marcados para remoção
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const [selectedThumbnailId, setSelectedThumbnailId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FileValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /**
   * Carrega arquivos existentes do servidor
   */
  const loadExistingFiles = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setLoadError(null);

    try {
      const serverFiles = await AdminService.getProductFiles(productId);
      const unified = serverFiles.map(serverFileToUnified);
      setExistingFiles(unified);

      // Se houver imagens, selecionar a primeira como thumbnail por padrão
      const images = unified.filter(f => f.category === FileCategory.IMAGE);
      if (images.length > 0 && !selectedThumbnailId) {
        setSelectedThumbnailId(images[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar arquivos existentes:', err);
      setLoadError('Erro ao carregar arquivos do produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [productId, selectedThumbnailId]);

  // Carregar arquivos existentes ao montar (se houver productId)
  useEffect(() => {
    if (productId) {
      loadExistingFiles();
    }
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Combina arquivos existentes (não marcados para exclusão) com novos arquivos
   */
  const allFiles = [
    ...existingFiles.filter(f => !filesToDelete.includes(f.serverId || f.id)),
    ...newFiles,
  ];

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
  const addFiles = useCallback((files: File[]): UnifiedFile[] => {
    const validatedFiles: UnifiedFile[] = [];
    const newErrors: FileValidationError[] = [];

    const currentNewFilesCount = newFiles.length;

    files.forEach((file, index) => {
      // Determinar categoria automaticamente
      const category = determineFileCategory(file.name);

      // Validar arquivo
      const error = validateFile(file, category);
      if (error) {
        newErrors.push({ fileName: file.name, error });
        return;
      }

      // Gerar preview apenas para imagens de preview (não texturas 3D)
      let previewUrl: string | undefined;
      if (category === FileCategory.IMAGE) {
        previewUrl = URL.createObjectURL(file);
      }

      // Adicionar arquivo
      validatedFiles.push({
        id: uuidv4(),
        fileName: file.name,
        fileSize: file.size,
        category,
        displayOrder: allFiles.length + currentNewFilesCount + index,
        previewUrl,
        source: 'local',
        file,
      });
    });

    setNewFiles((prev) => [...prev, ...validatedFiles]);
    // Sempre atualizar errors: limpa se não houver novos erros, ou seta os novos erros
    setErrors(newErrors);

    return validatedFiles;
  }, [allFiles.length, newFiles.length, validateFile]);

  /**
   * Remove um arquivo (marca para exclusão se for do servidor, ou remove se for local)
   */
  const removeFile = useCallback((id: string) => {
    // Verificar se é arquivo do servidor
    const serverFile = existingFiles.find(f => f.id === id);
    if (serverFile) {
      // Marcar para exclusão
      setFilesToDelete(prev => [...prev, serverFile.serverId || serverFile.id]);

      // Se era a thumbnail selecionada, limpar seleção
      if (selectedThumbnailId === id) {
        setSelectedThumbnailId(null);
      }
      return;
    }

    // É arquivo local - remover da lista
    setNewFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);

      // Revogar URL de preview se existir
      if (fileToRemove?.previewUrl && fileToRemove.source === 'local') {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }

      // Reajustar displayOrder
      const filtered = prev.filter((f) => f.id !== id);
      return filtered.map((f, index) => ({ ...f, displayOrder: existingFiles.length + index }));
    });

    // Se era a thumbnail selecionada, limpar seleção
    if (selectedThumbnailId === id) {
      setSelectedThumbnailId(null);
    }
  }, [existingFiles, selectedThumbnailId]);

  /**
   * Atualiza a categoria de um arquivo
   */
  const updateCategory = useCallback((id: string, category: FileCategory) => {
    // Verificar se é arquivo local
    const localFile = newFiles.find(f => f.id === id);
    if (localFile && localFile.file) {
      // Validar nova categoria
      const error = validateFile(localFile.file, category);
      if (error) {
        setErrors((prevErrors) => [
          ...prevErrors,
          { fileName: localFile.fileName, error },
        ]);
        return;
      }

      setNewFiles((prev) =>
        prev.map((f) => f.id === id ? { ...f, category } : f)
      );
    }
  }, [newFiles, validateFile]);

  /**
   * Reordena arquivos (drag & drop)
   */
  const reorderFiles = useCallback((fromIndex: number, toIndex: number) => {
    // Trabalhar com allFiles combinados
    const combined = [...allFiles];
    const [removed] = combined.splice(fromIndex, 1);
    combined.splice(toIndex, 0, removed);

    // Separar de volta em existentes e novos, atualizando displayOrder
    const reorderedExisting: UnifiedFile[] = [];
    const reorderedNew: UnifiedFile[] = [];

    combined.forEach((file, index) => {
      const updatedFile = { ...file, displayOrder: index };
      if (file.source === 'server') {
        reorderedExisting.push(updatedFile);
      } else {
        reorderedNew.push(updatedFile);
      }
    });

    setExistingFiles(prev => {
      // Manter arquivos marcados para exclusão + reordenados
      const deletedFiles = prev.filter(f => filesToDelete.includes(f.serverId || f.id));
      return [...reorderedExisting, ...deletedFiles];
    });
    setNewFiles(reorderedNew);
  }, [allFiles, filesToDelete]);

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

    // Se não houver arquivos existentes E não houver novos arquivos
    if (allFiles.length === 0) {
      validationErrors.push('Adicione pelo menos um arquivo ao produto');
    }

    // Pelo menos 1 imagem de preview (não textura 3D)
    const images = allFiles.filter(
      (f) => f.category === FileCategory.IMAGE
    );

    if (images.length === 0) {
      validationErrors.push('Adicione pelo menos uma imagem de preview (.png, .jpg, .webp) para thumbnail do produto');
    }

    // Thumbnail selecionada
    if (images.length > 0 && !selectedThumbnailId) {
      validationErrors.push('Selecione uma imagem como thumbnail');
    }

    // Validar thumbnail pertence às imagens
    if (selectedThumbnailId) {
      const thumbnailFile = allFiles.find((f) => f.id === selectedThumbnailId);
      if (!thumbnailFile || thumbnailFile.category !== FileCategory.IMAGE) {
        validationErrors.push('Thumbnail selecionada inválida - deve ser uma imagem de preview');
      }
    }

    return validationErrors;
  }, [allFiles, selectedThumbnailId]);

  /**
   * Retorna apenas imagens de preview (para seletor de thumbnail)
   */
  const getImages = useCallback((): UnifiedFile[] => {
    return allFiles.filter(
      (f) => f.category === FileCategory.IMAGE
    );
  }, [allFiles]);

  /**
   * Limpa todos os arquivos
   */
  const reset = useCallback(() => {
    // Revogar todas as preview URLs de arquivos locais
    newFiles.forEach((f) => {
      if (f.previewUrl && f.source === 'local') {
        URL.revokeObjectURL(f.previewUrl);
      }
    });

    setExistingFiles([]);
    setNewFiles([]);
    setFilesToDelete([]);
    setSelectedThumbnailId(null);
    setErrors([]);
    setLoadError(null);
  }, [newFiles]);

  /**
   * Recarrega arquivos existentes
   */
  const refetch = useCallback(async () => {
    await loadExistingFiles();
  }, [loadExistingFiles]);

  /**
   * Cleanup de preview URLs ao desmontar
   */
  useEffect(() => {
    return () => {
      newFiles.forEach((f) => {
        if (f.previewUrl && f.source === 'local') {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, [newFiles]);

  return {
    allFiles,
    existingFiles: existingFiles.filter(f => !filesToDelete.includes(f.serverId || f.id)),
    newFiles,
    filesToDelete,
    loading,
    loadError,
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
    refetch,
  };
}

// Re-export para compatibilidade com componentes que importam FileWithMetadata
// (UnifiedFile é o novo tipo padrão)
export type FileWithMetadata = UnifiedFile;
