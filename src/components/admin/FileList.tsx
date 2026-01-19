'use client';

import { useState } from 'react';
import { FileCategory } from '@/types';
import type { FileWithMetadata } from '@/hooks/useProductFiles';
import { FileItem } from './FileItem';
import { SortableImageList } from './SortableImageList';

export interface FileListProps {
  files: FileWithMetadata[];
  uploadProgress?: Map<string, { progress: number; status: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error' }>;
  onRemoveFile: (id: string) => void;
  onCategoryChange?: (id: string, category: FileCategory) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

type TabFilter = 'ALL' | FileCategory;

/**
 * Lista de arquivos com filtro por categoria
 *
 * Features:
 * - Tabs para filtrar por categoria
 * - Contador de arquivos por categoria
 * - Grid/lista de FileItem
 */
export function FileList({
  files,
  uploadProgress,
  onRemoveFile,
  onCategoryChange,
  onReorder,
}: FileListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');

  // Contar arquivos por categoria
  const countByCategory = (category: FileCategory) => {
    return files.filter((f) => f.category === category).length;
  };

  // Filtrar arquivos pela tab ativa
  const filteredFiles =
    activeTab === 'ALL'
      ? files
      : files.filter((f) => f.category === activeTab);

  // Definição das tabs
  const tabs: { id: TabFilter; label: string; count: number }[] = [
    { id: 'ALL', label: 'Todos', count: files.length },
    {
      id: FileCategory.MODEL,
      label: 'Modelos',
      count: countByCategory(FileCategory.MODEL),
    },
    {
      id: FileCategory.TEXTURE,
      label: 'Texturas',
      count: countByCategory(FileCategory.TEXTURE),
    },
    {
      id: FileCategory.IMAGE,
      label: 'Imagens',
      count: countByCategory(FileCategory.IMAGE),
    },
    {
      id: FileCategory.ARCHIVE,
      label: 'Archives',
      count: countByCategory(FileCategory.ARCHIVE),
    },
  ];

  // Filtrar tabs com pelo menos 1 arquivo (exceto "Todos")
  const visibleTabs = tabs.filter((tab) => tab.id === 'ALL' || tab.count > 0);

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Nenhum arquivo selecionado.</p>
        <p className="text-sm mt-1">Use a área acima para adicionar arquivos.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      {visibleTabs.length > 1 && (
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors
                border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      {/* Lista de arquivos */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          Nenhum arquivo nesta categoria.
        </div>
      ) : activeTab === FileCategory.IMAGE && onReorder ? (
        // Usar SortableImageList para imagens quando drag-and-drop está habilitado
        <SortableImageList
          files={filteredFiles}
          uploadProgress={uploadProgress}
          onRemoveFile={onRemoveFile}
          onCategoryChange={onCategoryChange}
          onReorder={onReorder}
        />
      ) : (
        // Lista normal para outras categorias
        <div className="space-y-2">
          {filteredFiles.map((file) => {
            const progress = uploadProgress?.get(file.file.name);

            return (
              <FileItem
                key={file.id}
                file={file}
                uploadProgress={progress?.progress}
                uploadStatus={progress?.status}
                onRemove={onRemoveFile}
                onCategoryChange={onCategoryChange}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
