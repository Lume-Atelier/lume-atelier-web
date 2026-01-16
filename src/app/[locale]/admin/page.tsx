'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminService } from '@/lib/api/services';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useFinancialAnalytics } from '@/hooks/queries';
import {
  DateRangeFilter,
  KPICardsRow,
  RevenueChart,
} from '@/components/features/admin';
import type { DateRange } from '@/types';

/**
 * Calcula o DateRange padrao (ultimos 30 dias).
 */
function getDefaultDateRange(): DateRange {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 29);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  return { startDate: formatDate(start), endDate: formatDate(today) };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);

  // Hook para buscar analytics financeiro
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useFinancialAnalytics(dateRange);

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

        {/* Stats gerais existentes */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="border border-foreground/20 p-6 rounded">
            <h3 className="text-foreground/60 mb-2">Total de Usuarios</h3>
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

        {/* Secao de Analytics Financeiro */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">Analytics Financeiro</h2>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </div>

          {/* KPIs */}
          <div className="mb-6">
            <KPICardsRow data={analyticsData} isLoading={analyticsLoading} />
          </div>

          {/* Grafico de Receita */}
          <RevenueChart
            data={analyticsData?.dailyRevenue}
            isLoading={analyticsLoading}
          />
        </div>

        {/* Links de gerenciamento */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="xl" fullWidth className="h-24">
              <h3 className="text-xl font-bold">Gerenciar Usuarios</h3>
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
