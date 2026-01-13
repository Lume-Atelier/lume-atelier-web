'use client';

import { useTokenRefresh } from '@/hooks/useTokenRefresh';

/**
 * Provider que gerencia a renovação automática de token JWT.
 *
 * Este componente deve ser incluído no layout raiz da aplicação
 * para garantir que o token seja renovado automaticamente em todas as páginas.
 *
 * Funcionalidades:
 * - Monitora atividade do usuário
 * - Renova token automaticamente 5 minutos antes de expirar
 * - Só renova se o usuário estiver ativo (últimos 15 minutos)
 * - Verifica a cada 1 minuto se precisa renovar
 */
export function TokenRefreshProvider({ children }: { children: React.ReactNode }) {
  // Configura renovação automática de token
  useTokenRefresh({
    renewBeforeExpiration: 300, // Renova quando faltar 5 minutos (300 segundos)
    checkInterval: 60000, // Verifica a cada 1 minuto (60000ms)
    inactivityTimeout: 900000, // Considera inativo após 15 minutos (900000ms)

    onRefreshSuccess: () => {
      console.log('[TokenRefresh] Token renewed successfully');
    },

    onRefreshError: (error) => {
      console.error('[TokenRefresh] Failed to renew token:', error);
      // Em caso de erro, o interceptor do API client já vai fazer logout
      // se for erro 401
    },
  });

  return <>{children}</>;
}
