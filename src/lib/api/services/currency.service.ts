import { apiClient } from '../client';

/**
 * Tipos para conversão de moeda
 */
export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
}

/**
 * Serviço de conversão de moeda
 */
export class CurrencyService {
  private static CACHE_KEY = 'exchange_rates';
  private static CACHE_DURATION = 60 * 60 * 1000; // 1 hora em ms

  /**
   * Obtém taxas de câmbio atualizadas
   */
  static async getExchangeRates(baseCurrency: string = 'BRL'): Promise<ExchangeRates> {
    // Tenta obter do cache primeiro
    const cached = this.getCachedRates();
    if (cached && cached.base === baseCurrency) {
      return cached;
    }

    // Se não está em cache ou expirou, busca do backend
    const rates = await apiClient.get<ExchangeRates>(`/currency/rates?base=${baseCurrency}`);

    // Salva no cache
    this.setCachedRates(rates);

    return rates;
  }

  /**
   * Converte um valor de uma moeda para outra
   */
  static async convertPrice(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    if (!rate) {
      throw new Error(`Taxa de câmbio não encontrada para ${toCurrency}`);
    }

    return amount * rate;
  }

  /**
   * Converte um valor com detalhes completos
   */
  static async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionResult> {
    const converted = await this.convertPrice(amount, fromCurrency, toCurrency);
    const rates = await this.getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    return {
      from: fromCurrency,
      to: toCurrency,
      amount,
      converted,
      rate,
    };
  }

  /**
   * Detecta a moeda do usuário baseado no locale
   */
  static getCurrencyFromLocale(locale: string): string {
    const currencyMap: Record<string, string> = {
      'pt-BR': 'BRL',
      'en-US': 'USD',
      'es-ES': 'EUR',
      'fr-FR': 'EUR',
      'de-DE': 'EUR',
    };

    return currencyMap[locale] || 'USD';
  }

  /**
   * Obtém taxas do cache local
   */
  private static getCachedRates(): ExchangeRates | null {
    if (typeof window === 'undefined') return null;

    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return null;

    try {
      const data = JSON.parse(cached) as ExchangeRates;
      const age = Date.now() - data.timestamp;

      // Se cache expirou, retorna null
      if (age > this.CACHE_DURATION) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  /**
   * Salva taxas no cache local
   */
  private static setCachedRates(rates: ExchangeRates): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(rates));
    } catch (error) {
      console.error('Erro ao salvar taxas de câmbio no cache:', error);
    }
  }

  /**
   * Limpa o cache de taxas
   */
  static clearCache(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.CACHE_KEY);
  }
}
