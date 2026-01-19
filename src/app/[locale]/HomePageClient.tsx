"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";
import { useFeaturedProducts } from "@/hooks/queries";
import { HeroBackground } from "@/components/features/hero/HeroBackground";

interface HomePageClientProps {
  heroBackgrounds: string[];
}

export function HomePageClient({ heroBackgrounds }: HomePageClientProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // React Query gerencia loading, error, e cache automaticamente
  const { data, isLoading, error } = useFeaturedProducts(0, 6);
  const featuredProducts = data?.content || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("HomePage - Current theme:", theme);
  }, [theme]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section com Background Dinâmico - Tela cheia desde o topo */}
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden -mt-[64px] pt-[64px]">
        {/* Background rotativo */}
        <HeroBackground images={heroBackgrounds} />

        {/* Conteúdo (relativo ao background) */}
        <div className="container relative z-10">
          <div className="text-center">
            {/* Logo - Sempre branco sobre o background escurecido */}
            <div className="mb-8">
              <Image
                src="/assets/logo-dark.png"
                alt="Lume Atelier"
                width={600}
                height={300}
                className="mx-auto mb-8 drop-shadow-2xl"
                priority
              />
            </div>

            {/* Description - Texto branco para contraste */}
            <h1 className="text-2xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">
              Eleve o nível dos seus projetos com modelos 3D de Luxo
            </h1>
            <p className="text-lg text-white/90 mb-12 max-w-2xl mx-auto drop-shadow-md">
              Modelos 3D de alta gama com topologia impecável, prontos para
              elevar o realismo das suas cenas profissionais.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                href="/products"
                size="xl"
                className="!bg-[#d4a955] dark:!text-black !text-black hover:!bg-[#c99944] !border-2 !border-[#d4a955] shadow-xl"
              >
                Explorar Modelos
              </Button>
              <Button
                href="/categories"
                variant="outline"
                size="xl"
                className="!border-white !text-white hover:!bg-white/10 shadow-xl"
              >
                Explorar Categorias
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Compatible Software */}
      <section className="py-12 border-y border-foreground/20">
        <div className="container">
          <h3 className="text-center text-lg font-semibold mb-8 text-foreground/80">
            Compatível com:
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            <div className="text-center hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
              <span className="text-xl font-semibold">Blender</span>
            </div>
            <div className="text-center hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
              <span className="text-xl font-semibold">3ds Max</span>
            </div>
            <div className="text-center hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
              <span className="text-xl font-semibold">Maya</span>
            </div>
            <div className="text-center hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
              <span className="text-xl font-semibold">Cinema 4D</span>
            </div>
            <div className="text-center hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
              <span className="text-xl font-semibold">Corona</span>
            </div>
            <div className="text-center hover:text-primary transition-all duration-300 opacity-70 hover:opacity-100">
              <span className="text-xl font-semibold">V-Ray</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Produtos em Destaque
            </h2>
            <p className="text-foreground/70">
              Explore nossa seleção de modelos mais populares
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center">
                <Link href="/products">
                  <Button variant="outline" size="lg">
                    Ver Todos os Produtos
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-foreground/60">
              Nenhum produto em destaque no momento.
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-card border-y border-foreground/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Categorias</h2>
            <p className="text-foreground/70">
              Encontre o modelo perfeito para seu projeto
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Cama e Banho", icon: "🛏️" },
              { name: "Mesas", icon: "🪑" },
              { name: "Armazenamento", icon: "🗄️" },
              { name: "Iluminação", icon: "💡" },
              { name: "Decoração", icon: "🎨" },
              { name: "Eletrodomésticos", icon: "🔌" },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toUpperCase()}`}
                className="p-6 border-2 border-foreground/20 rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold group-hover:text-primary transition">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Language Switcher */}
      <section className="py-12">
        <div className="container">
          <div className="text-center">
            <p className="text-sm text-foreground/60 mb-4">
              Idiomas disponíveis:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="/pt-BR">
                <Button variant="muted" size="sm">
                  🇧🇷 Português
                </Button>
              </a>
              <a href="/en-US">
                <Button variant="muted" size="sm">
                  🇺🇸 English
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
