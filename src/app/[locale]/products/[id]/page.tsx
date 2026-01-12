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
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1600px] w-[95%] mx-auto px-6 py-8">
        {/* Layout Grid: Coluna esquerda flexível, Coluna direita fixa em 420px */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* COLUNA ESQUERDA (Imagens e Descrição) */}
          <div className="space-y-6">
            {/* Imagem Principal com Aspect Ratio 4:3 (Padrão 3D) */}
            <div
              className="relative w-full bg-foreground/5 rounded-lg overflow-hidden border border-foreground/10"
              style={{ aspectRatio: "4/3", maxHeight: "650px" }}
            >
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={product.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  📦
                </div>
              )}
            </div>

            {/* Carrossel de Miniaturas */}
            <ImageCarousel
              images={images}
              selectedIndex={selectedImage}
              onSelectImage={setSelectedImage}
            />

            {/* Descrição detalhada */}
            {product.description && (
              <div className="border border-foreground/20 rounded-lg p-6">
                <h3 className="font-semibold mb-3 text-lg">Descrição:</h3>
                <div className="text-foreground/80 text-sm leading-relaxed">
                  {showFullDescription ? (
                    <p className="whitespace-pre-line">{product.description}</p>
                  ) : (
                    <p className="line-clamp-4 whitespace-pre-line">
                      {product.description}
                    </p>
                  )}
                  {product.description.length > 200 && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-primary mt-2 flex items-center gap-1 hover:underline font-medium"
                    >
                      {showFullDescription ? "leia menos ↑" : "leia mais ↓"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COLUNA DIREITA (Informações e Checkout) */}
          <aside className="space-y-4 lg:sticky lg:top-8">
            {/* Box de Preço e Compra */}
            <div className="border border-foreground/20 rounded-lg p-6 bg-card">
              <span className="text-xs uppercase font-bold text-primary tracking-widest">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold mt-2 leading-tight">
                {product.title}
              </h1>

              <div className="text-3xl font-bold my-6">
                R$ {product.priceInBRL.toFixed(2)}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  className="w-[75%] h-[56px] text-base font-bold tracking-wide border-2"
                >
                  COMPRAR
                </Button>
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className="w-[25%] h-[56px] inline-flex items-center justify-center border-2 border-primary/40 text-primary bg-transparent hover:bg-primary/10 transition-all rounded-lg disabled:opacity-50"
                  title={
                    isInCart ? "Já está no carrinho" : "Adicionar ao carrinho"
                  }
                >
                  <ShoppingCart className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Especificações Técnicas */}
            <div className="border border-foreground/20 rounded-lg p-6 text-sm">
              <div className="space-y-3">
                {product.fileFormats && product.fileFormats.length > 0 && (
                  <div className="flex justify-between border-b border-foreground/5 pb-2">
                    <span className="text-foreground/50">Format:</span>
                    <span className="font-medium">
                      {product.fileFormats.join(", ").toLowerCase()}
                    </span>
                  </div>
                )}
                {product.textureResolution && (
                  <div className="flex justify-between border-b border-foreground/5 pb-2">
                    <span className="text-foreground/50">Texture size:</span>
                    <span className="font-medium">
                      {product.textureResolution}
                    </span>
                  </div>
                )}
                {product.uvMapped !== undefined && (
                  <div className="flex justify-between border-b border-foreground/5 pb-2">
                    <span className="text-foreground/50">Uvmap:</span>
                    <span className="font-medium">
                      {product.uvMapped ? "Overlap" : "Non-overlap"}
                    </span>
                  </div>
                )}
                {product.polyCount && (
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Poly Count:</span>
                    <span className="font-medium">
                      {product.polyCount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Atributos Extras */}
                {(product.rigged || product.animated || product.pbr) && (
                  <div className="pt-4 mt-2 flex flex-wrap gap-2">
                    {product.rigged && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        RIGGED
                      </span>
                    )}
                    {product.animated && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        ANIMATED
                      </span>
                    )}
                    {product.pbr && (
                      <span className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        PBR
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Compatibilidade de Software */}
            <div className="border border-foreground/20 rounded-lg p-6 bg-card/30">
              <h3 className="text-[10px] font-bold mb-4 opacity-50 uppercase tracking-[0.2em]">
                Compatível com:
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "Blender",
                  "3ds Max",
                  "Maya",
                  "Cinema 4D",
                  "Corona",
                  "V-Ray",
                ].map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-center p-2 rounded border border-foreground/10 bg-foreground/5 text-[9px] font-bold uppercase tracking-tight text-center"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
