'use client';

import { useZipDownload } from '@/hooks/queries';
import { Button } from '@/components/ui/Button';

interface DownloadProgressButtonProps {
  orderId: string;
  productName: string;
  className?: string;
}

/**
 * Botao de download com barra de progresso
 * Baixa todos os arquivos do pedido e cria um ZIP
 */
export function DownloadProgressButton({
  orderId,
  productName,
  className,
}: DownloadProgressButtonProps) {
  const { download, isDownloading, progress } = useZipDownload();

  const handleDownload = () => {
    download(orderId, productName);
  };

  const getProgressPercent = () => {
    if (progress.totalFiles === 0) return 0;
    return Math.round((progress.completedFiles / progress.totalFiles) * 100);
  };

  const getButtonText = () => {
    switch (progress.status) {
      case 'downloading':
        return `Baixando... ${getProgressPercent()}%`;
      case 'zipping':
        return 'Criando ZIP...';
      case 'complete':
        return 'Download Concluido!';
      case 'error':
        return 'Erro - Tentar Novamente';
      default:
        return 'Baixar ZIP';
    }
  };

  const isComplete = progress.status === 'complete';
  const isError = progress.status === 'error';

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={handleDownload}
        disabled={isDownloading && !isError}
        variant={isComplete ? 'secondary' : isError ? 'destructive' : 'outline'}
        size="md"
        loading={isDownloading && progress.status !== 'error'}
      >
        {getButtonText()}
      </Button>

      {/* Barra de progresso durante download */}
      {isDownloading && progress.status === 'downloading' && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300 ease-out"
            style={{ width: `${getProgressPercent()}%` }}
          />
        </div>
      )}

      {/* Arquivo atual sendo baixado */}
      {isDownloading && progress.currentFile && progress.status === 'downloading' && (
        <p className="text-xs text-foreground/50 mt-2 truncate max-w-[200px]">
          {progress.currentFile}
        </p>
      )}

      {/* Mensagem de erro */}
      {isError && progress.error && (
        <p className="text-xs text-destructive mt-2">{progress.error}</p>
      )}
    </div>
  );
}
