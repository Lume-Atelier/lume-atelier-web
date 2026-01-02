/**
 * Tipos relacionados a produtos (Assets 3D)
 */

export interface Product {
  id: string;
  sku: string;

  // Informações básicas (pt-BR no backend, traduzidas no frontend)
  title: string;
  description: string;
  shortDescription: string;

  // Preço (sempre em BRL no backend)
  priceInBRL: number;

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
  fileSize: number; // em bytes
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
  images: ProductImage[];
  thumbnailUrl: string;

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

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
