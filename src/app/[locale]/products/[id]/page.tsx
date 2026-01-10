"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useProductDetail } from "@/hooks/queries";
import { Button } from "@/components/ui/Button";
import { ImageCarousel } from "@/components/ui/ImageCarousel";

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
    <main className="min-h-screen bg-black">
      {/* Container centralizado com max-width: 1440px */}
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        {/* Grid 65% / 35% */}
        <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-8">
          {/* LEFT COLUMN (65%) - Card do Produto com fundo cinza */}
          <div className="flex flex-col gap-8">
            {/* Card do produto com padding de 40px e fundo cinza */}
            <div className="bg-zinc-900/50 rounded-lg p-10">
              {/* Main Image */}
              <div
                className="relative w-full"
                style={{ aspectRatio: "4/3" }}
              >
                <div className="relative h-full bg-zinc-800/30 rounded-lg overflow-hidden">
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
            </div>

            {/* Galeria de Miniaturas - alinhada à esquerda */}
            <div className="w-full">
              <ImageCarousel
                images={images}
                selectedIndex={selectedImage}
                onSelectImage={setSelectedImage}
              />
            </div>

            {/* Description - preenche espaço abaixo da galeria */}
            {product.description && (
              <div className="border border-zinc-700 rounded-lg p-6 flex-grow">
                <h3 className="font-semibold mb-3 text-lg text-white">
                  Descrição:
                </h3>
                <div className="text-zinc-400">
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
                      className="text-gold mt-2 flex items-center gap-1 hover:underline hover:text-gold-light transition-colors"
                    >
                      {showFullDescription ? "leia menos ↑" : "leia mais ↓"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (35%) - Informações do Produto */}
          <div className="flex flex-col gap-8">
            {/* Title, Category & Price */}
            <div className="border border-zinc-700 rounded-lg p-6">
              <span className="text-sm uppercase font-semibold text-gold">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mt-2 text-white">
                {product.title}
              </h1>
              {product.shortDescription && (
                <p className="text-zinc-400 mt-3">
                  {product.shortDescription}
                </p>
              )}
              <div className="text-3xl font-bold mt-6 mb-6 text-white">
                R$ {product.priceInBRL.toFixed(2)}
              </div>

              {/* Botões de Ação - 30% ícone + 70% comprar */}
              <div className="flex gap-3 items-stretch">
                {/* Botão Adicionar ao Carrinho - 30%, apenas ícone */}
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className="w-[30%] h-[56px] inline-flex items-center justify-center border-2 border-gold text-gold bg-transparent hover:bg-gold/10 hover:border-gold-light hover:scale-105 active:scale-110 active:animate-bounce disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
                  title={isInCart ? "Já está no carrinho" : "Adicionar ao carrinho"}
                >
                  <ShoppingCart className="w-6 h-6" />
                </button>

                {/* Botão Comprar - 70%, texto em caixa alta */}
                <Button
                  onClick={handleBuyNow}
                  variant="outline"
                  size="lg"
                  className="w-[70%] h-[56px] text-base font-bold tracking-wide"
                >
                  COMPRAR
                </Button>
              </div>
            </div>

            {/* Technical Specs */}
            <div className="border border-zinc-700 rounded-lg p-6">
              <div className="space-y-3">
                {/* Format */}
                {product.fileFormats && product.fileFormats.length > 0 && (
                  <div>
                    <span className="text-sm text-zinc-500">Format: </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {product.fileFormats.join(", ").toLowerCase()}
                    </span>
                  </div>
                )}

                {/* Texture Size */}
                {product.textureResolution && (
                  <div>
                    <span className="text-sm text-zinc-500">
                      Texture size:{" "}
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {product.textureResolution}
                    </span>
                  </div>
                )}

                {/* UV Map */}
                {product.uvMapped && (
                  <div>
                    <span className="text-sm text-zinc-500">Uvmap: </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {product.uvMapped ? "Overlap" : "Non-overlap"}
                    </span>
                  </div>
                )}

                {/* Software */}
                {product.software && product.software.length > 0 && (
                  <div>
                    <span className="text-sm text-zinc-500">Software: </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {product.software.join(", ")}
                    </span>
                  </div>
                )}

                {/* Poly Count */}
                {product.polyCount && (
                  <div>
                    <span className="text-sm text-zinc-500">
                      Poly Count (Quad):{" "}
                    </span>
                    <span className="text-sm font-medium text-zinc-300">
                      {product.polyCount.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Files */}
                {product.availableFiles &&
                  product.availableFiles.length > 0 && (
                    <div>
                      <span className="text-sm text-zinc-500">Files: </span>
                      <span className="text-sm font-medium text-zinc-300">
                        {product.availableFiles.length} arquivo(s) disponíveis
                      </span>
                    </div>
                  )}

                {/* Additional Flags */}
                {(product.rigged || product.animated || product.pbr) && (
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="flex flex-wrap gap-2">
                      {product.rigged && (
                        <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                          Rigged
                        </span>
                      )}
                      {product.animated && (
                        <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                          Animated
                        </span>
                      )}
                      {product.pbr && (
                        <span className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                          PBR
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Compatible Software */}
            <div className="border border-zinc-700 rounded-lg p-6">
              <h3 className="text-sm font-semibold mb-4 text-zinc-400">
                Compatível com:
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-center p-2 hover:text-gold transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Blender</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-gold transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">3ds Max</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-gold transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Maya</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-gold transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Cinema 4D</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-gold transition-all duration-300 opacity-70 hover:opacity-100">
                  <span className="text-sm font-semibold">Corona</span>
                </div>
                <div className="flex items-center justify-center p-2 hover:text-gold transition-all duration-300 opacity-70 hover:opacity-100">
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
