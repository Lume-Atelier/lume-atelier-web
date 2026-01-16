'use client';

import { KPICard } from './KPICard';
import type { FinancialAnalytics } from '@/types';

interface KPICardsRowProps {
  data: FinancialAnalytics | undefined;
  isLoading: boolean;
}

/**
 * Formata valor monetario em Real brasileiro.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Row de cards de KPIs: Faturamento Total, Ticket Medio, Quantidade de Vendas.
 */
export function KPICardsRow({ data, isLoading }: KPICardsRowProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <KPICard
        title="Faturamento Total"
        value={data ? formatCurrency(data.totalRevenue) : 'R$ 0,00'}
        subtitle="Pedidos concluidos"
        isLoading={isLoading}
      />
      <KPICard
        title="Ticket Medio"
        value={data ? formatCurrency(data.averageTicket) : 'R$ 0,00'}
        subtitle="Por pedido"
        isLoading={isLoading}
      />
      <KPICard
        title="Quantidade de Vendas"
        value={data ? data.salesCount.toString() : '0'}
        subtitle="Pedidos no periodo"
        isLoading={isLoading}
      />
    </div>
  );
}
