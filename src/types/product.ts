/**
 * Tipos relacionados a produtos (Assets 3D)
 * Refletem os DTOs do backend após refatoração RESTful
 */

/**
 * DTO Resumido - Usado em listagens públicas
 * Corresponde a ProductSummaryDTO no backend
 * ❌ NÃO contém r2Key, downloadUrl ou dados sensíveis
 */
export interface ProductSummaryDTO {
  id: string;
  sku: string;
  title: string;
  shortDescription: string;
  priceInBRL: number;
  category: ProductCategory;
  status: ProductStatus;
  thumbnailUrl: string;
  featured: boolean;
  freeProduct: boolean;
  downloadCount: number;
  rating?: number;
  reviewCount: number;

  // Convertido no frontend
  displayPrice?: number;
  displayCurrency?: string;
}

/**
 * DTO Detalhado - Usado na página do produto
 * Corresponde a ProductDetailDTO no backend
 * ✅ Contém especificações técnicas
 * ❌ NÃO contém r2Key ou presignedUrl
 */
export interface ProductDetailDTO {
  id: string;
  sku: string;
  title: string;
  description: string;
  shortDescription: string;
  priceInBRL: number;
  freeProduct: boolean;

  // Convertido no frontend
  displayPrice?: number;
  displayCurrency?: string;

  // Categorização
  category: ProductCategory;
  subcategory?: string;
  tags: string[];

  // Especificações técnicas
  software: string[];
  fileFormats: string[];
  polyCount?: number;
  textureResolution?: string;
  rigged: boolean;
  animated: boolean;
  pbr: boolean;
  uvMapped: boolean;

  // Dimensões (sempre em metros no backend)
  dimensionsInMeters?: {
    width: number;
    height: number;
    depth: number;
  };

  // Galeria
  images: ProductImageDTO[];
  thumbnailUrl: string;

  // Arquivos disponíveis (SEM downloadUrl!)
  availableFiles: FileAvailabilityDTO[];

  // Metadados
  createdAt: string;
  updatedAt: string;
  featured: boolean;
  status: ProductStatus;

  // Estatísticas
  downloadCount: number;
  rating?: number;
  reviewCount: number;
}

/**
 * DTO de Download - Gerado APENAS após validação de compra
 * Corresponde a ProductDownloadDTO no backend
 * ✅ Contém presigned URLs temporárias
 */
export interface ProductDownloadDTO {
  productId: string;
  productTitle: string;
  orderId: string;
  files: SecureFileDownload[];
}

export interface SecureFileDownload {
  fileId: string;
  fileName: string;
  fileType: string;
  category: string;
  fileSizeMB: string;
  presignedUrl: string; // URL temporária (60 min)
  expiresAt: string; // ISO 8601
  downloadLimit: number; // Máximo de downloads
}

/**
 * Informação de arquivo disponível (SEM presignedUrl)
 * Usado em ProductDetailDTO
 */
export interface FileAvailabilityDTO {
  fileId: string;
  fileName: string;
  fileType: string;
  category: string;
  fileSizeMB: string;
}

export interface ProductImageDTO {
  id: string;
  url: string;
  alt: string;
  displayOrder: number;
}

// DEPRECATED: Use ProductSummaryDTO ou ProductDetailDTO
export interface Product extends Omit<ProductDetailDTO, 'images'> {
  // Mantido por compatibilidade temporária
  fileOid?: string | null;
  fileName?: string | null;
  fileSize?: number;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export enum ProductCategory {
  CHARACTERS = 'CHARACTERS',
  ENVIRONMENTS = 'ENVIRONMENTS',
  PROPS = 'PROPS',
  VEHICLES = 'VEHICLES',
  TEXTURES = 'TEXTURES',
  ANIMATIONS = 'ANIMATIONS',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface ProductFilter {
  category?: ProductCategory;
  software?: string[];
  formats?: string[];
  minPrice?: number;
  maxPrice?: number;
  rigged?: boolean;
  animated?: boolean;
  pbr?: boolean;
  search?: string;
}

/**
 * Resposta paginada genérica
 * Corresponde a PageResponse<T> no backend
 */
export interface PageResponse<T> {
  content: T[]; // Lista de items (DTOs)
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

// DEPRECATED: Use PageResponse<ProductSummaryDTO>
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
