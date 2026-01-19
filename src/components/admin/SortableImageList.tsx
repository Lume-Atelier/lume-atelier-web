'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileCategory } from '@/types';
import type { FileWithMetadata } from '@/hooks/useProductFiles';
import { DraggableFileItem } from './DraggableFileItem';

export interface SortableImageListProps {
  files: FileWithMetadata[];
  uploadProgress?: Map<string, { progress: number; status: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error' }>;
  onRemoveFile: (id: string) => void;
  onCategoryChange?: (id: string, category: FileCategory) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

/**
 * Lista de arquivos com suporte a drag-and-drop para reordenação
 * Usa DnD Kit para gerenciar o contexto de arrastar e soltar
 */
export function SortableImageList({
  files,
  uploadProgress,
  onRemoveFile,
  onCategoryChange,
  onReorder,
}: SortableImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex((f) => f.id === active.id);
      const newIndex = files.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  }, [files, onReorder]);

  const fileIds = files.map((f) => f.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={fileIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {files.map((file) => {
            const progress = uploadProgress?.get(file.file.name);

            return (
              <DraggableFileItem
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
      </SortableContext>
    </DndContext>
  );
}
