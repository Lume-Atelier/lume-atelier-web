import { apiClient } from '../client';
import type {
  OrderDTO,
  CreateOrderRequest,
  ProductDownloadDTO,
  PageResponse,
} from '@/types';

/**
 * Serviço de Pedidos - Refatorado para usar novos DTOs e endpoints RESTful
 * ✅ POST /orders - Criar pedido
 * ✅ GET /orders - Listar meus pedidos (autenticado)
 * ✅ POST /orders/{id}/downloads - Gerar links de download seguros
 */
export class OrderService {
  /**
   * Cria um novo pedido
   * @param request - Dados do pedido (productIds, paymentMethod)
   * @returns OrderDTO com status PENDING
   */
  static async createOrder(request: CreateOrderRequest): Promise<OrderDTO> {
    return apiClient.post<OrderDTO>('/orders', request);
  }

  /**
   * Lista pedidos do usuário autenticado
   * Endpoint RESTful: GET /orders (não mais /orders/my-orders)
   * @param page - Número da página
   * @param size - Tamanho da página
   * @returns PageResponse<OrderDTO>
   */
  static async getMyOrders(
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<OrderDTO>> {
    return apiClient.get<PageResponse<OrderDTO>>(
      `/orders?page=${page}&pageSize=${size}`
    );
  }

  /**
   * Obtém detalhes de um pedido específico
   * @param orderId - ID do pedido
   * @returns OrderDTO
   */
  static async getOrderById(orderId: string): Promise<OrderDTO> {
    return apiClient.get<OrderDTO>(`/orders/${orderId}`);
  }

  /**
   * 🔐 ENDPOINT CRÍTICO DE SEGURANÇA
   * Gera links de download seguros para um pedido
   *
   * VALIDAÇÕES (backend):
   * 1. Usuário autenticado
   * 2. Usuário é dono do pedido
   * 3. Pedido está COMPLETED
   * 4. Produto tem arquivos disponíveis
   *
   * @param orderId - ID do pedido
   * @returns ProductDownloadDTO com presigned URLs temporárias (60 min)
   * @throws 401 - Não autenticado
   * @throws 403 - Não é dono do pedido
   * @throws 400 - Pedido não está COMPLETED
   * @throws 404 - Pedido não encontrado
   */
  static async generateDownloadLinks(orderId: string): Promise<ProductDownloadDTO> {
    return apiClient.post<ProductDownloadDTO>(`/orders/${orderId}/downloads`);
  }

  /**
   * Faz download de múltiplos arquivos usando presigned URLs
   * @param downloadDTO - DTO com presigned URLs
   */
  static async downloadFiles(downloadDTO: ProductDownloadDTO): Promise<void> {
    for (const file of downloadDTO.files) {
      try {
        // Cria link temporário para download
        const link = document.createElement('a');
        link.href = file.presignedUrl;
        link.download = file.fileName;
        link.target = '_blank'; // Fallback para abrir em nova aba
        link.click();

        // Delay entre downloads para evitar bloqueio do browser
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Erro ao baixar arquivo ${file.fileName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Fluxo completo: Gera links e faz download
   * @param orderId - ID do pedido
   */
  static async generateAndDownload(orderId: string): Promise<void> {
    const downloadDTO = await this.generateDownloadLinks(orderId);
    await this.downloadFiles(downloadDTO);
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * [ADMIN] Lista todos os pedidos (com filtros opcionais)
   * @param userId - Filtrar por usuário (opcional)
   * @param status - Filtrar por status (opcional)
   * @param page - Número da página
   * @param size - Tamanho da página
   * @returns PageResponse<OrderDTO>
   */
  static async getAllOrders(
    userId?: string,
    status?: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<OrderDTO>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('pageSize', size.toString());

    return apiClient.get<PageResponse<OrderDTO>>(`/orders?${params.toString()}`);
  }

  /**
   * [ADMIN] Atualiza status de um pedido
   * @param orderId - ID do pedido
   * @param status - Novo status
   * @returns OrderDTO atualizado
   */
  static async updateOrderStatus(orderId: string, status: string): Promise<OrderDTO> {
    return apiClient.patch<OrderDTO>(`/orders/${orderId}/status`, { status });
  }
}
