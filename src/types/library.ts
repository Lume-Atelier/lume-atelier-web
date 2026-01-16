/**
 * Tipos para a biblioteca do usuário
 * Corresponde aos DTOs de library no backend
 */

/**
 * Asset na biblioteca do usuário
 * Corresponde a LibraryAssetDTO no backend
 */
export interface LibraryAssetDTO {
  id: string;
  productId: string;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  orderId: string;
  purchasedAt: string;
}

/**
 * Filtros para busca na biblioteca
 */
export interface LibraryFilter {
  search?: string;
  category?: string;
}
