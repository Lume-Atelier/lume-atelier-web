'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { DateRange, DateRangePreset } from '@/types';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
}

const PRESET_OPTIONS = [
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
 * Usa os componentes padrao do sistema (Select, Input, Button).
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
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-48">
        <Select
          value={preset}
          onChange={handlePresetChange}
          options={PRESET_OPTIONS}
          size="sm"
        />
      </div>

      {preset === 'custom' && (
        <div className="flex items-end gap-3">
          <div className="w-40">
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              size="sm"
            />
          </div>
          <span className="text-foreground/60 pb-2">ate</span>
          <div className="w-40">
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              size="sm"
            />
          </div>
          <Button
            onClick={handleCustomDateChange}
            disabled={!customStartDate || !customEndDate}
            size="sm"
          >
            Aplicar
          </Button>
        </div>
      )}
    </div>
  );
}
