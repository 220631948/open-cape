import React from 'react';
import { useEnvironmentalContext } from '@/contexts/EnvironmentalContext';
import { Layers } from 'lucide-react';

export const EnvironmentalLegend: React.FC = () => {
  const { activeLayers } = useEnvironmentalContext();

  if (activeLayers.length === 0) return null;

  return (
    <div className="border-t border-surface-200 bg-surface-50 p-3 shrink-0 flex flex-col gap-2 relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
       <h4 className="text-[10px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-1.5">
          <Layers className="h-3 w-3" />
          EE Legend
       </h4>
       
       <div className="space-y-2">
         {activeLayers.includes('ee_ndvi') && (
           <div>
             <div className="flex justify-between text-[9px] text-surface-500 mb-1">
                <span>Low Veg</span>
                <span>High Veg</span>
             </div>
             <div className="h-1.5 w-full bg-gradient-to-r from-stone-300 via-emerald-400 to-emerald-800 rounded" />
           </div>
         )}
         {activeLayers.includes('ee_lst') && (
           <div>
             <div className="flex justify-between text-[9px] text-surface-500 mb-1">
                <span>Cool</span>
                <span>Hot</span>
             </div>
             <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-amber-300 to-rose-700 rounded" />
           </div>
         )}
         {activeLayers.includes('ee_water') && (
           <div>
             <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-3 bg-blue-500 rounded-sm" />
                <span className="text-[10px] text-surface-600">Surface Water Found</span>
             </div>
           </div>
         )}
         {(!activeLayers.includes('ee_ndvi') && !activeLayers.includes('ee_lst') && !activeLayers.includes('ee_water')) && (
           <p className="text-[10px] text-surface-500 italic">No visual legend required for active analytical layers.</p>
         )}
       </div>
    </div>
  );
};
