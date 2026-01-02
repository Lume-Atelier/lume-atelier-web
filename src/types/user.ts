/**
 * Tipos relacionados a usuários e autenticação
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  locale: string;
  currency: string;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  locale?: string;
  currency?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserLibrary {
  userId: string;
  purchases: Purchase[];
}

export interface Purchase {
  id: string;
  productId: string;
  productTitle: string;
  productThumbnail: string;
  purchaseDate: string;
  paidAmount: number;
  paidCurrency: string;
  downloadUrl: string;
  downloadCount: number;
  maxDownloads: number;
}
