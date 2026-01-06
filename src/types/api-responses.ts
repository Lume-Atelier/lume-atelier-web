/**
 * API Response Types
 * Estruturas de resposta do Backend (Spring Boot)
 * Atualizado: 2026-01-05
 *
 * IMPORTANTE: Estes tipos devem refletir 100% os DTOs do backend
 * Backend: api-lume-atelier/src/main/java/com/lumeatelier/dto/
 */

import type { OrderDTO } from './checkout';
import type { PageResponse } from './product';

/**
 * NOTA: PageResponse está definido em product.ts
 */

/**
 * Produto na listagem (Summary)
 * Backend DTO: ProductSummaryDTO
 * Usado em: GET /products, GET /products?featured=true
 *
 * ATENÇÃO: NÃO contém downloadUrl ou r2Key (removidos por segurança)
 */
export interface ProductSummaryDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

/**
 * Produto com detalhes completos
 * Backend DTO: ProductDetailDTO
 * Usado em: GET /products/:id
 */
export interface ProductDetailDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  thumbnailUrl: string | null;
  previewImages: string[];
  tags: string[];
  technicalSpecs: {
    rigged: boolean;
    animated: boolean;
    pbr: boolean;
    polyCount: number | null;
    fileFormats: string[];
  };
  availableFiles: AvailableFileDTO[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Arquivo disponível no produto (SEM presignedUrl)
 * Backend DTO: AvailableFileDTO
 *
 * ATENÇÃO: presignedUrl NÃO está aqui (segurança)
 * Para download, usar POST /orders/:id/downloads que retorna ProductDownloadDTO
 */
export interface AvailableFileDTO {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Download seguro do produto
 * Backend DTO: ProductDownloadDTO
 * Usado em: POST /orders/:id/downloads
 *
 * ATENÇÃO: Este é o ÚNICO DTO que contém presignedUrl temporária
 */
export interface ProductDownloadDTO {
  fileName: string;
  presignedUrl: string;
  expiresAt: string;
}

/**
 * NOTA: OrderDTO, OrderItemDTO e CreateOrderRequest estão definidos em checkout.ts
 * Para evitar duplicação, importe de lá: import { OrderDTO, CreateOrderRequest } from '@/types/checkout';
 */

/**
 * Stats do dashboard admin
 * Backend DTO: DashboardStats (ou similar)
 * Usado em: GET /admin/dashboard
 */
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders?: OrderDTO[];
}

/**
 * Resposta de presigned URL para upload (R2)
 * Backend DTO: PresignedUrlResponse
 * Usado em: POST /products/:id/files/upload-urls
 */
export interface PresignedUrlResponse {
  fileId: string;
  uploadUrl: string;
  expiresAt: string;
}
