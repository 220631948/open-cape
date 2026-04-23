import React from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';

export const MapPage = () => {
  return (
    <div className="absolute inset-0 flex">
      {/* Layer panel placeholder */}
      <div className="w-64 bg-white border-r border-surface-200 hidden md:flex flex-col p-4 shrink-0">
        <h3 className="font-semibold text-sm text-surface-900 mb-4">Map Layers</h3>
        <div className="space-y-4 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-auto border-t border-surface-200 pt-4">
           <p className="text-xs text-surface-500">Legend placeholder</p>
        </div>
      </div>
      
      {/* Map Canvas placeholder */}
      <div className="flex-1 bg-surface-100 flex items-center justify-center relative">
        <div className="text-center p-6 bg-white/80 backdrop-blur rounded-xl shadow-sm border border-surface-200 max-w-sm">
          <strong className="block text-surface-900 font-medium mb-1">Map Canvas Shell</strong>
          <p className="text-sm text-surface-500">MapLibre GL JS will render here. No fake data or mock geodata loaded.</p>
        </div>
        
        {/* Floating map controls placeholder */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
           <Skeleton className="h-8 w-8 rounded-md bg-white border border-surface-200 shadow-sm" />
           <Skeleton className="h-8 w-8 rounded-md bg-white border border-surface-200 shadow-sm" />
        </div>
      </div>
    </div>
  );
};
