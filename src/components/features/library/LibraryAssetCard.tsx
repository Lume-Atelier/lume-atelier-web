'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DownloadProgressButton } from '@/components/features/download/DownloadProgressButton';
import type { LibraryAssetDTO } from '@/types/library';

interface LibraryAssetCardProps {
  asset: LibraryAssetDTO;
  locale: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  CAMA_BANHO: 'Cama & Banho',
  MESAS: 'Mesas',
  ARMAZENAMENTO: 'Armazenamento',
  ILUMINACAO: 'Iluminacao',
  DECORACAO: 'Decoracao',
  ASSENTOS: 'Assentos',
  ELETRODOMESTICOS: 'Eletrodomesticos',
};

export function LibraryAssetCard({ asset, locale }: LibraryAssetCardProps) {
  const categoryLabel = CATEGORY_LABELS[asset.category] || asset.category;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 hover:border-gold/30">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {asset.thumbnailUrl ? (
          <Image
            src={asset.thumbnailUrl}
            alt={asset.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-16 h-16 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-background/90 backdrop-blur-sm rounded-md text-foreground">
          {categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-gold transition-colors">
          {asset.title}
        </h3>

        {/* Purchase date */}
        <p className="text-sm text-muted-foreground">
          Comprado em {formatDate(asset.purchasedAt)}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            href={`/${locale}/products/${asset.productId}`}
            variant="ghost"
            size="sm"
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          <DownloadProgressButton
            orderId={asset.orderId}
            productName={asset.title}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
