"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { useProductDetail } from "@/hooks/queries";
import { Button } from "@/components/ui/Button";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { ShoppingCart } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { addItem, items } = useCartStore();

  // React Query gerencia loading, error e cache automaticamente
  const { data: product, isLoading, error } = useProductDetail(productId);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      title: product.title,
      thumbnailUrl: product.thumbnailUrl,
      priceInBRL: product.priceInBRL,
      displayPrice: product.priceInBRL,
      displayCurrency: "BRL",
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      title: product.title,
      thumbnailUrl: product.thumbnailUrl,
      priceInBRL: product.priceInBRL,
      displayPrice: product.priceInBRL,
      displayCurrency: "BRL",
    });

    router.push("/checkout");
  };

  const isInCart = items.some((item) => item.productId === productId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
        <Button
          onClick={() => router.push("/products")}
          variant="outline"
          size="lg"
        >
          Voltar para Produtos
        </Button>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnailUrl
        ? [
            {
              id: "1",
              url: product.thumbnailUrl,
              alt: product.title,
              displayOrder: 0,
            },
          ]
        : [];

  const currentImageUrl = images[selectedImage]?.url || product.thumbnailUrl;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* Left Column - Gallery & Description */}
          <div className="space-y-4">
            {/* Main Image - Reduced size */}
            <div
              className="relative w-full"
              style={{ aspectRatio: "4/3", maxHeight: "650px" }}
            >
              <div className="relative h-full bg-foreground/5 rounded-lg overflow-hidden">
                {currentImageUrl ? (
                  <Image
                    src={currentImageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    📦
                  </div>
                )}
              </div>
            </div>

            {/* Galeria de Miniaturas - Carrossel Horizontal 16:9 */}
            <ImageCarousel
              images={images}
              selectedIndex={selectedImage}
              onSelectImage={setSelectedImage}
            />

            {/* Description */}
            {product.description && (
              <div className="border border-foreground/20 rounded-lg p-6">
                <h3 className="font-semibold mb-3 text-lg">Descrição:</h3>
                <div className="text-foreground/80">
                  {showFullDescription ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="line-clamp-3 whitespace-pre-line">
                      {product.description}
                    </p>
                  )}
                  {product.description.length > 150 && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-primary mt-2 flex items-center gap-1 hover:underline"
                    >
                      {showFullDescription ? "leia menos ↑" : "leia mais ↓"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Info & Specs */}
          <div className="space-y-4">
            {/* Title & Category - Boxed */}
            {/* Price & Actions */}
            <div className="border border-foreground/20 rounded-lg p-6">
              <span className="text-sm uppercase font-semibold text-primary">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mt-2">{product.title}</h1>
              {product.shortDescription && (
                <p className="text-foreground/70 mt-3">
                  {product.shortDescription}
                </p>
              )}
              <div className="text-3xl font-bold mb-4">
                R$ {product.priceInBRL.toFixed(2)}
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  className="w-[70%] h-[56px] text-base font-bold tracking-wide"
                >
                  COMPRAR
                </Button>
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className="w-[30%] h-[56px] inline-flex items-center justify-center border-2 border-gold text-gold bg-transparent hover:bg-gold/10 hover:border-gold-light hover:scale-105 active:scale-110 active:animate-bounce disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
                  title={
                    isInCart ? "Já está no carrinho" : "Adicionar ao carrinho"
                  }
                >
                  <ShoppingCart className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Technical Specs - Compact */}
            <div className="border border-foreground/20 rounded-lg p-6">
              <div className="space-y-3">
                {/* Format */}
                {product.fileFormats && product.fileFormats.length > 0 && (
                  <div>
                    <span className="text-sm text-foreground/60">Format: </span>
                    <span className="text-sm font-medium">
                      {product.fileFormats.join(", ").toLowerCase()}
                    </span>
                  </div>
                )}

                {/* Texture Size */}
                {product.textureResolution && (
                  <div>
                    <span className="text-sm text-foreground/60">
                      Texture size:{" "}
                    </span>
                    <span className="text-sm font-medium">
                      {product.textureResolution}
                    </span>
                  </div>
                )}

                {/* UV Map */}
                {product.uvMapped && (
                  <div>
                    <span className="text-sm text-foreground/60">Uvmap: </span>
                    <span className="text-sm font-medium">
                      {product.uvMapped ? "Overlap" : "Non-overlap"}
                    </span>
                  </div>
                )}

                {/* Software */}
                {product.software && product.software.length > 0 && (
                  <div>
                    <span className="text-sm text-foreground/60">
                      Software:{" "}
                    </span>
                    <span className="text-sm font-medium">
                      {product.software.join(", ")}
                    </span>
                  </div>
                )}

                {/* Poly Count */}
                {product.polyCount && (
                  <div>
                    <span className="text-sm text-foreground/60">
                      Poly Count (Quad):{" "}
                    </span>
                    <span className="text-sm font-medium">
                      {product.polyCount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* File Size - agora vem de availableFiles */}
                {product.availableFiles &&
                  product.availableFiles.length > 0 && (
                    <div>
                      <span className="text-sm text-foreground/60">
                        Files:{" "}
                      </span>
                      <span className="text-sm font-medium">
                        {product.availableFiles.length} arquivo(s) disponíveis
                      </span>
                    </div>
                  )}

                {/* Additional Flags */}
                {(product.rigged || product.animated || product.pbr) && (
                  <div className="pt-2 border-t border-foreground/10">
                    <div className="flex flex-wrap gap-2">
                      {product.rigged && (
                        <span className="text-xs px-2 py-1 bg-foreground/10 rounded">
                          Rigged
                        </span>
                      )}
                      {product.animated && (
                        <span className="text-xs px-2 py-1 bg-foreground/10 rounded">
                          Animated
                        </span>
                      )}
                      {product.pbr && (
                        <span className="text-xs px-2 py-1 bg-foreground/10 rounded">
                          PBR
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compatible Software */}
            <div className="border border-foreground/20 rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-4 text-foreground/80">
                Compatível com:
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Blender</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">3ds Max</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Maya</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Cinema 4D</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Corona</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">V-Ray</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
