import { apiClient } from '../client';
import type { Product, User, ProductFile, PresignedUrlResponse, ConfirmUploadRequest, FileUploadRequest, determineFileCategory } from '@/types';

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

  static async getAllProducts(page: number = 0, size: number = 20, search?: string): Promise<PagedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    return apiClient.get<PagedResponse<Product>>(`/admin/products?${params.toString()}`);
  }

  static async getProductById(productId: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${productId}`);
  }

  static async getAllOrders(page: number = 0, size: number = 20): Promise<PagedResponse<any>> {
    return apiClient.get<PagedResponse<any>>(`/admin/orders?page=${page}&size=${size}`);
  }

  static async getAllUsers(page: number = 0, size: number = 20, search?: string): Promise<PagedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    return apiClient.get<PagedResponse<User>>(`/admin/users?${params.toString()}`);
  }

  static async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/admin/users/${userId}`);
  }

  static async updateUser(userId: string, user: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/admin/users/${userId}`, user);
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

  // ========== NOVOS MÉTODOS R2 ==========

  /**
   * Gera presigned URLs para upload direto ao R2
   * @param productId ID do produto
   * @param files Array de arquivos a serem uploadados
   * @returns Array com presigned URLs
   */
  static async generatePresignedUrls(
    productId: string,
    files: File[]
  ): Promise<PresignedUrlResponse[]> {
    // Importa dinamicamente para evitar erro de circular dependency
    const { determineFileCategory } = await import('@/types/productFile');

    const filesData: FileUploadRequest[] = files.map((f) => ({
      fileName: f.name,
      fileType: f.type,
      fileSize: f.size,
      category: determineFileCategory(f.name),
    }));

    return apiClient.post<PresignedUrlResponse[]>('/admin/upload/r2/presigned-urls', {
      productId,
      files: filesData,
    });
  }

  /**
   * Confirma upload bem-sucedido e cria registro no banco
   * @param data Dados do arquivo uploadado
   * @returns ProductFile criado
   */
  static async confirmUpload(data: ConfirmUploadRequest): Promise<ProductFile> {
    return apiClient.post<ProductFile>('/admin/upload/r2/confirm', data);
  }

  /**
   * Lista arquivos de um produto (para admin gerenciar)
   * @param productId ID do produto
   * @returns Array de ProductFile
   */
  static async getProductFiles(productId: string): Promise<ProductFile[]> {
    return apiClient.get<ProductFile[]>(`/admin/upload/r2/products/${productId}/files`);
  }

  /**
   * Deleta arquivo do R2 e do banco
   * @param fileId ID do arquivo
   */
  static async deleteProductFile(fileId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/upload/r2/files/${fileId}`);
  }
}
