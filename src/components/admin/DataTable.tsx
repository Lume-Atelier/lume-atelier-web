import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Componente reutilizável de tabela de dados
 *
 * Features:
 * - Colunas configuráveis com renderização customizada
 * - Alinhamento configurável por coluna
 * - Estado de loading
 * - Mensagem de lista vazia
 * - Responsive com scroll horizontal
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="border border-foreground/20 rounded overflow-hidden">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-foreground/20 border-t-primary mb-4"></div>
          <p className="text-foreground/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border border-foreground/20 rounded overflow-hidden">
        <div className="p-12 text-center">
          <p className="text-foreground/60">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-foreground/20 rounded overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-foreground/10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`p-4 font-semibold text-sm ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="border-t border-foreground/20 hover:bg-foreground/5 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`p-4 ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as any)[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
