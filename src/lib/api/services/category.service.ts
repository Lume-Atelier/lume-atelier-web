import { apiClient } from '../client';
import type { Category } from '@/types/category';

/**
 * Serviço de Categorias - Única fonte de verdade
 * ✅ Busca categorias do backend (/categories endpoint)
 * ✅ Cache em memória para evitar múltiplas chamadas
 * ✅ Single Source of Truth (backend é a única fonte)
 */
export class CategoryService {
  private static cache: Category[] | null = null;
  private static cacheTimestamp: number | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Busca todas as categorias disponíveis
   * Usa cache em memória se disponível e não expirado
   */
  static async getCategories(): Promise<Category[]> {
    const now = Date.now();

    // Retornar do cache se válido
    if (
      this.cache !== null &&
      this.cacheTimestamp !== null &&
      now - this.cacheTimestamp < this.CACHE_DURATION
    ) {
      return this.cache;
    }

    // Buscar do backend
    try {
      const categories = await apiClient.get<Category[]>('/categories');

      // Atualizar cache
      this.cache = categories;
      this.cacheTimestamp = now;

      return categories;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);

      // Retornar cache expirado se houver, melhor que falhar completamente
      if (this.cache !== null) {
        console.warn('Retornando cache expirado de categorias devido a erro na API');
        return this.cache;
      }

      throw error;
    }
  }

  /**
   * Busca uma categoria específica pelo valor
   * @param value - Valor do enum (ex: CAMA_BANHO)
   */
  static async getCategoryByValue(value: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(cat => cat.value === value);
  }

  /**
   * Limpa o cache (útil para testes ou quando adicionar nova categoria)
   */
  static clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = null;
  }

  /**
   * Verifica se uma categoria existe
   * @param value - Valor do enum a verificar
   */
  static async exists(value: string): Promise<boolean> {
    const categories = await this.getCategories();
    return categories.some(cat => cat.value === value);
  }
}
