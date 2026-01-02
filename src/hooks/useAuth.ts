import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/api/services';

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
      const authenticated = AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Decodifica o JWT para extrair a role
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
          if (token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);


            const userData: User = {
              id: payload.id || payload.sub || '',
              email: payload.email || '',
              name: payload.name || '',
              role: payload.role || 'CUSTOMER',
            };

            setUser(userData);
            setIsAdmin(userData.role === 'ADMIN');
          }
        } catch (error) {
          console.error('Erro ao decodificar token:', error);
        }
      }

      if (requireAuth && !authenticated) {
        router.push('/login');
        return;
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
