'use client';

import { useState } from 'react';
import type { ProductFile } from '@/types';
import { formatFileSize } from '@/types/productFile';

interface FileSelectorProps {
  files: ProductFile[];
  onDownload: (selectedFiles: ProductFile[]) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Componente para seleção de arquivos para download
 * Permite ao usuário escolher quais arquivos baixar
 */
export function FileSelector({ files, onDownload, onCancel, loading = false }: FileSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleFile = (fileId: string) => {
    setSelectedIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  const handleDownload = () => {
    const selected = files.filter((f) => selectedIds.includes(f.id));
    onDownload(selected);
  };

  const totalSize = files
    .filter((f) => selectedIds.includes(f.id))
    .reduce((sum, f) => sum + f.fileSize, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-foreground/20 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-foreground/20">
          <h2 className="text-2xl font-bold">Selecione os arquivos para download</h2>
          <p className="text-sm text-foreground/60 mt-1">
            {files.length} arquivo{files.length !== 1 ? 's' : ''} disponível
            {files.length !== 1 ? 'eis' : ''}
          </p>
        </div>

        {/* Lista de arquivos (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selecionar todos */}
          <label className="flex items-center gap-3 p-3 hover:bg-foreground/5 rounded cursor-pointer mb-2 border border-foreground/10">
            <input
              type="checkbox"
              checked={selectedIds.length === files.length}
              onChange={toggleAll}
              className="w-4 h-4"
            />
            <span className="font-medium">Selecionar todos</span>
          </label>

          {/* Lista de arquivos */}
          <div className="space-y-2">
            {files.map((file) => (
              <label
                key={file.id}
                className="flex items-center gap-3 p-3 hover:bg-foreground/5 rounded cursor-pointer border border-foreground/10 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(file.id)}
                  onChange={() => toggleFile(file.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{file.fileName}</span>
                    <span className="text-xs px-2 py-0.5 bg-foreground/10 rounded">
                      {file.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-foreground/60">
                      {formatFileSize(file.fileSize)}
                    </span>
                    <span className="text-sm text-foreground/40">•</span>
                    <span className="text-xs text-foreground/40">{file.fileType}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-foreground/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-foreground/60">
                {selectedIds.length} arquivo{selectedIds.length !== 1 ? 's' : ''} selecionado
                {selectedIds.length !== 1 ? 's' : ''}
              </p>
              {selectedIds.length > 0 && (
                <p className="text-xs text-foreground/40 mt-1">
                  Total: {formatFileSize(totalSize)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  disabled={loading}
                  className="px-4 py-2 border border-foreground/20 rounded hover:bg-foreground/5 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={selectedIds.length === 0 || loading}
                className="px-4 py-2 bg-primary text-background rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Baixando...
                  </span>
                ) : (
                  `Baixar${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
