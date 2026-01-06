import { apiClient } from '../client';
import type { ProductFile } from '@/types';

/**
 * Serviço de Biblioteca - Download de produtos comprados
 *
 * ⚠️ IMPORTANTE: O fluxo de download foi refatorado!
 *
 * FLUXO NOVO (SEGURO):
 * 1. Usuário cria pedido: POST /orders
 * 2. Admin aprova: PATCH /orders/{id}/status → COMPLETED
 * 3. Gera links: POST /orders/{id}/downloads (validação de ownership)
 * 4. Retorna presigned URLs temporárias (60 min)
 *
 * Use OrderService.generateDownloadLinks(orderId) ao invés deste serviço!
 */
export class LibraryService {
  // ========== MÉTODOS DEPRECATED ==========

  /**
   * @deprecated Endpoint /library/products/{id}/download-token foi removido
   * Use OrderService.generateDownloadLinks(orderId) ao invés
   */
  static async generateDownloadToken(
    productId: string
  ): Promise<{ token: string; downloadUrl: string }> {
    throw new Error(
      'DEPRECATED: Use OrderService.generateDownloadLinks(orderId). ' +
        'O endpoint /library/products/{id}/download-token foi removido.'
    );
  }

  /**
   * @deprecated Endpoint /download/token/{token} foi removido
   * Use OrderService.generateAndDownload(orderId) ao invés
   */
  static async downloadProduct(productId: string, filename: string): Promise<void> {
    throw new Error(
      'DEPRECATED: Use OrderService.generateAndDownload(orderId). ' +
        'O endpoint /download/token/{token} foi removido por motivos de segurança.'
    );
  }

  /**
   * @deprecated Endpoint /products/{id}/files/{fileId}/download-url foi removido
   * Use OrderService.generateDownloadLinks(orderId) ao invés
   */
  static async getDownloadUrl(productId: string, fileId: string): Promise<string> {
    throw new Error(
      'DEPRECATED: Use OrderService.generateDownloadLinks(orderId). ' +
        'Downloads agora requerem validação de pedido COMPLETED.'
    );
  }

  /**
   * @deprecated Use OrderService.generateAndDownload(orderId)
   */
  static async downloadFiles(productId: string, fileIds: string[]): Promise<void> {
    throw new Error(
      'DEPRECATED: Use OrderService.generateAndDownload(orderId). ' +
        'Downloads agora requerem pedido aprovado.'
    );
  }

  /**
   * @deprecated Use OrderService.generateAndDownload(orderId)
   */
  static async downloadAllFiles(productId: string): Promise<void> {
    throw new Error(
      'DEPRECATED: Use OrderService.generateAndDownload(orderId). ' +
        'Downloads agora requerem pedido aprovado.'
    );
  }

  // ========== MÉTODOS VÁLIDOS (ADMIN) ==========

  /**
   * [ADMIN] Obtém lista de arquivos de um produto
   * Endpoint ainda válido para gerenciamento de arquivos
   * @param productId ID do produto
   * @returns Array de ProductFile (SEM r2Key)
   */
  static async getProductFiles(productId: string): Promise<ProductFile[]> {
    return apiClient.get<ProductFile[]>(`/products/${productId}/files`);
  }
}

