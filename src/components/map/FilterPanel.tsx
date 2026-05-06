import React, { useState, useEffect } from 'react';
import { X, Filter, Maximize2, Loader2, Sparkles, Bell } from 'lucide-react';
import { useMapFilters } from '@/hooks/useMapFilters';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { mapFilterStore, useMapFilterStore } from '@/store/mapFilterStore';
import { useGeminiQuery } from '@/hooks/useGeminiQuery';
import { useWatchlists } from '@/hooks/useWatchlists';

interface FilterPanelProps {
  onClose?: () => void;
  className?: string;
  onZoomToFit?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onClose, className, onZoomToFit }) => {
  const { filters, setFilters, clearFilters, activeCount } = useMapFilters();
  const { availableMunicipalities, isLoading: loadingMunicipalities } = useMapFilterStore();
  
  const [minPriceTemp, setMinPriceTemp] = useState(filters.priceMin?.toString() || '');
  const [maxPriceTemp, setMaxPriceTemp] = useState(filters.priceMax?.toString() || '');

  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);

  const [aiQuery, setAiQuery] = useState('');
  const { parseQuery, loading: aiLoading, error: aiError } = useGeminiQuery();
  const { createWatchlist } = useWatchlists();

  useEffect(() => {
    mapFilterStore.fetchMunicipalities();
    
    // Fetch live property types from Cadastre layer
    const fetchPropertyTypes = async () => {
      setLoadingPropertyTypes(true);
      try {
        const res = await fetch('https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/2/query?where=1%3D1&outFields=PRCL_TYPE&returnGeometry=false&returnDistinctValues=true&orderByFields=PRCL_TYPE&f=json');
        const data = await res.json();
        const types = data.features?.map((f: any) => f.attributes?.PRCL_TYPE).filter(Boolean) || [];
        setPropertyTypes(types.length > 0 ? types : ['Erf', 'Farm', 'Public Place', 'Agricultural']);
      } catch(e) {
        console.error(e);
        setPropertyTypes(['Erf', 'Farm', 'Public Place', 'Agricultural']);
      } finally {
        setLoadingPropertyTypes(false);
      }
    };
    
    fetchPropertyTypes();
  }, []);

  const handlePriceApply = () => {
    setFilters({ 
      priceMin: minPriceTemp ? Number(minPriceTemp) : null,
      priceMax: maxPriceTemp ? Number(maxPriceTemp) : null
    });
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    const result = await parseQuery(aiQuery);
    if (result) {
       const newFilters: any = {};
       if (result.municipality) newFilters.locations = [result.municipality];
       if (result.zoning && result.zoning.length > 0) newFilters.propertyTypes = result.zoning;
       if (result.priceMin !== undefined) {
         setMinPriceTemp(result.priceMin.toString());
         newFilters.priceMin = result.priceMin;
       }
       if (result.priceMax !== undefined) {
         setMaxPriceTemp(result.priceMax.toString());
         newFilters.priceMax = result.priceMax;
       }
       setFilters(newFilters);
       setAiQuery(''); // Clear after apply
    }
  };

  const toggleArrayItem = (arr: string[], item: string, key: 'locations' | 'propertyTypes' | 'features') => {
    const newArr = arr.includes(item) ? arr.filter(i => i !== item) : arr.concat([item]);
    if (key === 'locations') setFilters({ locations: newArr });
    else if (key === 'propertyTypes') setFilters({ propertyTypes: newArr });
    else if (key === 'features') setFilters({ features: newArr });
  };

  const handleSaveWatchlist = async () => {
    const name = prompt("Enter a name for this watchlist:");
    if (name) {
       await createWatchlist(name, {
         allotmentArea: filters.locations[0], // Simplified taking first location
         zoning: filters.propertyTypes[0],
         minPrice: filters.priceMin || undefined,
         maxPrice: filters.priceMax || undefined
       });
       alert("Watchlist saved! You will receive alerts when new properties match.");
    }
  };

  return (
    <div className={cn("flex flex-col bg-white h-full w-full shadow-xl border-r border-surface-200 overflow-hidden", className)}>
      <div className="flex items-center justify-between p-4 border-b border-surface-200 shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-surface-600" />
          <h2 className="text-sm font-semibold text-surface-900">Filters {activeCount > 0 && `(${activeCount})`}</h2>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* AI Query */}
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg space-y-2">
           <h3 className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
             <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Natural Language Filters
           </h3>
           <div className="flex gap-2">
             <input 
               type="text"
               value={aiQuery}
               onChange={(e) => setAiQuery(e.target.value)}
               placeholder="e.g. farms in Cape Town"
               className="flex-1 text-sm bg-white border border-indigo-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
               onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
             />
             <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-auto py-1" onClick={handleAiQuery} disabled={aiLoading || !aiQuery.trim()}>
               {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
             </Button>
           </div>
           {aiError && <p className="text-[10px] text-red-600">{aiError}</p>}
        </div>

        {/* Location (Municipalities) */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider flex justify-between items-center">
            <span>Municipality</span>
            {loadingMunicipalities && <Loader2 className="w-3 h-3 animate-spin text-surface-400" />}
          </h3>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {availableMunicipalities.map(c => (
              <button
                key={c}
                onClick={() => toggleArrayItem(filters.locations, c, 'locations')}
                className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors border",
                  filters.locations.includes(c)
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                    : "bg-surface-50 text-surface-700 border-surface-200 hover:border-surface-300"
                )}
              >
                {c}
              </button>
            ))}
            {!loadingMunicipalities && availableMunicipalities.length === 0 && (
              <span className="text-xs text-surface-400 italic">No municipalities available.</span>
            )}
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider flex justify-between items-center">
            <span>Parcel Type</span>
            {loadingPropertyTypes && <Loader2 className="w-3 h-3 animate-spin text-surface-400" />}
          </h3>
          <div className="space-y-2">
            {propertyTypes.map(t => (
              <label key={t} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={filters.propertyTypes.includes(t)}
                  onChange={() => toggleArrayItem(filters.propertyTypes, t, 'propertyTypes')}
                  className="w-4 h-4 text-indigo-600 border-surface-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-surface-700 group-hover:text-surface-900">{t}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

      {activeCount > 0 && (
        <div className="p-4 border-t border-surface-200 bg-surface-50 shrink-0 space-y-2">
          {onZoomToFit && (
            <Button 
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              onClick={onZoomToFit}
            >
              <Maximize2 className="w-4 h-4" />
              Zoom to Fit Results
            </Button>
          )}
          <Button 
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
            onClick={handleSaveWatchlist}
          >
            <Bell className="w-4 h-4" />
            Save Search as Watchlist
          </Button>
        </div>
      )}
    </div>
  );
};
