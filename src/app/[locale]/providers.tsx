'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * React Query Providers
 * Configura o QueryClient com defaults otimizados para a aplicação
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Criar QueryClient no estado do componente para evitar recriação em re-renders
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 5 minutos
            staleTime: 5 * 60 * 1000,
            // Garbage collection após 10 minutos
            gcTime: 10 * 60 * 1000,
            // Retry automático em caso de erro
            retry: 1,
            // Refetch on window focus (útil para dados que mudam frequentemente)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry automático para mutations
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
