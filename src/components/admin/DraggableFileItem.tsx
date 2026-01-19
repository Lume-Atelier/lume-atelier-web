'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { FileCategory } from '@/types';
import type { FileWithMetadata } from '@/hooks/useProductFiles';
import { FileItem } from './FileItem';

export interface DraggableFileItemProps {
  file: FileWithMetadata;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error';
  onRemove: (id: string) => void;
  onCategoryChange?: (id: string, category: FileCategory) => void;
}

/**
 * Wrapper do FileItem com suporte a drag-and-drop
 * Mostra handle de arraste (ícone grip) no hover
 */
export function DraggableFileItem({
  file,
  uploadProgress,
  uploadStatus,
  onRemove,
  onCategoryChange,
}: DraggableFileItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Handle de arraste - visível no hover */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 dark:bg-gray-800 rounded-l-lg z-10"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* FileItem com margem para o handle */}
      <div className="pl-8">
        <FileItem
          file={file}
          uploadProgress={uploadProgress}
          uploadStatus={uploadStatus}
          onRemove={onRemove}
          onCategoryChange={onCategoryChange}
        />
      </div>
    </div>
  );
}
