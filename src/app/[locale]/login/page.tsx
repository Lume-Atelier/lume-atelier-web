'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/api/services';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await AuthService.login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await AuthService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      // Redireciona para a página de origem ou home
      const redirect = searchParams.get('redirect') || '/';

      // Força reload completo para atualizar o estado de autenticação
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto border border-foreground/20 p-8 rounded">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {isLogin ? 'Login' : 'Registro'}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 text-red-500 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block mb-2 text-sm">Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Senha</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-background border border-foreground/20 rounded focus:outline-none focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            variant="outline"
            size="lg"
            fullWidth
          >
            {isLogin ? 'Entrar' : 'Registrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            onClick={() => setIsLogin(!isLogin)}
            variant="outline"
          >
            {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
          </Button>
        </div>
      </div>
    </div>
  );
}
