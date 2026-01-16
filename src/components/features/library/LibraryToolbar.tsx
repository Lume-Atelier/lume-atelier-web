'use client';

import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';

interface LibraryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'CAMA_BANHO', label: 'Cama & Banho' },
  { value: 'MESAS', label: 'Mesas' },
  { value: 'ARMAZENAMENTO', label: 'Armazenamento' },
  { value: 'ILUMINACAO', label: 'Iluminacao' },
  { value: 'DECORACAO', label: 'Decoracao' },
  { value: 'ASSENTOS', label: 'Assentos' },
  { value: 'ELETRODOMESTICOS', label: 'Eletrodomesticos' },
];

export function LibraryToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: LibraryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search input */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="md"
        />
      </div>

      {/* Category select */}
      <div className="sm:w-64">
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={CATEGORY_OPTIONS}
          placeholder="Todas as categorias"
          size="md"
        />
      </div>
    </div>
  );
}
