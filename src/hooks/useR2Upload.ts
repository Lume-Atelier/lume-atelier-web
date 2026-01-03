import { useState } from 'react';
import axios from 'axios';
import { AdminService } from '@/lib/api/services';
import type { ProductFile, FileCategory, PresignedUrlResponse } from '@/types';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error';
  error?: string;
}

/**
 * Hook para upload direto de arquivos ao Cloudflare R2
 *
 * Fluxo:
 * 1. Solicita presigned URLs ao backend
 * 2. Faz upload direto ao R2 usando as URLs
 * 3. Confirma upload no backend (cria registro no banco)
 */
export function useR2Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [overallProgress, setOverallProgress] = useState(0);

  /**
   * Faz upload de múltiplos arquivos
   */
  const uploadFiles = async (
    productId: string,
    files: File[],
    onComplete?: (uploadedFiles: ProductFile[]) => void,
    onError?: (error: Error) => void
  ): Promise<ProductFile[]> => {
    setUploading(true);
    const uploadedFiles: ProductFile[] = [];

    try {
      // 1. Inicializa progresso de cada arquivo
      const initialProgress = new Map<string, UploadProgress>();
      files.forEach((file) => {
        initialProgress.set(file.name, {
          fileName: file.name,
          progress: 0,
          status: 'pending',
        });
      });
      setProgress(initialProgress);

      // 2. Solicita presigned URLs ao backend
      const presignedResponses = await AdminService.generatePresignedUrls(productId, files);

      // 3. Upload direto ao R2 (em paralelo)
      await Promise.all(
        presignedResponses.map(async (presignedResponse, index) => {
          const file = files[index];

          try {
            // Atualiza status: uploading
            setProgress((prev) => {
              const newProgress = new Map(prev);
              newProgress.set(file.name, {
                ...newProgress.get(file.name)!,
                status: 'uploading',
              });
              return newProgress;
            });

            // Upload direto ao R2 usando PUT
            await axios.put(presignedResponse.presignedUrl, file, {
              headers: {
                'Content-Type': file.type,
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const fileProgress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );

                  setProgress((prev) => {
                    const newProgress = new Map(prev);
                    newProgress.set(file.name, {
                      ...newProgress.get(file.name)!,
                      progress: fileProgress,
                    });
                    return newProgress;
                  });

                  // Atualiza progresso geral
                  updateOverallProgress();
                }
              },
            });

            // Atualiza status: confirming
            setProgress((prev) => {
              const newProgress = new Map(prev);
              newProgress.set(file.name, {
                ...newProgress.get(file.name)!,
                status: 'confirming',
                progress: 100,
              });
              return newProgress;
            });

            // 4. Confirma upload no backend
            const confirmedFile = await AdminService.confirmUpload({
              productId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              r2Key: presignedResponse.r2Key,
              category: presignedResponse.category,
            });

            uploadedFiles.push(confirmedFile);

            // Atualiza status: completed
            setProgress((prev) => {
              const newProgress = new Map(prev);
              newProgress.set(file.name, {
                ...newProgress.get(file.name)!,
                status: 'completed',
              });
              return newProgress;
            });
          } catch (error) {
            console.error(`Erro ao fazer upload de ${file.name}:`, error);

            setProgress((prev) => {
              const newProgress = new Map(prev);
              newProgress.set(file.name, {
                ...newProgress.get(file.name)!,
                status: 'error',
                error: error instanceof Error ? error.message : 'Erro desconhecido',
              });
              return newProgress;
            });

            throw error;
          }
        })
      );

      onComplete?.(uploadedFiles);
      return uploadedFiles;
    } catch (error) {
      console.error('Erro no upload:', error);
      onError?.(error instanceof Error ? error : new Error('Erro no upload'));
      throw error;
    } finally {
      setUploading(false);
      setOverallProgress(0);
    }
  };

  /**
   * Calcula progresso geral baseado em todos os arquivos
   */
  const updateOverallProgress = () => {
    const progressArray = Array.from(progress.values());
    if (progressArray.length === 0) {
      setOverallProgress(0);
      return;
    }

    const totalProgress = progressArray.reduce((sum, item) => sum + item.progress, 0);
    const avgProgress = Math.round(totalProgress / progressArray.length);
    setOverallProgress(avgProgress);
  };

  /**
   * Reseta estado do upload
   */
  const reset = () => {
    setProgress(new Map());
    setOverallProgress(0);
    setUploading(false);
  };

  return {
    uploadFiles,
    uploading,
    progress: Array.from(progress.values()),
    overallProgress,
    reset,
  };
}
