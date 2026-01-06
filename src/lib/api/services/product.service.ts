import { apiClient } from '../client';
import type {
  ProductSummaryDTO,
  ProductDetailDTO,
  ProductFilter,
  PageResponse,
  ProductListResponse,
  Product,
} from '@/types';

/**
 * Serviço de Produtos - Refatorado para usar novos DTOs
 * ✅ Usa PageResponse<ProductSummaryDTO> para listagens
 * ✅ Usa ProductDetailDTO para detalhes
 */
export class ProductService {
  /**
   * Lista produtos com filtros e paginação
   * @returns PageResponse<ProductSummaryDTO> - Listagem pública SEM r2Key
   */
  static async getProducts(
    filters?: ProductFilter,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<ProductSummaryDTO>> {
    const params = new URLSearchParams();

    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.rigged !== undefined) params.append('rigged', filters.rigged.toString());
    if (filters?.animated !== undefined) params.append('animated', filters.animated.toString());
    if (filters?.pbr !== undefined) params.append('pbr', filters.pbr.toString());
    if (filters?.search) params.append('search', filters.search);

    params.append('page', page.toString());
    params.append('pageSize', size.toString());

    return apiClient.get<PageResponse<ProductSummaryDTO>>(`/products?${params.toString()}`);
  }

  /**
   * Obtém detalhes de um produto específico
   * @returns ProductDetailDTO - Detalhes completos SEM r2Key ou presignedUrl
   */
  static async getProductById(id: string): Promise<ProductDetailDTO> {
    return apiClient.get<ProductDetailDTO>(`/products/${id}`);
  }

  /**
   * Lista produtos em destaque
   * @returns PageResponse<ProductSummaryDTO>
   */
  static async getFeaturedProducts(
    page: number = 0,
    size: number = 8
  ): Promise<PageResponse<ProductSummaryDTO>> {
    return apiClient.get<PageResponse<ProductSummaryDTO>>(
      `/products?featured=true&page=${page}&pageSize=${size}`
    );
  }

  /**
   * Lista produtos por categoria
   * @returns PageResponse<ProductSummaryDTO>
   */
  static async getProductsByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<ProductSummaryDTO>> {
    return apiClient.get<PageResponse<ProductSummaryDTO>>(
      `/products?category=${category}&page=${page}&pageSize=${size}`
    );
  }

  /**
   * Busca produtos por query
   * @returns PageResponse<ProductSummaryDTO>
   */
  static async searchProducts(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<ProductSummaryDTO>> {
    return apiClient.get<PageResponse<ProductSummaryDTO>>(
      `/products?search=${encodeURIComponent(query)}&page=${page}&pageSize=${size}`
    );
  }

  /**
   * Lista categorias disponíveis
   */
  static async getCategories(): Promise<{ value: string; label: string }[]> {
    return apiClient.get<{ value: string; label: string }[]>('/categories');
  }

  // ========== MÉTODOS DEPRECATED (compatibilidade temporária) ==========

  /**
   * @deprecated Use getProducts() que retorna PageResponse<ProductSummaryDTO>
   */
  static async getProductsLegacy(
    filters?: ProductFilter,
    page: number = 0,
    size: number = 20
  ): Promise<ProductListResponse> {
    const response = await this.getProducts(filters, page, size);
    return {
      products: response.content as unknown as Product[],
      total: response.totalElements,
      page: response.currentPage,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  }
}
