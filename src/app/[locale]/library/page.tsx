'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLibrary } from '@/hooks/queries/useLibrary';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { LibraryAssetCard } from '@/components/features/library/LibraryAssetCard';
import { LibraryToolbar } from '@/components/features/library/LibraryToolbar';
import type { LibraryFilter } from '@/types/library';

const PAGE_SIZE = 5;

export default function LibraryPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'pt-BR';

  // State for filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);

  // Debounce search input (300ms)
  const debouncedSearch = useDebouncedValue(search, 300);

  // Build filters object
  const filters: LibraryFilter = useMemo(() => ({
    search: debouncedSearch || undefined,
    category: category || undefined,
  }), [debouncedSearch, category]);

  // Fetch library data
  const { data, isLoading, error } = useLibrary(page, PAGE_SIZE, filters);

  // Reset to page 0 when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Minha Biblioteca</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-muted rounded flex-1" />
                  <div className="h-9 bg-muted rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Erro ao carregar biblioteca</h1>
        <p className="text-muted-foreground mb-8">
          Ocorreu um erro ao carregar seus assets. Tente novamente.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const assets = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Empty state
  if (assets.length === 0 && !debouncedSearch && !category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Biblioteca Vazia</h1>
        <p className="text-muted-foreground mb-8">
          Voce ainda nao comprou nenhum produto
        </p>
        <Link href={`/${locale}/products`}>
          <Button variant="outline" size="lg">
            Explorar Produtos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Minha Biblioteca</h1>

      {/* Toolbar with search and category filter */}
      <LibraryToolbar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
      />

      {/* No results for filters */}
      {assets.length === 0 && (debouncedSearch || category) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhum asset encontrado para os filtros selecionados
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch('');
              setCategory('');
              setPage(0);
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Assets grid */}
      {assets.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <LibraryAssetCard
                key={asset.id}
                asset={asset}
                locale={locale}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
          />
        </>
      )}
    </div>
  );
}
