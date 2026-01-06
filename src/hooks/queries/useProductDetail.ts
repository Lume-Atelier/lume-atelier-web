import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/lib/api/services';

/**
 * Hook para buscar detalhes completos de um produto
 * Inclui: specs técnicas, arquivos disponíveis, preview images, etc.
 *
 * @param productId - ID do produto
 * @param enabled - Se false, não executa a query (útil para lazy loading)
 */
export function useProductDetail(productId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductService.getProductById(productId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: enabled && !!productId, // Só executa se enabled=true e productId existe
    retry: 2, // Retry 2 vezes em caso de erro
  });
}

/**
 * Hook para pré-carregar detalhes de um produto (prefetch)
 * Útil para hover cards ou navegação antecipada
 */
export function usePrefetchProductDetail() {
  const queryClient = useQueryClient();

  return (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productId],
      queryFn: () => ProductService.getProductById(productId),
      staleTime: 10 * 60 * 1000,
    });
  };
}
