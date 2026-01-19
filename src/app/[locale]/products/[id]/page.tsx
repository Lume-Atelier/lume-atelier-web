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
      <div className="w-full mx-auto px-6 py-8 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8 items-start max-w-[1500px]">
          <div className="space-y-6 w-full">
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

            {/* Seção de Licença de Uso */}
            <div className="border border-foreground/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Licença de Uso
              </h3>

              <div className="text-foreground/90 font-semibold mb-3">
                Uso Comercial Não Redistribuível
              </div>

              <ul className="space-y-2 text-sm text-foreground/70">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Você pode usar este asset em seus projetos comerciais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Uso permitido em projetos para clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Revenda ou redistribuição do asset original proibida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">✗</span>
                  <span>Compartilhamento dos arquivos fonte proibido</span>
                </li>
              </ul>
            </div>
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
              <h3 className="text-base font-normal mt-2 leading-relaxed text-foreground/70">
                {product.shortDescription}
              </h3>

              <div className="text-3xl font-bold my-6">
                R$ {product.priceInBRL.toFixed(2)}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-base font-bold tracking-wide border-2"
                >
                  Comprar
                </Button>
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className="w-14 h-14 flex-shrink-0 inline-flex items-center justify-center border-2 border-gold text-gold bg-transparent hover:bg-gold/10 hover:border-gold-light hover:scale-105 active:scale-110 active:animate-bounce disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
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
                  <div className="flex justify-between border-b border-foreground/5 pb-2">
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
                      <span className="text-[11px] font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        RIGGED
                      </span>
                    )}
                    {product.animated && (
                      <span className="text-[11px] font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        ANIMATED
                      </span>
                    )}
                    {product.pbr && (
                      <span className="text-[11px] font-bold px-2 py-1 bg-primary/10 text-primary rounded">
                        PBR
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Compatibilidade de Software */}
            <div className="border border-foreground/20 rounded-lg p-6 bg-card/30">
              <h3 className="text-xs font-bold mb-4 opacity-50 uppercase tracking-[0.2em]">
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
                    className="flex items-center justify-center p-2 rounded border border-foreground/10 bg-foreground/5 text-[11px] sm:text-xs font-bold uppercase tracking-tight text-center"
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
