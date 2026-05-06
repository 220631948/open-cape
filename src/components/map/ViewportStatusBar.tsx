import React from 'react';
import { cn } from '@/lib/utils';
import { Crosshair, Navigation } from 'lucide-react';

interface ViewportStatusBarProps {
  className?: string;
  zoom?: number;
  lat?: number;
  lng?: number;
}

export const ViewportStatusBar: React.FC<ViewportStatusBarProps> = ({ 
  className,
  zoom = 11.0,
  lat = -33.9249,
  lng = 18.4241
}) => {
  return (
    <div className={cn("h-8 bg-[#0A0A0F] border-t border-slate-800 flex items-center px-4 justify-between text-[11px] font-medium text-slate-300 font-mono tracking-tight shrink-0 z-20", className)}>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5" title="Current Zoom Level">
          <Navigation className="h-3 w-3 text-slate-400" />
          z{zoom.toFixed(1)}
        </span>
        <span className="flex items-center gap-1.5" title="Center Coordinates">
          <Crosshair className="h-3 w-3 text-slate-400" />
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-slate-400">
        <span className="hidden sm:inline-block border-l border-slate-800 pl-4">EPSG:4326 (WGS84)</span>
        <span className="border-l border-slate-800 pl-4 font-sans text-[10px] uppercase font-bold text-slate-500">Cape Town Urban Property Intelligence</span>
      </div>
    </div>
  );
};
