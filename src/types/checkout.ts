/**
 * Tipos relacionados ao checkout e pagamento
 */

export interface CartItem {
  productId: string;
  title: string;
  thumbnailUrl: string;
  priceInBRL: number;
  displayPrice: number;
  displayCurrency: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  currency: string;
}

export interface CheckoutSession {
  sessionId: string;
  items: CartItem[];
  total: number;
  currency: string;
  status: CheckoutStatus;
}

export enum CheckoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentWebhook {
  event: string;
  sessionId: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmountBRL: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'PIX';
  createdAt: string;
  updatedAt: string;
}
