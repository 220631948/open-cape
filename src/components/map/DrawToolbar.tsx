import React from 'react';
import { 
  Square, 
  Type, 
  MousePointer2, 
  Trash2, 
  Settings2,
  Route,
  MapPin,
  CircleDashed,
  Bookmark,
  LayoutDashboard,
  Plus,
  Minus,
  Compass,
  Hexagon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMap } from 'react-map-gl/maplibre';

export type DrawMode = 'select' | 'point' | 'line' | 'polygon' | 'square' | 'edit' | 'radius';

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
  onBookmarkClick?: () => void;
  onSaveMapClick?: () => void;
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
  onToggleBuffer,
  onBookmarkClick,
  onSaveMapClick
}) => {
  const { current: map } = useMap();

  const handleZoomIn = () => {
    map?.zoomIn();
  };

  const handleZoomOut = () => {
    map?.zoomOut();
  };

  const handleResetBearing = () => {
    map?.resetNorthPitch();
  };

  return (
    <>
    <div className={cn(
      "flex flex-col gap-1.5 p-1.5 bg-white/95 backdrop-blur-md border border-surface-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
      className
    )}>
      <div className="flex flex-col gap-0.5">
        <ToolbarButton 
          icon={MousePointer2} 
          label="Select tool" 
          active={activeMode === 'select'} 
          onClick={() => onModeChange('select')} 
        />
        
        {hasSelectedParcel && onToggleBuffer && (
          <ToolbarButton 
            icon={CircleDashed} 
            label={showBuffer ? "Remove 50m Buffer" : "Add 50m Buffer"} 
            active={showBuffer}
            onClick={onToggleBuffer}
            className={cn(showBuffer ? "bg-violet-600 text-white" : "text-violet-600 hover:bg-violet-50")}
          />
        )}
      </div>

      <div className="h-px bg-surface-200 mx-2 my-1" />
      
      <div className="flex flex-col gap-0.5">
        <ToolbarButton 
          icon={MapPin} 
          label="Draw Point" 
          active={activeMode === 'point'} 
          onClick={() => onModeChange('point')} 
        />
        <ToolbarButton 
          icon={Route} 
          label="Draw Line" 
          active={activeMode === 'line'} 
          onClick={() => onModeChange('line')} 
        />
        <ToolbarButton 
          icon={Hexagon} 
          label="Draw Polygon" 
          active={activeMode === 'polygon'} 
          onClick={() => onModeChange('polygon')} 
        />
        <ToolbarButton 
          icon={Square}
          label="Draw Square" 
          active={activeMode === 'square'} 
          onClick={() => onModeChange('square')} 
        />
        <ToolbarButton 
          icon={CircleDashed} 
          label="Radius Analysis" 
          active={activeMode === 'radius'} 
          onClick={() => onModeChange('radius')} 
        />
      </div>

      {isSelected && (
        <>
          <div className="h-px bg-surface-200 mx-2 my-1" />
          <div className="flex flex-col gap-0.5">
            <ToolbarButton 
              icon={Settings2} 
              label="Styles" 
              onClick={onProperties} 
            />
            <ToolbarButton 
              icon={Type} 
              label="Annotate" 
              onClick={onAnnotate} 
            />
            <ToolbarButton 
              icon={Trash2} 
              label="Delete" 
              className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
              onClick={onDelete} 
            />
          </div>
        </>
      )}

      <>
        <div className="h-px bg-surface-200 mx-2 my-1" />
        <div className="flex flex-col gap-0.5">
          <ToolbarButton 
            icon={Plus} 
            label="Zoom In" 
            onClick={handleZoomIn} 
          />
          <ToolbarButton 
            icon={Minus} 
            label="Zoom Out" 
            onClick={handleZoomOut} 
          />
          <ToolbarButton 
            icon={Compass} 
            label="Reset North" 
            onClick={handleResetBearing} 
          />
        </div>
      </>

      {(onBookmarkClick || onSaveMapClick) && (
        <>
          <div className="h-px bg-surface-200 mx-2 my-1" />
          <div className="flex flex-col gap-0.5">
            {onBookmarkClick && (
              <ToolbarButton 
                icon={Bookmark} 
                label="Save Bookmark" 
                onClick={onBookmarkClick} 
              />
            )}
            {onSaveMapClick && (
              <ToolbarButton 
                icon={LayoutDashboard} 
                label="Save Map View" 
                onClick={onSaveMapClick} 
              />
            )}
          </div>
        </>
      )}
    </div>

    {activeMode !== 'select' && activeMode !== 'edit' && (
      <div className="absolute right-full top-12 mr-4 p-3 bg-white/95 backdrop-blur-md border border-surface-200 rounded-xl w-48 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-surface-500 mb-1">How to use</p>
        <p className="text-xs text-surface-700 leading-relaxed">
          {activeMode === 'point' && "Click on the map to place a point. You can add multiple points."}
          {activeMode === 'line' && "Click to add points to your line. Double-click or press Enter to finish."}
          {activeMode === 'polygon' && "Click to draw a shape. Click the first point again, double-click, or press Enter to finish."}
          {activeMode === 'square' && "Click and drag to draw a square/rectangle. Release to finish."}
          {activeMode === 'radius' && "Click center point to start radius analysis. Then select radius size."}
        </p>
      </div>
    )}
    </>
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
    aria-label={label}
    className={cn(
      "h-10 w-10 flex items-center justify-center rounded-xl transition-all relative group",
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105" 
        : "text-surface-600 hover:bg-surface-100 hover:text-indigo-600 duration-200 disabled:opacity-30 disabled:hover:bg-transparent",
      className
    )}
  >
    <Icon className={cn("h-5 w-5", active ? "scale-110 stroke-[2.5]" : "scale-100 transition-transform group-hover:scale-110 stroke-[1.5]")} />
    {active && (
      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full shadow-sm" />
    )}
    <span className="absolute right-full mr-3 px-2.5 py-1.5 bg-surface-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 transform translate-x-2 group-hover:translate-x-0 shadow-xl" aria-hidden="true">
      {label}
    </span>
  </button>
);

