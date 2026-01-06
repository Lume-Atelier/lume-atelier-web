import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/api/services';
import type { ProductFilter } from '@/types';

/**
 * Hook para buscar lista de produtos com filtros e paginação
 * Usa React Query para cache automático
 */
export function useProducts(
  page: number = 0,
  pageSize: number = 12,
  filters?: ProductFilter
) {
  return useQuery({
    queryKey: ['products', page, pageSize, filters],
    queryFn: () => ProductService.getProducts(filters || {}, page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar produtos em destaque
 */
export function useFeaturedProducts(page: number = 0, pageSize: number = 6) {
  return useQuery({
    queryKey: ['products', 'featured', page, pageSize],
    queryFn: () => ProductService.getFeaturedProducts(page, pageSize),
    staleTime: 10 * 60 * 1000, // 10 minutos (produtos em destaque mudam menos)
  });
}

/**
 * Hook para buscar produtos por categoria
 */
export function useProductsByCategory(
  category: string,
  page: number = 0,
  pageSize: number = 12
) {
  return useQuery({
    queryKey: ['products', 'category', category, page, pageSize],
    queryFn: () => ProductService.getProductsByCategory(category, page, pageSize),
    staleTime: 5 * 60 * 1000,
    enabled: !!category, // Só executa se category for fornecida
  });
}

/**
 * Hook para buscar produtos por busca textual
 */
export function useProductSearch(
  query: string,
  page: number = 0,
  pageSize: number = 12
) {
  return useQuery({
    queryKey: ['products', 'search', query, page, pageSize],
    queryFn: () => ProductService.searchProducts(query, page, pageSize),
    staleTime: 3 * 60 * 1000, // 3 minutos (busca muda mais frequentemente)
    enabled: !!query && query.length >= 2, // Só busca se query tiver 2+ caracteres
  });
}

/**
 * Hook para buscar categorias disponíveis
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutos (categorias são estáticas)
  });
}
