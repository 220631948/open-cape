import { useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import { mapFilterStore, useMapFilterStore } from '../store/mapFilterStore';
import { VECTOR_LAYERS } from './useVectorLayer';

const originalFilters = new Map<string, any>();

export function useMunicipalityFilter() {
  const mapContext = useMap();
  const map = mapContext.current || Object.values(mapContext)[0]; // Fallback to first available map if default 'current' is empty
  const { selectedMunicipality, availableMunicipalities, isLoading } = useMapFilterStore();

  useEffect(() => {
    if (!map) return;
    const maplibreMap = map.getMap();

    const applyFilter = () => {
      const style = maplibreMap.getStyle();
      if (!style || !style.layers) return;

      const layersToFilter = style.layers.filter(l => {
        return VECTOR_LAYERS.some(vl => 
            l.id === `layer-${vl.id}` || 
            l.id === `layer-${vl.id}-lines` || 
            l.id === `layer-${vl.id}-fill` ||
            l.id === `layer-${vl.id}-line`
        ) || l.id.includes('wcgp-') || l.id.includes('cadastre') || l.id.includes('zoning');
      });

      layersToFilter.forEach(layer => {
        const layerId = layer.id;
        
        // Save original filter if not saved
        if (!originalFilters.has(layerId)) {
          originalFilters.set(layerId, maplibreMap.getFilter(layerId));
        }

        const originalFilter = originalFilters.get(layerId);

        if (selectedMunicipality) {
          const muniFilter = ["==", ["get", "municipality"], selectedMunicipality];
          
          if (originalFilter) {
             if (Array.isArray(originalFilter) && originalFilter[0] === 'all') {
                const isAlreadyPresent = originalFilter.some((f: any) => JSON.stringify(f) === JSON.stringify(muniFilter));
                if (!isAlreadyPresent) {
                   maplibreMap.setFilter(layerId, [...originalFilter, muniFilter] as any);
                }
             } else {
                maplibreMap.setFilter(layerId, ["all", originalFilter, muniFilter] as any);
             }
          } else {
             maplibreMap.setFilter(layerId, muniFilter as any);
          }
        } else {
          // Remove filter by restoring original
          maplibreMap.setFilter(layerId, (originalFilter || null) as any);
        }
      });
    };

    applyFilter();
    
    // styledata is fired when layers are added/removed or style changes
    maplibreMap.on('styledata', applyFilter);

    return () => {
      maplibreMap.off('styledata', applyFilter);
    };
  }, [map, selectedMunicipality]);

  return {
    selectedMunicipality,
    availableMunicipalities,
    isLoading,
    setMunicipality: mapFilterStore.setMunicipality,
    clearMunicipality: mapFilterStore.clearMunicipality,
    fetchMunicipalities: mapFilterStore.fetchMunicipalities
  };
}
