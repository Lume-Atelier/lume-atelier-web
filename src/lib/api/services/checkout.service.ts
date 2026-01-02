import { apiClient } from '../client';
import type { Order } from '@/types';

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export class CheckoutService {
  static async createOrder(
    productIds: string[],
    paymentMethod: 'STRIPE' | 'PAYPAL' | 'PIX' = 'STRIPE'
  ): Promise<Order> {
    return apiClient.post<Order>('/orders', {
      productIds,
      paymentMethod,
    });
  }

  static async getMyOrders(page: number = 0, size: number = 10): Promise<PagedResponse<Order>> {
    return apiClient.get<PagedResponse<Order>>(`/orders/my-orders?page=${page}&size=${size}`);
  }

  static async getOrderById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  }
}
