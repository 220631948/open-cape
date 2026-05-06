import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, LayoutGrid } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  className,
  icon: Icon = LayoutGrid,
  title,
  description,
  action,
  actionLabel,
  onAction,
  ...props
}: EmptyStateProps) {
  const finalActionLabel = action?.label || actionLabel;
  const finalOnAction = action?.onClick || onAction;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-200 rounded-xl bg-surface-50/50",
        className
      )}
      {...props}
    >
      <div className="h-12 w-12 rounded-full bg-surface-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-surface-400" />
      </div>
      <h3 className="text-lg font-medium text-surface-900 mb-1">{title}</h3>
      <p className="text-surface-500 max-w-sm mb-6">{description}</p>
      {finalActionLabel && finalOnAction && (
        <Button variant="secondary" onClick={finalOnAction}>
          {finalActionLabel}
        </Button>
      )}
    </div>
  );
}
