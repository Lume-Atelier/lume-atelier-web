'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductService } from '@/lib/api/services';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';
import type { Product } from '@/types';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('HomePage - Current theme:', theme);
  }, [theme]);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await ProductService.getFeaturedProducts(0, 6);
      setFeaturedProducts(response.products || []);
    } catch (error) {
      console.error('Erro ao carregar produtos em destaque:', error);
      // Não falhar se não houver produtos, apenas mostrar vazio
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center py-16 border-b border-foreground/20">
        <div className="container">
          <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            {theme === 'dark' ? (
              <Image
                src="/assets/logo-dark.png"
                alt="Lume Atelier"
                width={600}
                height={300}
                className="mx-auto mb-8"
                priority
              />
            ) : (
              <Image
                src="/assets/logo-light.png"
                alt="Lume Atelier"
                width={600}
                height={300}
                className="mx-auto mb-8"
                priority
              />
            )}
          </div>

          {/* Description */}
          <h1 className="text-2xl md:text-5xl font-bold mb-6">
            Eleve o nível dos seus projetos com modelos 3D de Luxo
          </h1>
          <p className="text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">
            Modelos 3D de alta gama com topologia impecável, prontos para elevar o realismo das suas cenas profissionais.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              href="/products"
              size="xl"
              className="!bg-[#d4a955] dark:!text-black !text-black hover:!bg-[#c99944] !border-2 !border-[#d4a955]"
            >
              Explorar Modelos
            </Button>
            <Button href="/categories" variant="outline" size="xl">
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
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
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

          {loading ? (
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Categorias
            </h2>
            <p className="text-foreground/70">
              Encontre o modelo perfeito para seu projeto
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Characters', icon: '🧍' },
              { name: 'Environments', icon: '🏞️' },
              { name: 'Props', icon: '🔧' },
              { name: 'Vehicles', icon: '🚗' },
              { name: 'Textures', icon: '🎨' },
              { name: 'Animations', icon: '🎬' },
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
            <p className="text-sm text-foreground/60 mb-4">Idiomas disponíveis:</p>
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
              <a href="/es-ES">
                <Button variant="muted" size="sm">
                  🇪🇸 Español
                </Button>
              </a>
              <a href="/fr-FR">
                <Button variant="muted" size="sm">
                  🇫🇷 Français
                </Button>
              </a>
              <a href="/de-DE">
                <Button variant="muted" size="sm">
                  🇩🇪 Deutsch
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
