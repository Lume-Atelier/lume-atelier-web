import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/lib/api/services';
import { OrderStatus } from '@/types';
import type { OrderDTO } from '@/types';

/**
 * Hook para verificar status de pagamento com polling automático
 *
 * Comportamento:
 * - Faz polling a cada 2 segundos enquanto status != COMPLETED/FAILED/REFUNDED
 * - Para de fazer polling quando pagamento é confirmado ou falha
 * - Retorna isConfirmed quando status = COMPLETED
 *
 * Uso:
 * ```tsx
 * const { data, isConfirmed, isLoading } = usePaymentStatus(orderId);
 *
 * useEffect(() => {
 *   if (isConfirmed) {
 *     clearCart();
 *   }
 * }, [isConfirmed]);
 * ```
 */
export function usePaymentStatus(orderId: string | null, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const query = useQuery<OrderDTO>({
    queryKey: ['payment-status', orderId],
    queryFn: () => OrderService.getOrderById(orderId!),
    enabled: enabled && !!orderId,
    // Polling: refetch a cada 2 segundos
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;

      // Para de fazer polling quando status é final
      const finalStatuses = [
        OrderStatus.COMPLETED,
        OrderStatus.FAILED,
        OrderStatus.REFUNDED,
      ];

      if (finalStatuses.includes(data.status)) {
        return false; // Para o polling
      }

      return 2000; // Continua polling
    },
    // Considera stale imediatamente para forçar refetch
    staleTime: 0,
    // Retry em caso de erro de rede
    retry: 3,
    retryDelay: 1000,
  });

  // Computed: pagamento confirmado?
  const isConfirmed = query.data?.status === OrderStatus.COMPLETED;

  // Computed: pagamento falhou?
  const isFailed = query.data?.status === OrderStatus.FAILED;

  // Computed: reembolsado?
  const isRefunded = query.data?.status === OrderStatus.REFUNDED;

  // Computed: ainda processando?
  const isPending = query.data?.status === OrderStatus.PENDING;

  // Função para invalidar cache e forçar refetch
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['payment-status', orderId] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  return {
    ...query,
    isConfirmed,
    isFailed,
    isRefunded,
    isPending,
    refetch,
  };
}

/**
 * Hook simplificado para verificar se um pedido específico está completo
 */
export function useIsOrderComplete(orderId: string | null) {
  const { isConfirmed, isLoading, data } = usePaymentStatus(orderId);

  return {
    isComplete: isConfirmed,
    isLoading,
    order: data,
  };
}
