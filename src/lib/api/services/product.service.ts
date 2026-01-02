import { apiClient } from '../client';
import type { Product, ProductFilter, ProductListResponse } from '@/types';

export class ProductService {
  static async getProducts(
    filters?: ProductFilter,
    page: number = 0,
    size: number = 20
  ): Promise<ProductListResponse> {
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

    return apiClient.get<ProductListResponse>(`/products?${params.toString()}`);
  }

  static async getProductById(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  }

  static async getFeaturedProducts(page: number = 0, size: number = 8): Promise<ProductListResponse> {
    return apiClient.get<ProductListResponse>(`/products?featured=true&page=${page}&pageSize=${size}`);
  }

  static async getProductsByCategory(
    category: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProductListResponse> {
    return apiClient.get<ProductListResponse>(`/products?category=${category}&page=${page}&pageSize=${size}`);
  }

  static async searchProducts(
    query: string,
    page: number = 0,
    size: number = 20
  ): Promise<ProductListResponse> {
    return apiClient.get<ProductListResponse>(`/products?search=${encodeURIComponent(query)}&page=${page}&pageSize=${size}`);
  }

  static async getCategories(): Promise<{ value: string; label: string }[]> {
    return apiClient.get<{ value: string; label: string }[]>('/categories');
  }
}
