import Image from 'next/image';
import Link from 'next/link';
import { ProductSummaryDTO } from '@/types';

interface ProductCardProps {
  product: ProductSummaryDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="group relative overflow-hidden rounded-lg bg-foreground/5">
        {/* Image Container - Proporção 4:3 (padrão para renders 3D) */}
        <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📦
            </div>
          )}

          {/* Featured Badge - Sempre visível quando aplicável */}
          {product.featured && (
            <span className="absolute top-3 right-3 bg-primary text-black px-3 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider z-10">
              Destaque
            </span>
          )}

          {/* Hover Overlay - Estilo Behance */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {/* Title */}
              <h3 className="text-lg font-bold mb-2 line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {product.title}
              </h3>

              {/* Price and Category */}
              <div className="flex items-center justify-between transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                <span className="text-2xl font-bold text-primary">
                  R$ {product.priceInBRL.toFixed(2)}
                </span>
                <span className="text-xs text-white/70 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Free Badge */}
              {product.freeProduct && (
                <div className="mt-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                  <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-md uppercase">
                    Grátis
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
