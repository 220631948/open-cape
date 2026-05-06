import React from 'react';
import { useEarthEngineAccess } from '@/hooks/useEarthEngineAccess';
import { useEnvironmentalContext } from '@/contexts/EnvironmentalContext';
import { EE_LAYERS_CATALOG } from '@/hooks/useEnvironmentalLayers';
import { Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EnvironmentalIntelligencePanel: React.FC = () => {
  const { hasAccess, isChecking } = useEarthEngineAccess();
  const { activeLayers, toggleLayer, opacities, updateOpacity, timeRange, setTimeRange } = useEnvironmentalContext();

  if (isChecking) {
    return (
      <div className="p-3 bg-surface-50 animate-pulse space-y-2">
        <div className="h-4 bg-surface-200 rounded w-1/2" />
        <div className="h-8 bg-surface-200 rounded w-full" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-3 mx-3 my-2 bg-surface-100 rounded-lg border border-surface-200 text-center">
        <Lock className="h-4 w-4 text-surface-400 mx-auto mb-2" />
        <p className="text-[10px] text-surface-500 font-semibold uppercase tracking-wider mb-1">Earth Engine</p>
        <p className="text-[10px] text-surface-400">Sign in to activate environmental layers.</p>
      </div>
    );
  }

  // Group layers by category
  const categories = Array.from(new Set(EE_LAYERS_CATALOG.map(l => l.category)));

  return (
    <div className="px-3 py-2 border-t border-surface-200">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-emerald-600" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-surface-900">Environmental Intelligence</h3>
      </div>
      <p className="text-[9px] text-surface-50 mb-4 px-1 leading-relaxed opacity-70">
        Analytical layers derived from verified public sources and Earth Engine. 
        Accuracy is contextual. Not for legal/official zoning.
      </p>

      <div className="space-y-4">
        {categories.map(category => (
          <div key={category} className="space-y-1">
            <h4 className="text-[10px] font-semibold text-emerald-100/50 uppercase tracking-widest px-1 mb-1">{category}</h4>
            {EE_LAYERS_CATALOG.filter(l => l.category === category).map(layer => {
              const isActive = activeLayers.includes(layer.id);
              const opacity = opacities[layer.id] ?? layer.opacity;

              return (
                <div key={layer.id} className={cn("rounded-md transition-colors border", isActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-transparent border-transparent hover:bg-white/5')}>
                  <div className="flex items-center justify-between p-1.5 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        onChange={() => toggleLayer(layer.id)}
                        className="rounded text-emerald-500 focus:ring-emerald-500 h-3 w-3 border-white/20 bg-transparent"
                      />
                      <span className={cn("text-xs truncate", isActive ? 'text-emerald-100 font-medium' : 'text-surface-300')}>{layer.name}</span>
                    </label>
                  </div>
                  {isActive && (
                    <div className="px-6 pb-2 pt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-emerald-400 w-12 shrink-0">Opacity</span>
                        <input 
                          type="range" 
                          min="0" max="1" step="0.1" 
                          value={opacity}
                          onChange={(e) => updateOpacity(layer.id, parseFloat(e.target.value))}
                          className="w-full h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[8px] text-emerald-500/60 font-mono">
                        <span>SOURCE: SENTINEL-2/EE</span>
                        <span>LIVE: 2024-04</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {activeLayers.length > 0 && (
         <div className="mt-4 pt-4 border-t border-surface-200 space-y-3">
           <h4 className="text-[10px] font-semibold text-surface-900 uppercase tracking-wider">Time Series Control</h4>
           <div className="px-1 flex items-center gap-3">
             <span className="text-[10px] font-medium text-surface-500">{timeRange[0]}</span>
             <input type="range" min="2015" max="2024" value={timeRange[1]} onChange={(e) => setTimeRange([timeRange[0], parseInt(e.target.value)])} className="w-full h-1 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-surface-600" />
             <span className="text-[10px] font-medium text-surface-500">{timeRange[1]}</span>
           </div>
         </div>
      )}
    </div>
  );
};
