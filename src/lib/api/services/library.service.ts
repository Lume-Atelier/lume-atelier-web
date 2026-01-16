import { apiClient } from '../client';
import type { ProductFile, PageResponse } from '@/types';
import type { LibraryAssetDTO, LibraryFilter } from '@/types/library';

/**
 * Serviço de Biblioteca - Assets comprados pelo usuário
 *
 * ENDPOINTS:
 * - GET /library: Lista assets com filtros e paginação
 *
 * Para downloads, use OrderService.generateDownloadLinks(orderId)
 */
export class LibraryService {
  /**
   * Busca assets na biblioteca do usuário
   * @param filters Filtros de busca (search, category)
   * @param page Número da página (0-indexed)
   * @param pageSize Itens por página
   * @returns PageResponse<LibraryAssetDTO>
   */
  static async getMyLibrary(
    filters: LibraryFilter = {},
    page = 0,
    pageSize = 5
  ): Promise<PageResponse<LibraryAssetDTO>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.category) {
      params.append('category', filters.category);
    }

    return apiClient.get<PageResponse<LibraryAssetDTO>>(`/library?${params.toString()}`);
  }
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

