import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { OrderService } from '@/lib/api/services';
import {
  ZipDownloadService,
  type DownloadProgress,
} from '@/lib/api/services/zip-download.service';

const initialProgress: DownloadProgress = {
  totalFiles: 0,
  completedFiles: 0,
  currentFile: '',
  totalBytes: 0,
  downloadedBytes: 0,
  status: 'idle',
};

/**
 * Hook para download de arquivos como ZIP com progresso
 *
 * Fluxo:
 * 1. Chama backend para obter presigned URLs
 * 2. Faz download dos arquivos em paralelo
 * 3. Cria ZIP com estrutura de pastas (model/, texture/)
 * 4. Salva o ZIP no dispositivo do usuário
 */
export function useZipDownload() {
  const [progress, setProgress] = useState<DownloadProgress>(initialProgress);

  const downloadMutation = useMutation({
    mutationFn: async ({
      orderId,
      productName,
    }: {
      orderId: string;
      productName: string;
    }) => {
      // Reset progress
      setProgress({ ...initialProgress, status: 'downloading' });

      // 1. Gerar links de download (validação de segurança no backend)
      const downloadDTO = await OrderService.generateDownloadLinks(orderId);

      // 2. Fazer download e criar ZIP
      await ZipDownloadService.downloadAsZip(downloadDTO, productName, setProgress);
    },
    onError: (error) => {
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }));
    },
  });

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  const download = useCallback(
    (orderId: string, productName: string) => {
      downloadMutation.mutate({ orderId, productName });
    },
    [downloadMutation]
  );

  return {
    download,
    downloadAsync: downloadMutation.mutateAsync,
    isDownloading: downloadMutation.isPending,
    progress,
    resetProgress,
    error: downloadMutation.error,
  };
}
