import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api-lume-atelier';

/**
 * Cliente HTTP para comunicação com o backend Spring Boot
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {

    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Bypass-Tunnel-Reminder': 'true', // Para Localtunnel
      },
      timeout: 300000, // 5 minutos (necessário para uploads grandes via tunnel)
    });

    // Interceptor para adicionar token de autenticação, locale e configurar Content-Type
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Adiciona Accept-Language baseado no locale da URL
        const locale = this.getLocaleFromUrl();
        if (locale) {
          config.headers['Accept-Language'] = locale;
        }

        if (config.data instanceof FormData) {
        } else if (!config.headers['Content-Type']) {
          // Para outros tipos de dados, definir como JSON
          config.headers['Content-Type'] = 'application/json';
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Log detalhado de erros
        console.error('API Error Details:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          code: error.code,
        });

        if (error.response?.status === 401) {
          // Token expirado - redirecionar para login
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtém o locale da URL atual
   * Extrai o prefixo [locale] da rota (ex: /pt-BR/products -> pt-BR)
   */
  private getLocaleFromUrl(): string | null {
    if (typeof window === 'undefined') return null;

    const pathname = window.location.pathname;
    const match = pathname.match(/^\/([a-z]{2}-[A-Z]{2}|[a-z]{2})\//);

    if (match) {
      return match[1]; // Retorna pt-BR, en, etc.
    }

    return 'pt-BR'; // Fallback para português
  }

  /**
   * Obtém o token de autenticação do localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Limpa o token de autenticação (localStorage e cookies)
   */
  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  }

  /**
   * Define o token de autenticação (localStorage e cookies)
   */
  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      // Define cookie com 7 dias de expiração
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      // SameSite=None e Secure são necessários para Ngrok/Localtunnel (HTTPS cross-origin)
      const isHttps = window.location.protocol === 'https:';
      const sameSite = isHttps ? 'None; Secure' : 'Lax';
      document.cookie = `auth_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=${sameSite}`;
    }
  }

  /**
   * Requisição GET
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Requisição POST
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Requisição PUT
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Requisição PATCH
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Requisição DELETE
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload de arquivo com progress
   */
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<T>(url, formData, {
      timeout: 600000, // 10 minutos para uploads (tunnel pode ser lento)
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Download de arquivo com streaming
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    // Criar link temporário para download
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}

export const apiClient = new ApiClient();
