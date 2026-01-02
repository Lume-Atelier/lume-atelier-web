import { apiClient } from '../client';
import type { Product } from '@/types';

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export class AdminService {
  static async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/admin/dashboard/stats');
  }

  static async getAllProducts(page: number = 0, size: number = 20): Promise<PagedResponse<Product>> {
    return apiClient.get<PagedResponse<Product>>(`/admin/products?page=${page}&size=${size}`);
  }

  static async getProductById(productId: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${productId}`);
  }

  static async getAllOrders(page: number = 0, size: number = 20): Promise<PagedResponse<any>> {
    return apiClient.get<PagedResponse<any>>(`/admin/orders?page=${page}&size=${size}`);
  }

  static async getAllUsers(page: number = 0, size: number = 20): Promise<PagedResponse<any>> {
    return apiClient.get<PagedResponse<any>>(`/admin/users?page=${page}&size=${size}`);
  }

  static async deleteProduct(productId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/products/${productId}`);
  }

  static async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/users/${userId}`);
  }

  static async createProduct(product: any): Promise<Product> {
    return apiClient.post<Product>('/admin/products', product);
  }

  static async updateProduct(productId: string, product: any): Promise<Product> {
    return apiClient.put<Product>(`/admin/products/${productId}`, product);
  }

  static async uploadProductFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ fileId: string; fileName: string; fileSize: number }> {
    return apiClient.uploadFile('/admin/upload/file', file, onProgress);
  }

  static async uploadProductImages(files: File[]): Promise<{ images: Array<{ imageOid: string; fileName: string; fileSize: number }> }> {
    if (!files || files.length === 0) {
      throw new Error('Nenhum arquivo fornecido para upload');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    return apiClient.post<{ images: Array<{ imageOid: string; fileName: string; fileSize: number }> }>('/admin/upload/images', formData, {
      timeout: 600000, // 10 minutos para uploads (tunnel pode ser lento)
    });
  }
}
