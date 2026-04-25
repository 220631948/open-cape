import React from 'react';
import { Button } from '@/src/components/ui/Button';
import {
  MousePointer2,
  PenTool,
  Ruler,
  Bookmark,
  GitCompare,
  Home,
  LocateFixed,
  Plus,
  Minus,
  Compass,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MapToolbarProps {
  className?: string;
  onBookmarkClick?: () => void;
  onSaveMapClick?: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({ className, onBookmarkClick, onSaveMapClick }) => {
  const tools = [
    { icon: MousePointer2, label: 'Select feature', active: true },
    { icon: PenTool, label: 'Draw annotation', active: false },
    { icon: Ruler, label: 'Measure distance', active: false },
    { icon: Bookmark, label: 'Save bookmark', active: false, onClick: onBookmarkClick },
    { icon: LayoutDashboard, label: 'Save map view', active: false, onClick: onSaveMapClick },
    { icon: GitCompare, label: 'Compare scenarios', active: false },
  ];

  const viewTools = [
    { icon: Home, label: 'Reset view' },
    { icon: LocateFixed, label: 'Locate me' },
  ];

  const zoomTools = [
    { icon: Plus, label: 'Zoom in' },
    { icon: Minus, label: 'Zoom out' },
    { icon: Compass, label: 'Reset bearing' },
  ];

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Primary Interaction Tools */}
      <div className="flex flex-col gap-0.5 bg-white p-1 rounded-lg shadow-sm border border-surface-200">
        {tools.map((tool, idx) => (
          <Button
            key={idx}
            variant={tool.active ? "secondary" : "ghost"}
            size="icon"
            onClick={tool.onClick}
            className={cn("h-9 w-9 text-surface-600", tool.active && "text-rose-600 bg-rose-50")}
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Viewport Control Tools */}
      <div className="flex flex-col gap-0.5 bg-white p-1 rounded-lg shadow-sm border border-surface-200">
        {viewTools.map((tool, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-surface-600"
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      
      {/* Zoom / Nav Tools */}
      <div className="flex flex-col gap-0.5 bg-white p-1 rounded-lg shadow-sm border border-surface-200">
        {zoomTools.map((tool, idx) => (
          <Button
            key={idx}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-surface-600"
            title={tool.label}
          >
            <tool.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    </div>
  );
};
