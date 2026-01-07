import { apiClient } from "../client";
import {
  Product,
  User,
  ProductFile,
  PresignedUrlResponse,
  ConfirmUploadRequest,
  FileUploadRequest,
  determineFileCategory, PresignedUrlRequest,
} from "@/types";

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
    return apiClient.get<DashboardStats>("/admin/dashboard");
  }

  static async getAllProducts(
    page: number = 0,
    size: number = 20,
    search?: string,
  ): Promise<PagedResponse<Product>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: size.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    return apiClient.get<PagedResponse<Product>>(
      `/products?${params.toString()}`,
    );
  }

  static async getProductById(productId: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${productId}`);
  }

  static async getAllOrders(
    page: number = 0,
    size: number = 20,
  ): Promise<PagedResponse<any>> {
    return apiClient.get<PagedResponse<any>>(
      `/orders?page=${page}&pageSize=${size}`,
    );
  }

  static async getAllUsers(
    page: number = 0,
    size: number = 20,
    search?: string,
  ): Promise<PagedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: size.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    return apiClient.get<PagedResponse<User>>(`/users?${params.toString()}`);
  }

  static async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`);
  }

  static async updateUser(userId: string, user: Partial<User>): Promise<User> {
    return apiClient.put<User>(`/users/${userId}`, user);
  }

  static async deleteProduct(productId: string): Promise<void> {
    return apiClient.delete<void>(`/products/${productId}`);
  }

  static async deleteUser(userId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}`);
  }

  static async createProduct(product: any): Promise<Product> {
    return apiClient.post<Product>("/products", product);
  }

  static async updateProduct(
    productId: string,
    product: any,
  ): Promise<Product> {
    return apiClient.put<Product>(`/products/${productId}`, product);
  }

  // ========== MÉTODOS R2 (Cloudflare R2 Storage) ==========

  /**
   * Gera presigned URLs para upload direto ao R2
   * @param productId ID do produto
   * @param files Array de arquivos a serem uploadados
   * @returns Array com presigned URLs
   */
  static async generatePresignedUrls(
      productId: string,
      files: File[],
  ): Promise<PresignedUrlResponse[]> {
    // Importa dinamicamente para evitar erro de circular dependency
    const { determineFileCategory } = await import("@/types/productFile");

    const filesData: FileUploadRequest[] = files.map((f) => ({
      fileName: f.name,
      fileType: f.type,
      fileSize: f.size,
      category: determineFileCategory(f.name),
    }));

    return apiClient.post<PresignedUrlResponse[]>(
        `/products/${productId}/files/upload-urls`,
        {
          productId,
          files: filesData,
        },
    );
  }

  /**
   * Confirma upload bem-sucedido e cria registro no banco
   * @param data Dados do arquivo uploadado
   * @returns ProductFile criado
   */
  static async confirmUpload(data: ConfirmUploadRequest): Promise<ProductFile> {
    return apiClient.post<ProductFile>(
      `/products/${data.productId}/files`,
      data,
    );
  }

  /**
   * Lista arquivos de um produto (para admin gerenciar)
   * @param productId ID do produto
   * @returns Array de ProductFile
   */
  static async getProductFiles(productId: string): Promise<ProductFile[]> {
    return apiClient.get<ProductFile[]>(
      `/products/${productId}/files`,
    );
  }

  /**
   * Deleta arquivo do R2 e do banco
   * @param productId ID do produto
   * @param fileId ID do arquivo
   */
  static async deleteProductFile(productId: string, fileId: string): Promise<void> {
    return apiClient.delete<void>(`/products/${productId}/files/${fileId}`);
  }

  /**
   * Sincroniza ProductImages baseado nos ProductFiles categoria IMAGE
   * @param productId ID do produto
   * @returns Mensagem de confirmação
   */
  static async syncProductImages(
    productId: string,
  ): Promise<{ message: string; productId: string }> {
    return apiClient.post<{ message: string; productId: string }>(
      `/products/${productId}/files/sync`,
      {},
    );
  }
}
