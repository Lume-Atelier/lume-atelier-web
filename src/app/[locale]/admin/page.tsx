'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminService } from '@/lib/api/services';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await AdminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-16 text-center">Carregando...</div>;
  }

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="border border-foreground/20 p-6 rounded">
          <h3 className="text-foreground/60 mb-2">Total de Usuários</h3>
          <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
        </div>

        <div className="border border-foreground/20 p-6 rounded">
          <h3 className="text-foreground/60 mb-2">Total de Produtos</h3>
          <p className="text-3xl font-bold text-primary">{stats?.totalProducts || 0}</p>
        </div>

        <div className="border border-foreground/20 p-6 rounded">
          <h3 className="text-foreground/60 mb-2">Total de Pedidos</h3>
          <p className="text-3xl font-bold text-primary">{stats?.totalOrders || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Button variant="outline" size="xl" fullWidth className="h-24">
            <h3 className="text-xl font-bold">Gerenciar Usuários</h3>
          </Button>
        </Link>

        <Link href="/admin/products">
          <Button variant="outline" size="xl" fullWidth className="h-24">
            <h3 className="text-xl font-bold">Gerenciar Produtos</h3>
          </Button>
        </Link>

        <Link href="/admin/orders">
          <Button variant="outline" size="xl" fullWidth className="h-24">
            <h3 className="text-xl font-bold">Gerenciar Pedidos</h3>
          </Button>
        </Link>

      </div>
      </div>
    </ProtectedRoute>
  );
}
