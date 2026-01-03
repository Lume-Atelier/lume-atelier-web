import { apiClient } from '../client';
import type { ProductFile } from '@/types';

export class LibraryService {
  // ========== MÉTODOS ANTIGOS (MANTER POR COMPATIBILIDADE) ==========
  static async generateDownloadToken(productId: string): Promise<{ token: string; downloadUrl: string }> {
    return apiClient.get(`/library/products/${productId}/download-token`);
  }

  static async downloadProduct(productId: string, filename: string): Promise<void> {
    const { token } = await this.generateDownloadToken(productId);
    await apiClient.downloadFile(`/download/token/${token}`, filename);
  }

  // ========== NOVOS MÉTODOS R2 ==========

  /**
   * Obtém lista de arquivos de um produto
   * @param productId ID do produto
   * @returns Array de ProductFile
   */
  static async getProductFiles(productId: string): Promise<ProductFile[]> {
    return apiClient.get<ProductFile[]>(`/products/${productId}/files`);
  }

  /**
   * Gera URL de download para um arquivo específico
   * Requer autenticação e verifica se usuário pode baixar (freeProduct OU compra)
   *
   * @param productId ID do produto
   * @param fileId ID do arquivo
   * @returns URL de download
   */
  static async getDownloadUrl(productId: string, fileId: string): Promise<string> {
    const response = await apiClient.get<{ url: string }>(
      `/products/${productId}/files/${fileId}/download-url`
    );
    return response.url;
  }

  /**
   * Faz download de múltiplos arquivos
   * Abre cada URL em uma nova aba/download automático
   *
   * @param productId ID do produto
   * @param fileIds Array de IDs dos arquivos
   */
  static async downloadFiles(productId: string, fileIds: string[]): Promise<void> {
    for (const fileId of fileIds) {
      try {
        const url = await this.getDownloadUrl(productId, fileId);

        // Cria link temporário para download
        const link = document.createElement('a');
        link.href = url;
        link.download = ''; // Browser detecta filename do Content-Disposition
        link.target = '_blank'; // Abre em nova aba (fallback)
        link.click();

        // Pequeno delay entre downloads para evitar bloqueio do browser
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao baixar arquivo ${fileId}:`, error);
        throw error;
      }
    }
  }

  /**
   * Faz download de todos os arquivos de um produto
   *
   * @param productId ID do produto
   */
  static async downloadAllFiles(productId: string): Promise<void> {
    const files = await this.getProductFiles(productId);
    const fileIds = files.map((f) => f.id);
    await this.downloadFiles(productId, fileIds);
  }
}
