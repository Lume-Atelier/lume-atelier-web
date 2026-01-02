import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group border border-foreground/20 rounded-lg overflow-hidden hover:border-primary transition-all">
        {/* Image */}
        <div className="relative aspect-square bg-foreground/5">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📦
            </div>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-primary text-background px-2 py-1 text-xs font-bold rounded">
              FEATURED
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-sm text-foreground/60 mb-3 line-clamp-2">
            {product.shortDescription || product.description}
          </p>

          {/* Features */}
          <div className="flex gap-2 mb-3 text-xs">
            {product.rigged && (
              <span className="px-2 py-1 bg-foreground/10 rounded">Rigged</span>
            )}
            {product.animated && (
              <span className="px-2 py-1 bg-foreground/10 rounded">Animated</span>
            )}
            {product.pbr && (
              <span className="px-2 py-1 bg-foreground/10 rounded">PBR</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              R$ {product.priceInBRL.toFixed(2)}
            </span>
            <span className="text-xs text-foreground/60">
              {product.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
