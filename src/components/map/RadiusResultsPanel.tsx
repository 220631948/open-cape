import React from 'react';
import { X, MapPin, Layers, Info, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SpatialQueryResult } from '@/services/spatialAnalysisBus';
import { cn } from '@/lib/utils';

interface RadiusResultsPanelProps {
  results: SpatialQueryResult[];
  radius: number;
  center: [number, number];
  onClose: () => void;
  onRadiusChange?: (radius: number) => void;
  isLoading?: boolean;
}

export const RadiusResultsPanel: React.FC<RadiusResultsPanelProps> = ({
  results,
  radius,
  center,
  onClose,
  onRadiusChange,
  isLoading
}) => {
  const totalFeatures = results.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-md border border-surface-200 rounded-2xl shadow-2xl flex flex-col max-h-[80vh] z-50 animate-in slide-in-from-right-4">
      {/* Header */}
      <div className="p-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-surface-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-600" />
            Nearby Analysis
          </h3>
          <div className="flex gap-1.5 mt-1" role="group" aria-label="Select search radius">
             {[100, 250, 500, 1000].map(r => (
               <button 
                 key={r}
                 onClick={() => onRadiusChange?.(r)}
                 aria-pressed={radius === r}
                 aria-label={`${r} meters`}
                 className={cn(
                   "text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
                   radius === r 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                    : "bg-white border-surface-200 text-surface-500 hover:border-indigo-300"
                 )}
               >
                 {r}m
               </button>
             ))}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-100 rounded-lg text-surface-400 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="Close nearby analysis"
          title="Close nearby analysis"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-surface-400 gap-3">
            <Activity className="h-8 w-8 animate-spin" />
            <span className="text-xs font-medium">Analyzing spatial context...</span>
          </div>
        ) : totalFeatures === 0 ? (
          <div className="py-8 text-center">
            <div className="h-12 w-12 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Info className="h-6 w-6 text-surface-300" />
            </div>
            <p className="text-sm font-medium text-surface-900">No features found</p>
            <p className="text-xs text-surface-500 mt-1">Try expanding the search radius or selecting a different center point.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 pb-2">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100/50">
                <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Found</span>
                <span className="text-2xl font-bold text-indigo-700">{totalFeatures}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100/50">
                <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Categories</span>
                <span className="text-2xl font-bold text-emerald-700">{results.length}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest px-1">Detailed Breakdown</p>
              {results.map((group, idx) => (
                <div key={idx} className="group p-3 bg-white border border-surface-100 rounded-xl hover:border-indigo-200 transition-all hover:shadow-sm cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-surface-50 rounded-lg flex items-center justify-center text-surface-400 group-hover:text-indigo-600 transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-surface-900 capitalize">{group.category.replace(/-/g, ' ')}</h4>
                        <p className="text-[10px] text-surface-500">{group.count} occurrences</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-surface-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-surface-100 bg-surface-50/50 rounded-b-2xl">
         <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-wider py-5" onClick={onClose}>
           Clear Analysis
         </Button>
      </div>
    </div>
  );
};
