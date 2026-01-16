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
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
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

/**
 * DTO de Pedido - Corresponde a OrderDTO no backend
 */
export interface OrderDTO {
  id: string;
  userId: string;
  userName: string; // Nome do usuário (SEM email/password)
  items: OrderItemDTO[];
  totalAmountBRL: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productTitle: string;
  priceBRL: number;
  thumbnailUrl?: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  STRIPE = "STRIPE",
}

/**
 * Request para criar pedido
 */
export interface CreateOrderRequest {
  productIds: string[];
  paymentMethod: PaymentMethod;
}

/**
 * Resposta ao criar um checkout (pedido + URL do Stripe)
 * Corresponde a CheckoutSessionResponse no backend
 */
export interface CheckoutSessionResponse {
  order: OrderDTO;
  checkoutUrl: string;
}

// DEPRECATED: Use OrderDTO
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmountBRL: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paymentMethod: "STRIPE";
  createdAt: string;
  updatedAt: string;
}
