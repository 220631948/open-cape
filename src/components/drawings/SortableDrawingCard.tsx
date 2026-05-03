import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DrawingCard } from './DrawingCard';
import { Drawing } from '@/src/hooks/useDrawings';

interface SortableDrawingCardProps {
  drawing: Drawing;
  onView: (drawing: Drawing) => void;
  onEdit: (drawing: Drawing) => void;
  onDelete: (id: string) => void;
  projectName?: string;
}

export const SortableDrawingCard: React.FC<SortableDrawingCardProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.drawing.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DrawingCard {...props} />
    </div>
  );
};
