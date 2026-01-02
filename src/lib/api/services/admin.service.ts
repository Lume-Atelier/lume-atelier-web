import { apiClient } from '../client';
import type { Product } from '@/types';

export class AdminService {
  static async getDashboardStats() {
    return apiClient.get('/admin/dashboard/stats');
  }

  static async getAllProducts(page: number = 0, size: number = 20) {
    return apiClient.get(`/admin/products?page=${page}&size=${size}`);
  }

  static async getProductById(productId: string) {
    return apiClient.get(`/products/${productId}`);
  }

  static async getAllOrders(page: number = 0, size: number = 20) {
    return apiClient.get(`/admin/orders?page=${page}&size=${size}`);
  }

  static async getAllUsers(page: number = 0, size: number = 20) {
    return apiClient.get(`/admin/users?page=${page}&size=${size}`);
  }

  static async deleteProduct(productId: string) {
    return apiClient.delete(`/admin/products/${productId}`);
  }

  static async deleteUser(userId: string) {
    return apiClient.delete(`/admin/users/${userId}`);
  }

  static async createProduct(product: any) {
    return apiClient.post('/admin/products', product);
  }

  static async updateProduct(productId: string, product: any) {
    return apiClient.put(`/admin/products/${productId}`, product);
  }

  static async uploadProductFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ fileId: string; fileName: string; fileSize: number }> {
    return apiClient.uploadFile('/admin/upload/file', file, onProgress);
  }

  static async uploadProductImages(files: File[]) {
    if (!files || files.length === 0) {
      throw new Error('Nenhum arquivo fornecido para upload');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    return apiClient.post('/admin/upload/images', formData, {
      timeout: 600000, // 10 minutos para uploads (tunnel pode ser lento)
    });
  }
}
