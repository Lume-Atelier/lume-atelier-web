import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/api/services';
import { decodeJWT, isTokenExpired, extractUserId, extractRole } from '@/lib/jwt';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function useAuth(requireAuth: boolean = false) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Verifica se há token no localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      if (!token) {
        // Sem token = não autenticado
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);

        if (requireAuth) {
          router.push('/login');
        }

        setLoading(false);
        return;
      }

      // CRÍTICO: Verifica se o token está expirado ANTES de usar
      if (isTokenExpired(token)) {
        console.log('Token expired in useAuth - automatic logout');

        // Faz logout automático (remove token e cookie)
        await AuthService.logout();

        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);

        // Redireciona para login
        router.push('/login');
        setLoading(false);
        return;
      }

      // Token válido - decodifica para extrair dados do usuário
      try {
        const payload = decodeJWT(token);

        if (!payload) {
          // Token inválido (não pode ser decodificado)
          console.error('Invalid token format');
          await AuthService.logout();
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);

          if (requireAuth) {
            router.push('/login');
          }

          setLoading(false);
          return;
        }

        // Constrói objeto de usuário a partir do payload
        const userData: User = {
          id: extractUserId(token) || '',
          email: payload.email || '',
          name: payload.name || '',
          role: extractRole(token) || 'CUSTOMER',
        };

        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.role === 'ADMIN');
      } catch (error) {
        console.error('Error processing token:', error);
        await AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);

        if (requireAuth) {
          router.push('/login');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [requireAuth, router]);

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    logout,
  };
}
