import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para campos de busca evitando muitas requisições
 *
 * @param value Valor a ser debounced
 * @param delay Delay em milissegundos (default: 300ms)
 * @returns Valor debounced
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
