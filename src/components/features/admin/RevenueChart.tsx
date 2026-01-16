'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyRevenue } from '@/types';

interface RevenueChartProps {
  data: DailyRevenue[] | undefined;
  isLoading: boolean;
}

/**
 * Formata data para exibicao no eixo X (dd/MMM).
 */
function formatDateLabel(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

/**
 * Formata valor monetario para tooltip.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Tooltip customizado para o grafico.
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload as DailyRevenue;

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
      <p className="text-foreground font-medium mb-1">
        {formatDateLabel(data.date)}
      </p>
      <p className="text-gold font-bold">
        {formatCurrency(data.revenue)}
      </p>
      <p className="text-foreground/60 text-sm">
        {data.salesCount} {data.salesCount === 1 ? 'venda' : 'vendas'}
      </p>
    </div>
  );
}

/**
 * Grafico de area mostrando evolucao de receita diaria.
 */
export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="border border-foreground/20 rounded bg-card p-6">
        <div className="h-4 bg-muted rounded w-48 mb-6 animate-pulse" />
        <div className="h-80 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-foreground/20 rounded bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Evolucao de Receita
        </h3>
        <div className="h-80 flex items-center justify-center text-foreground/60">
          Nenhum dado disponivel para o periodo selecionado
        </div>
      </div>
    );
  }

  // Prepara dados para o grafico com labels formatados
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: formatDateLabel(item.date),
  }));

  return (
    <div className="border border-foreground/20 rounded bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Evolucao de Receita
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="formattedDate"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#D4AF37"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
