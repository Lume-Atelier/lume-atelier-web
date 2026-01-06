'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/features/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { useProducts } from '@/hooks/queries';
import type { ProductFilter, ProductCategory } from '@/types';

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ProductFilter>({});

  // React Query gerencia loading, error e cache automaticamente
  const { data, isLoading, error } = useProducts(page, 20, filters);
  const products = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const handleFilterChange = (newFilters: Partial<ProductFilter>) => {
    setFilters({ ...filters, ...newFilters });
    setPage(0);
  };

  const handleCategoryChange = (category: ProductCategory | undefined) => {
    handleFilterChange({ category });
  };

  const handleFeatureChange = (feature: 'rigged' | 'animated' | 'pbr', value: boolean) => {
    handleFilterChange({ [feature]: value });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-card py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Todos os Produtos</h1>
          <p className="text-foreground/60">
            Explore nossa coleção completa de assets 3D premium
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Filtros */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
                <h2 className="font-semibold mb-4">Filtros</h2>

                {/* Categoria */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Categoria</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={!filters.category}
                        onChange={() => handleCategoryChange(undefined)}
                      />
                      <span>Todas</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === 'CHARACTERS'}
                        onChange={() => handleCategoryChange('CHARACTERS' as ProductCategory)}
                      />
                      <span>Characters</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === 'ENVIRONMENTS'}
                        onChange={() => handleCategoryChange('ENVIRONMENTS' as ProductCategory)}
                      />
                      <span>Environments</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === 'VEHICLES'}
                        onChange={() => handleCategoryChange('VEHICLES' as ProductCategory)}
                      />
                      <span>Vehicles</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === 'PROPS'}
                        onChange={() => handleCategoryChange('PROPS' as ProductCategory)}
                      />
                      <span>Props</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === 'TEXTURES'}
                        onChange={() => handleCategoryChange('TEXTURES' as ProductCategory)}
                      />
                      <span>Textures</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === 'ANIMATIONS'}
                        onChange={() => handleCategoryChange('ANIMATIONS' as ProductCategory)}
                      />
                      <span>Animations</span>
                    </label>
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Faixa de Preço (R$)</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2 text-sm">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange({ minPrice: Number(e.target.value) || undefined })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange({ maxPrice: Number(e.target.value) || undefined })}
                        className="w-full px-3 py-2 bg-background border border-border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Features</h3>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.rigged || false}
                        onChange={(e) => handleFeatureChange('rigged', e.target.checked)}
                      />
                      <span>Rigged</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.animated || false}
                        onChange={(e) => handleFeatureChange('animated', e.target.checked)}
                      />
                      <span>Animated</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.pbr || false}
                        onChange={(e) => handleFeatureChange('pbr', e.target.checked)}
                      />
                      <span>PBR</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setFilters({});
                    setPage(0);
                  }}
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  Limpar Filtros
                </Button>
              </div>
            </aside>

            {/* Main Content - Grid de Produtos */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-foreground/60">
                  {isLoading ? 'Carregando...' : `Mostrando ${products.length} produtos`}
                </p>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-foreground/20 border-t-primary"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
                  <p className="text-foreground/60 text-center max-w-md mb-6">
                    Tente ajustar os filtros ou limpar a busca.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-4 items-center mt-8">
                      <Button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        variant="outline"
                        size="md"
                      >
                        Anterior
                      </Button>
                      <span className="px-4 py-2 font-semibold">
                        Página {page + 1} de {totalPages}
                      </span>
                      <Button
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        variant="outline"
                        size="md"
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
