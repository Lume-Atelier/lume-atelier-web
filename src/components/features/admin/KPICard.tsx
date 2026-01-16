'use client';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  isLoading?: boolean;
}

/**
 * Card de KPI para exibir metricas no dashboard admin.
 * Suporta estado de loading com skeleton.
 */
export function KPICard({ title, value, subtitle, isLoading = false }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="border border-foreground/20 p-6 rounded bg-card animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-3" />
        <div className="h-8 bg-muted rounded w-32 mb-2" />
        {subtitle && <div className="h-3 bg-muted rounded w-20" />}
      </div>
    );
  }

  return (
    <div className="border border-foreground/20 p-6 rounded bg-card hover:border-gold/30 transition-colors">
      <h3 className="text-foreground/60 text-sm font-medium mb-2">{title}</h3>
      <p className="text-3xl font-bold text-primary">{value}</p>
      {subtitle && (
        <p className="text-foreground/50 text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
}
