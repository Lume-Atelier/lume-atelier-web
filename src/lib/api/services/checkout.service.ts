import { apiClient } from '../client';
import type { CartItem } from '@/types';

export class CheckoutService {
  static async createOrder(
    productIds: string[],
    paymentMethod: 'STRIPE' | 'PAYPAL' | 'PIX' = 'STRIPE'
  ): Promise<{ id: string; totalAmountBRL: number; status: string }> {
    return apiClient.post('/orders', {
      productIds,
      paymentMethod,
    });
  }

  static async getMyOrders(page: number = 0, size: number = 10) {
    return apiClient.get(`/orders/my-orders?page=${page}&size=${size}`);
  }

  static async getOrderById(orderId: string) {
    return apiClient.get(`/orders/${orderId}`);
  }
}
