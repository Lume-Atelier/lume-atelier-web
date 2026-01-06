import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/lib/api/services';
import type { CreateOrderRequest } from '@/types';

/**
 * Hook para buscar pedidos do usuário com paginação
 */
export function useOrders(page: number = 0, pageSize: number = 10) {
  return useQuery({
    queryKey: ['orders', page, pageSize],
    queryFn: () => OrderService.getMyOrders(page, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutos (pedidos podem mudar status)
  });
}

/**
 * Hook para buscar detalhes de um pedido específico
 */
export function useOrderDetail(orderId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => OrderService.getOrderById(orderId),
    staleTime: 2 * 60 * 1000,
    enabled: enabled && !!orderId,
  });
}

/**
 * Hook (mutation) para criar um novo pedido
 * Invalida cache de pedidos após sucesso
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateOrderRequest) => OrderService.createOrder(request),
    onSuccess: () => {
      // Invalida lista de pedidos para refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/**
 * Hook (mutation) para gerar links de download seguros
 * Retorna ProductDownloadDTO com presignedUrl temporária
 */
export function useGenerateDownloadLinks() {
  return useMutation({
    mutationFn: (orderId: string) => OrderService.generateDownloadLinks(orderId),
  });
}
