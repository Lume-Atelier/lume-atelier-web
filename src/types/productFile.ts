/**
 * Categorias de arquivos de produtos
 */
export enum FileCategory {
  MODEL = 'MODEL',
  TEXTURE = 'TEXTURE',
  IMAGE = 'IMAGE',
  ARCHIVE = 'ARCHIVE',
  OTHER = 'OTHER',
}

/**
 * Arquivo associado a um produto (armazenado no R2)
 * ❌ NÃO contém r2Key (dado sensível, apenas no backend)
 * ❌ NÃO contém presignedUrl (apenas após validação de compra)
 */
export interface ProductFile {
  id: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // em bytes
  category: FileCategory;
  displayOrder: number;
  uploadedAt: string; // ISO 8601
  publicUrl?: string; // URL pública gerada pelo backend para acesso direto
  // r2Key: REMOVIDO - dado sensível, apenas backend
}

/**
 * Request para informações de arquivo a ser uploadado
 */
export interface FileUploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  category: FileCategory;
}

/**
 * Request para gerar presigned URLs
 */
export interface PresignedUrlRequest {
  productId: string;
  files: FileUploadRequest[];
}

/**
 * Response contendo presigned URL para upload
 */
export interface PresignedUrlResponse {
  fileName: string;
  presignedUrl: string; // URL para fazer PUT
  r2Key: string; // Chave no R2
  category: FileCategory;
}

/**
 * Request para confirmar upload bem-sucedido
 */
export interface ConfirmUploadRequest {
  productId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key: string;
  category: FileCategory;
}

/**
 * Response com URL de download
 */
export interface DownloadUrlResponse {
  url: string;
}

/**
 * Request para reordenar arquivos de um produto
 */
export interface ReorderFilesRequest {
  fileIds: string[];
}

/**
 * Helper para determinar categoria do arquivo baseado na extensão
 */
export function determineFileCategory(fileName: string): FileCategory {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const lowerFileName = fileName.toLowerCase();

  // Modelos 3D
  if (['obj', 'fbx', 'blend', 'stl', 'dae', 'gltf', 'glb', '3ds', 'max', 'ma', 'mb', 'mtl'].includes(ext)) {
    return FileCategory.MODEL;
  }

  // Texturas (formatos específicos de textura + .zip que contenha "texture" no nome)
  if (['tga', 'exr', 'hdr', 'tiff', 'dds'].includes(ext)) {
    return FileCategory.TEXTURE;
  }

  // Se for .zip e contém "texture" ou "textura" no nome, categorizar como TEXTURE
  if (ext === 'zip' && (lowerFileName.includes('texture') || lowerFileName.includes('textura'))) {
    return FileCategory.TEXTURE;
  }

  // Imagens comuns (preview/thumbnails/showcase)
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'bmp'].includes(ext)) {
    return FileCategory.IMAGE;
  }

  // Arquivos compactados (archives)
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return FileCategory.ARCHIVE;
  }

  return FileCategory.OTHER;
}

/**
 * Formata tamanho de arquivo em string legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
