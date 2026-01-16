'use client';

import { useState, useEffect } from 'react';
import type { DateRange, DateRangePreset } from '@/types';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

interface PresetOption {
  value: DateRangePreset;
  label: string;
}

const PRESETS: PresetOption[] = [
  { value: 'last7days', label: 'Ultimos 7 dias' },
  { value: 'last30days', label: 'Ultimos 30 dias' },
  { value: 'thisMonth', label: 'Este Mes' },
  { value: 'currentYear', label: 'Ano Atual' },
  { value: 'custom', label: 'Personalizado' },
];

/**
 * Calcula o DateRange baseado no preset selecionado.
 */
function calculateDateRange(preset: DateRangePreset): DateRange {
  const today = new Date();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  switch (preset) {
    case 'last7days': {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { startDate: formatDate(start), endDate: formatDate(today) };
    }
    case 'last30days': {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { startDate: formatDate(start), endDate: formatDate(today) };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDate(start), endDate: formatDate(today) };
    }
    case 'currentYear': {
      const start = new Date(today.getFullYear(), 0, 1);
      return { startDate: formatDate(start), endDate: formatDate(today) };
    }
    default:
      return { startDate: '', endDate: '' };
  }
}

/**
 * Componente de filtro de periodo com presets e opcao personalizada.
 */
export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<DateRangePreset>('last30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Inicializa com last30days
  useEffect(() => {
    if (!value.startDate && !value.endDate) {
      onChange(calculateDateRange('last30days'));
    }
  }, []);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPreset = e.target.value as DateRangePreset;
    setPreset(newPreset);

    if (newPreset !== 'custom') {
      onChange(calculateDateRange(newPreset));
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      onChange({ startDate: customStartDate, endDate: customEndDate });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <select
        value={preset}
        onChange={handlePresetChange}
        className="px-4 py-2 border border-foreground/20 rounded bg-background text-foreground focus:outline-none focus:border-gold/50 cursor-pointer"
      >
        {PRESETS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {preset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="px-3 py-2 border border-foreground/20 rounded bg-background text-foreground focus:outline-none focus:border-gold/50"
          />
          <span className="text-foreground/60">ate</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="px-3 py-2 border border-foreground/20 rounded bg-background text-foreground focus:outline-none focus:border-gold/50"
          />
          <button
            onClick={handleCustomDateChange}
            disabled={!customStartDate || !customEndDate}
            className="px-4 py-2 bg-gold text-background rounded font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
