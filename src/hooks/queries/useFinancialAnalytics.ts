import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/lib/api/services';
import type { DateRange } from '@/types';

/**
 * Hook para buscar analytics financeiro do dashboard admin.
 * Usa React Query para gerenciar cache e estados de loading/error.
 *
 * @param dateRange - Período de datas para busca (startDate, endDate)
 * @returns Query result com dados de FinancialAnalytics
 */
export function useFinancialAnalytics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['admin', 'analytics', dateRange.startDate, dateRange.endDate],
    queryFn: () => AdminService.getFinancialAnalytics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutos (dados de analytics não mudam frequentemente)
    enabled: Boolean(dateRange.startDate && dateRange.endDate),
  });
}
