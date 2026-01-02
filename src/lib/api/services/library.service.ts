import { apiClient } from '../client';

export class LibraryService {
  static async generateDownloadToken(productId: string): Promise<{ token: string; downloadUrl: string }> {
    return apiClient.get(`/library/products/${productId}/download-token`);
  }

  static async downloadProduct(productId: string, filename: string): Promise<void> {
    const { token } = await this.generateDownloadToken(productId);
    await apiClient.downloadFile(`/download/token/${token}`, filename);
  }
}
