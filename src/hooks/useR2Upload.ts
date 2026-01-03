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
   * Faz upload de múltiplos arquivos (resiliente - continua mesmo se alguns falharem)
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

      // 3. Upload direto ao R2 (em paralelo, resiliente)
      const results = await Promise.allSettled(
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

                    // Atualiza progresso geral com o estado atualizado
                    updateOverallProgress(newProgress);

                    return newProgress;
                  });
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

            // Atualiza status: completed
            setProgress((prev) => {
              const newProgress = new Map(prev);
              newProgress.set(file.name, {
                ...newProgress.get(file.name)!,
                status: 'completed',
              });
              return newProgress;
            });

            return confirmedFile;
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

            // NÃO faz throw - permite que outros arquivos continuem
            throw error; // Será capturado pelo allSettled
          }
        })
      );

      // Separa sucessos e falhas
      const succeeded: ProductFile[] = [];
      const failed: { fileName: string; error: string }[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          succeeded.push(result.value);
        } else {
          const fileName = files[index].name;
          const errorMsg = result.reason instanceof Error ? result.reason.message : 'Erro desconhecido';
          failed.push({ fileName, error: errorMsg });
        }
      });

      uploadedFiles.push(...succeeded);

      // Se TODOS falharam, lança erro
      if (succeeded.length === 0 && failed.length > 0) {
        const error = new Error(`Falha no upload de todos os arquivos: ${failed.map(f => f.fileName).join(', ')}`);
        onError?.(error);
        throw error;
      }

      // Se alguns falharam, avisa mas não lança erro
      if (failed.length > 0) {
        console.warn(`${failed.length} arquivo(s) falharam no upload:`, failed);
      }

      onComplete?.(uploadedFiles);
      return uploadedFiles;
    } catch (error) {
      console.error('Erro no upload:', error);

      // Só propaga erro se for erro de infraestrutura (não de arquivo individual)
      if (error instanceof Error && !error.message.includes('Falha no upload de todos os arquivos')) {
        onError?.(error);
      }

      throw error;
    } finally {
      setUploading(false);
      setOverallProgress(0);
    }
  };

  /**
   * Calcula progresso geral baseado em todos os arquivos
   */
  const updateOverallProgress = (currentProgress: Map<string, UploadProgress>) => {
    const progressArray = Array.from(currentProgress.values());
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
