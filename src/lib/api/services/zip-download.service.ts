import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ProductDownloadDTO, SecureFileDownload } from '@/types';

export interface DownloadProgress {
  totalFiles: number;
  completedFiles: number;
  currentFile: string;
  totalBytes: number;
  downloadedBytes: number;
  status: 'idle' | 'downloading' | 'zipping' | 'complete' | 'error';
  error?: string;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * Serviço para download de arquivos como ZIP
 * Usa JSZip para criar ZIP no browser sem passar pelo backend
 */
export class ZipDownloadService {
  private static readonly CONCURRENT_LIMIT = 3;

  /**
   * Faz download de todos os arquivos e cria ZIP com estrutura de pastas
   * @param downloadDTO - DTO com presigned URLs do backend
   * @param productName - Nome do produto (para nome do ZIP)
   * @param onProgress - Callback para atualizar UI
   */
  static async downloadAsZip(
    downloadDTO: ProductDownloadDTO,
    productName: string,
    onProgress?: ProgressCallback
  ): Promise<void> {
    const zip = new JSZip();
    const files = downloadDTO.files;

    if (files.length === 0) {
      throw new Error('Nenhum arquivo disponível para download');
    }

    // Calcular total de bytes (estimativa baseada no fileSizeMB)
    const totalBytes = files.reduce(
      (sum, f) => sum + this.parseSizeMB(f.fileSizeMB),
      0
    );

    let downloadedBytes = 0;
    let completedFiles = 0;

    // Criar estrutura de pastas no ZIP
    const modelFolder = zip.folder('model');
    const textureFolder = zip.folder('texture');

    // Download em batches para não sobrecarregar o browser
    for (let i = 0; i < files.length; i += this.CONCURRENT_LIMIT) {
      const batch = files.slice(i, i + this.CONCURRENT_LIMIT);

      const downloadPromises = batch.map(async (file) => {
        onProgress?.({
          totalFiles: files.length,
          completedFiles,
          currentFile: file.fileName,
          totalBytes,
          downloadedBytes,
          status: 'downloading',
        });

        try {
          const response = await fetch(file.presignedUrl);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const blob = await response.blob();

          // Adicionar ao folder correto baseado na categoria
          const folder = this.getFolderForCategory(
            file.category,
            modelFolder,
            textureFolder,
            zip
          );
          folder?.file(file.fileName, blob);

          downloadedBytes += blob.size;
          completedFiles++;

          return { success: true, file };
        } catch (error) {
          console.error(`Erro ao baixar ${file.fileName}:`, error);
          return { success: false, file, error };
        }
      });

      await Promise.all(downloadPromises);
    }

    // Verificar se pelo menos alguns arquivos foram baixados
    if (completedFiles === 0) {
      onProgress?.({
        totalFiles: files.length,
        completedFiles: 0,
        currentFile: '',
        totalBytes,
        downloadedBytes: 0,
        status: 'error',
        error: 'Nenhum arquivo foi baixado com sucesso',
      });
      throw new Error('Nenhum arquivo foi baixado com sucesso');
    }

    // Gerar ZIP
    onProgress?.({
      totalFiles: files.length,
      completedFiles,
      currentFile: 'Criando ZIP...',
      totalBytes,
      downloadedBytes,
      status: 'zipping',
    });

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Sanitizar nome do arquivo
    const safeProductName = productName
      .replace(/[^a-zA-Z0-9-_\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    const zipFileName = `${safeProductName}_lume-atelier.zip`;

    // Trigger download
    saveAs(zipBlob, zipFileName);

    onProgress?.({
      totalFiles: files.length,
      completedFiles,
      currentFile: '',
      totalBytes,
      downloadedBytes,
      status: 'complete',
    });
  }

  /**
   * Determina a pasta correta no ZIP baseado na categoria do arquivo
   */
  private static getFolderForCategory(
    category: string,
    modelFolder: JSZip | null,
    textureFolder: JSZip | null,
    rootZip: JSZip
  ): JSZip | null {
    switch (category.toUpperCase()) {
      case 'MODEL':
        return modelFolder;
      case 'TEXTURE':
        return textureFolder;
      case 'ARCHIVE':
        return modelFolder; // .mlt e outros arquivos de projeto vão em model/
      default:
        return rootZip; // Fallback para raiz
    }
  }

  /**
   * Converte string de tamanho (ex: "15.5 MB") para bytes
   */
  private static parseSizeMB(sizeMB: string): number {
    const match = sizeMB.match(/[\d.]+/);
    if (!match) return 0;
    return parseFloat(match[0]) * 1024 * 1024;
  }
}
