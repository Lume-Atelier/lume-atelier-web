/**
 * @deprecated Este serviço está depreciado. Use OrderService ao invés.
 *
 * Razão: CheckoutService usa tipos antigos (Order, PagedResponse) que não
 * refletem os DTOs atuais do backend (OrderDTO, PageResponse).
 *
 * Migração:
 * - CheckoutService.createOrder() -> OrderService.createOrder()
 * - CheckoutService.getMyOrders() -> OrderService.getMyOrders()
 * - CheckoutService.getOrderById() -> OrderService.getOrderById()
 *
 * @see {@link OrderService} para a implementação atualizada
 */

import { apiClient } from '../client';
import type { Order } from '@/types';

/**
 * @deprecated Use PageResponse<T> from api-responses.ts
 */
interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * @deprecated Use OrderService instead
 */
export class CheckoutService {
  /**
   * @deprecated Use OrderService.createOrder() instead
   */
  static async createOrder(
    productIds: string[],
    paymentMethod: 'STRIPE' = 'STRIPE'
  ): Promise<Order> {
    return apiClient.post<Order>('/orders', {
      productIds,
      paymentMethod,
    });
  }

  /**
   * @deprecated Use OrderService.getMyOrders() instead
   */
  static async getMyOrders(page: number = 0, size: number = 10): Promise<PagedResponse<Order>> {
    return apiClient.get<PagedResponse<Order>>(`/orders?page=${page}&size=${size}`);
  }

  /**
   * @deprecated Use OrderService.getOrderById() instead
   */
  static async getOrderById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  }
}
