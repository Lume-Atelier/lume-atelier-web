"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { useProductDetail } from "@/hooks/queries";
import { Button } from "@/components/ui/Button";
import { ImageCarousel } from "@/components/ui/ImageCarousel";

// Constantes
const DESCRIPTION_PREVIEW_LENGTH = 150;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { addItem, items } = useCartStore();

  // React Query gerencia loading, error e cache automaticamente
  const { data: product, isLoading, error } = useProductDetail(productId);

  // Memoizar array de imagens
  const images = useMemo(() => {
    if (!product) return [];

    if (product.images && product.images.length > 0) {
      return product.images;
    }

    if (product.thumbnailUrl) {
      return [
        {
          id: "1",
          url: product.thumbnailUrl,
          alt: product.title,
          displayOrder: 0,
        },
      ];
    }

    return [];
  }, [product]);

  const currentImageUrl = images[selectedImage]?.url || product?.thumbnailUrl;
  const secondaryImageUrl = images[selectedImage + 1]?.url || images[1]?.url;

  // Função auxiliar para adicionar item ao carrinho
  const addProductToCart = () => {
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

  const handleAddToCart = () => {
    addProductToCart();
  };

  const handleBuyNow = () => {
    addProductToCart();
    router.push("/checkout");
  };

  const isInCart = items.some((item) => item.productId === productId);

  // Estado de loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar produto</h1>
        <p className="text-foreground/70 mb-6">
          Ocorreu um erro ao buscar as informações do produto.
        </p>
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

  // Produto não encontrado
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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Grid de 3 colunas: Main Image | Secondary Image | Product Info */}
          <div className="grid lg:grid-cols-[1.5fr_0.6fr_1fr] gap-4">
            {/* Coluna 1 - Imagem Principal */}
            <div className="relative w-full aspect-[4/3] bg-foreground/5 rounded-lg overflow-hidden">
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-6xl"
                  role="img"
                  aria-label="Imagem do produto não disponível"
                >
                  📦
                </div>
              )}
            </div>

            {/* Coluna 2 - Imagem Secundária */}
            <div className="relative w-full aspect-[3/4] bg-foreground/5 rounded-lg overflow-hidden">
              {secondaryImageUrl ? (
                <Image
                  src={secondaryImageUrl}
                  alt={`${product.title} - vista alternativa`}
                  fill
                  className="object-cover"
                />
              ) : currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl"
                  role="img"
                  aria-label="Imagem secundária não disponível"
                >
                  📦
                </div>
              )}
            </div>

            {/* Coluna 3 - Informações do Produto */}
            <div className="space-y-4">
              {/* Title, Category & Price */}
              <div className="border border-foreground/20 rounded-lg p-6">
                <span className="text-sm uppercase font-semibold text-primary">
                  {product.category}
                </span>
                <h1 className="text-2xl font-bold mt-2 leading-tight">
                  {product.title}
                </h1>
                {product.shortDescription && (
                  <p className="text-foreground/70 text-sm mt-2">
                    {product.shortDescription}
                  </p>
                )}
                <div className="text-3xl font-bold my-4">
                  R$ {product.priceInBRL.toFixed(2)}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isInCart}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    aria-label={
                      isInCart
                        ? "Produto já adicionado ao carrinho"
                        : "Adicionar ao carrinho"
                    }
                  >
                    {isInCart ? "No carrinho" : "Adicionar"}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    aria-label="Comprar agora"
                  >
                    Comprar
                  </Button>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="border border-foreground/20 rounded-lg p-6">
                <div className="space-y-2 text-sm">
                  {/* Format */}
                  {product.fileFormats && product.fileFormats.length > 0 && (
                    <div>
                      <span className="text-foreground/60">Formato: </span>
                      <span className="font-medium">
                        {product.fileFormats.join(", ").toLowerCase()}
                      </span>
                    </div>
                  )}

                  {/* Texture Size */}
                  {product.textureResolution && (
                    <div>
                      <span className="text-foreground/60">Textura: </span>
                      <span className="font-medium">
                        {product.textureResolution}
                      </span>
                    </div>
                  )}

                  {/* UV Map */}
                  {product.uvMapped !== undefined && (
                    <div>
                      <span className="text-foreground/60">Mapa UV: </span>
                      <span className="font-medium">
                        {product.uvMapped ? "Sobreposição" : "Sem sobreposição"}
                      </span>
                    </div>
                  )}

                  {/* Software */}
                  {product.software && product.software.length > 0 && (
                    <div>
                      <span className="text-foreground/60">Software: </span>
                      <span className="font-medium">
                        {product.software.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Poly Count */}
                  {product.polyCount && (
                    <div>
                      <span className="text-foreground/60">
                        Polígonos (Quad):{" "}
                      </span>
                      <span className="font-medium">
                        {product.polyCount.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}

                  {/* File Size */}
                  {product.availableFiles &&
                    product.availableFiles.length > 0 && (
                      <div>
                        <span className="text-foreground/60">Arquivos: </span>
                        <span className="font-medium">
                          {product.availableFiles.length} arquivo(s) disponíveis
                        </span>
                      </div>
                    )}

                  {/* Additional Flags */}
                  {(product.rigged || product.animated || product.pbr) && (
                    <div className="pt-2 border-t border-foreground/10 mt-3">
                      <div className="flex flex-wrap gap-2">
                        {product.rigged && (
                          <span className="text-xs px-2 py-1 bg-foreground/10 rounded">
                            Rigged
                          </span>
                        )}
                        {product.animated && (
                          <span className="text-xs px-2 py-1 bg-foreground/10 rounded">
                            Animado
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
                <h3 className="text-sm font-semibold mb-3 text-foreground/80">
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
                  ].map((software) => (
                    <div
                      key={software}
                      className="flex items-center justify-center p-2 hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100"
                    >
                      <span className="text-xs font-semibold">{software}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Galeria de Miniaturas - Carrossel Full Width */}
          {images.length > 1 && (
            <div className="w-full">
              <ImageCarousel
                images={images}
                selectedIndex={selectedImage}
                onSelectImage={setSelectedImage}
              />
            </div>
          )}

          {/* Description - Full Width */}
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
                {product.description.length > DESCRIPTION_PREVIEW_LENGTH && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary mt-2 flex items-center gap-1 hover:underline"
                    aria-expanded={showFullDescription}
                  >
                    {showFullDescription ? "leia menos ↑" : "leia mais ↓"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
