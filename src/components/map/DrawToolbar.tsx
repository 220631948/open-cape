import React from 'react';
import { 
  Square, 
  Type, 
  MousePointer2, 
  Trash2, 
  Settings2,
  Spline,
  MapPin,
  Pencil,
  Maximize
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

export type DrawMode = 'select' | 'point' | 'line' | 'polygon' | 'edit';

interface DrawToolbarProps {
  activeMode: DrawMode;
  onModeChange: (mode: DrawMode) => void;
  onDelete: () => void;
  onProperties: () => void;
  onAnnotate: () => void;
  isSelected: boolean;
  className?: string;
  hasSelectedParcel?: boolean;
  showBuffer?: boolean;
  onToggleBuffer?: () => void;
}

export const DrawToolbar: React.FC<DrawToolbarProps> = ({
  activeMode,
  onModeChange,
  onDelete,
  onProperties,
  onAnnotate,
  isSelected,
  className,
  hasSelectedParcel,
  showBuffer,
  onToggleBuffer
}) => {
  return (
    <div className={cn(
      "flex flex-col gap-1 p-1 bg-white/90 backdrop-blur border border-surface-200 rounded-xl shadow-lg",
      className
    )}>
      <ToolbarButton 
        icon={MousePointer2} 
        label="Select" 
        active={activeMode === 'select'} 
        onClick={() => onModeChange('select')} 
      />
      
      {hasSelectedParcel && onToggleBuffer && (
        <ToolbarButton 
          icon={Maximize} 
          label={showBuffer ? "Remove 50m Buffer" : "Draw 50m Buffer"} 
          active={showBuffer}
          onClick={onToggleBuffer}
          className={cn(showBuffer ? "bg-violet-600 text-white" : "text-violet-600 hover:bg-violet-50")}
        />
      )}

      <div className="h-px bg-surface-100 mx-2 my-0.5" />
      
      <ToolbarButton 
        icon={MapPin} 
        label="Point" 
        active={activeMode === 'point'} 
        onClick={() => onModeChange('point')} 
      />
      <ToolbarButton 
        icon={Spline} 
        label="Line" 
        active={activeMode === 'line'} 
        onClick={() => onModeChange('line')} 
      />
      <ToolbarButton 
        icon={Square} 
        label="Polygon" 
        active={activeMode === 'polygon'} 
        onClick={() => onModeChange('polygon')} 
      />

      <div className="h-px bg-surface-100 mx-2 my-0.5" />
      
      <ToolbarButton 
        icon={Settings2} 
        label="Styles" 
        disabled={!isSelected}
        onClick={onProperties} 
      />
      <ToolbarButton 
        icon={Type} 
        label="Annotate" 
        disabled={!isSelected}
        onClick={onAnnotate} 
      />
      <ToolbarButton 
        icon={Trash2} 
        label="Delete" 
        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
        disabled={!isSelected}
        onClick={onDelete} 
      />
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  disabled, 
  onClick,
  className
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={cn(
      "h-9 w-9 flex items-center justify-center rounded-lg transition-all relative group",
      active 
        ? "bg-surface-900 text-white shadow-md" 
        : "text-surface-600 hover:bg-surface-100 disabled:opacity-30 disabled:hover:bg-transparent",
      className
    )}
  >
    <Icon className="h-4.5 w-4.5" />
    <span className="absolute left-full ml-3 px-2 py-1 bg-surface-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
      {label}
    </span>
  </button>
);
