import { Eye, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  editHref?: string;
  viewHref?: string;
  deleteDisabled?: boolean;
  deleteTooltip?: string;
}

/**
 * Botões de ação com ícones animados para tabelas de gerenciamento
 *
 * Features:
 * - Ícones animados no hover
 * - Suporte a links (Next Link) ou callbacks
 * - Desabilitação condicional
 * - Tooltip para botão desabilitado
 */
export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  editHref,
  viewHref,
  deleteDisabled = false,
  deleteTooltip,
}: ActionButtonsProps) {
  return (
    <div className="flex gap-2 justify-end">
      {/* Botão de visualizar */}
      {(viewHref || onView) && (
        viewHref ? (
          <Link href={viewHref}>
            <button
              type="button"
              className="p-2 rounded-lg border border-foreground/20 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
              title="Visualizar"
            >
              <Eye className="w-4 h-4 text-foreground/60 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
            </button>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onView}
            className="p-2 rounded-lg border border-foreground/20 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
            title="Visualizar"
          >
            <Eye className="w-4 h-4 text-foreground/60 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
          </button>
        )
      )}

      {/* Botão de editar */}
      {(editHref || onEdit) && (
        editHref ? (
          <Link href={editHref}>
            <button
              type="button"
              className="p-2 rounded-lg border border-foreground/20 hover:border-primary hover:bg-primary/10 transition-all group"
              title="Editar"
            >
              <Edit2 className="w-4 h-4 text-foreground/60 group-hover:text-primary group-hover:scale-110 transition-all" />
            </button>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-lg border border-foreground/20 hover:border-primary hover:bg-primary/10 transition-all group"
            title="Editar"
          >
            <Edit2 className="w-4 h-4 text-foreground/60 group-hover:text-primary group-hover:scale-110 transition-all" />
          </button>
        )
      )}

      {/* Botão de excluir */}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleteDisabled}
          className={`p-2 rounded-lg border transition-all group ${
            deleteDisabled
              ? 'border-foreground/10 bg-foreground/5 cursor-not-allowed opacity-50'
              : 'border-foreground/20 hover:border-red-500 hover:bg-red-500/10'
          }`}
          title={deleteDisabled && deleteTooltip ? deleteTooltip : 'Excluir'}
        >
          <Trash2
            className={`w-4 h-4 transition-all ${
              deleteDisabled
                ? 'text-foreground/30'
                : 'text-foreground/60 group-hover:text-red-500 group-hover:scale-110'
            }`}
          />
        </button>
      )}
    </div>
  );
}
