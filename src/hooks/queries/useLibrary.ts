import { useQuery } from '@tanstack/react-query';
import { LibraryService } from '@/lib/api/services';
import type { LibraryFilter } from '@/types/library';

/**
 * Hook para buscar assets na biblioteca do usuário
 * Usa React Query para cache automático
 */
export function useLibrary(
  page: number = 0,
  pageSize: number = 5,
  filters: LibraryFilter = {}
) {
  return useQuery({
    queryKey: ['library', page, pageSize, filters],
    queryFn: () => LibraryService.getMyLibrary(filters, page, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
