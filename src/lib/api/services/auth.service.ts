import { apiClient } from '../client';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';

/**
 * Serviço de autenticação
 */
export class AuthService {
  /**
   * Faz login do usuário
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    // Salva o token
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }

    return response;
  }

  /**
   * Registra novo usuário
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Salva o token
    if (response.token) {
      apiClient.setAuthToken(response.token);
    }

    return response;
  }

  /**
   * Faz logout do usuário (apenas limpa o token localmente)
   */
  static async logout(): Promise<void> {
    // Remove o token do localStorage e cookies
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  }
}
