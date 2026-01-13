import { useEffect, useRef, useCallback } from 'react';
import { AuthService } from '@/lib/api/services';
import { getTokenExpirationTime, isTokenValid } from '@/lib/jwt';

/**
 * Hook para renovação automática de token JWT.
 *
 * Funciona da seguinte forma:
 * 1. Monitora atividade do usuário (mouse, teclado, scroll, touch)
 * 2. Verifica periodicamente o tempo restante do token
 * 3. Renova automaticamente quando faltam 5 minutos para expirar
 * 4. Apenas renova se o usuário estiver ativo
 *
 * @param options - Configurações opcionais
 */
export function useTokenRefresh(options?: {
  /**
   * Tempo em segundos antes da expiração para renovar o token.
   * Padrão: 300 (5 minutos)
   */
  renewBeforeExpiration?: number;

  /**
   * Intervalo de verificação em milissegundos.
   * Padrão: 60000 (1 minuto)
   */
  checkInterval?: number;

  /**
   * Tempo de inatividade em milissegundos para parar de renovar.
   * Padrão: 900000 (15 minutos)
   */
  inactivityTimeout?: number;

  /**
   * Callback executado quando o token é renovado com sucesso
   */
  onRefreshSuccess?: () => void;

  /**
   * Callback executado quando a renovação falha
   */
  onRefreshError?: (error: Error) => void;
}) {
  const {
    renewBeforeExpiration = 300, // 5 minutos
    checkInterval = 60000, // 1 minuto
    inactivityTimeout = 900000, // 15 minutos
    onRefreshSuccess,
    onRefreshError,
  } = options || {};

  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  /**
   * Atualiza o timestamp da última atividade do usuário
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Verifica se o usuário está ativo (baseado no tempo de inatividade)
   */
  const isUserActive = useCallback(() => {
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    return timeSinceLastActivity < inactivityTimeout;
  }, [inactivityTimeout]);

  /**
   * Tenta renovar o token JWT
   */
  const refreshToken = useCallback(async () => {
    // Previne múltiplas renovações simultâneas
    if (isRefreshingRef.current) {
      console.log('Token refresh already in progress, skipping...');
      return;
    }

    // Verifica se há token
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      return;
    }

    // Verifica se o token ainda é válido
    if (!isTokenValid(token)) {
      console.log('Token is invalid or expired, cannot refresh');
      return;
    }

    // Verifica se o usuário está ativo
    if (!isUserActive()) {
      console.log('User is inactive, skipping token refresh');
      return;
    }

    try {
      isRefreshingRef.current = true;
      console.log('Refreshing token...');

      await AuthService.refreshToken();

      console.log('Token refreshed successfully');
      onRefreshSuccess?.();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      onRefreshError?.(error as Error);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [isUserActive, onRefreshSuccess, onRefreshError]);

  /**
   * Verifica se o token precisa ser renovado
   */
  const checkTokenExpiration = useCallback(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      return;
    }

    const timeRemaining = getTokenExpirationTime(token);

    // Se faltar menos tempo que o threshold, renova
    if (timeRemaining > 0 && timeRemaining <= renewBeforeExpiration) {
      console.log(`Token expires in ${timeRemaining}s, refreshing...`);
      refreshToken();
    } else if (timeRemaining > renewBeforeExpiration) {
      console.log(`Token still valid for ${timeRemaining}s, no refresh needed`);
    }
  }, [renewBeforeExpiration, refreshToken]);

  /**
   * Configura listeners de atividade do usuário
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Eventos que indicam atividade do usuário
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Adiciona listeners para todos os eventos de atividade
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Remove listeners na desmontagem
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  /**
   * Configura intervalo de verificação periódica do token
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Verifica imediatamente ao montar
    checkTokenExpiration();

    // Configura intervalo de verificação
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, checkInterval);

    // Limpa intervalo na desmontagem
    return () => {
      clearInterval(intervalId);
    };
  }, [checkInterval, checkTokenExpiration]);
}
