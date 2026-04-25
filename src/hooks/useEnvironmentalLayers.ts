import { useState, useCallback } from 'react';

export interface EnvironmentalLayerConfig {
  id: string;
  name: string;
  type: 'raster' | 'vector';
  category: 'Vegetation & Land Cover' | 'Water & Flood Context' | 'Heat & Urban Climate' | 'Terrain';
  opacity: number;
}

export const EE_LAYERS_CATALOG: EnvironmentalLayerConfig[] = [
  { id: 'ee_ndvi', name: 'Vegetation (NDVI)', type: 'raster', category: 'Vegetation & Land Cover', opacity: 0.8 },
  { id: 'ee_landcover', name: 'Land Cover Classification', type: 'raster', category: 'Vegetation & Land Cover', opacity: 0.8 },
  { id: 'ee_water', name: 'Surface Water Occurrence', type: 'raster', category: 'Water & Flood Context', opacity: 0.8 },
  { id: 'ee_flood_indicator', name: 'Flood-Prone Indicators', type: 'raster', category: 'Water & Flood Context', opacity: 0.8 },
  { id: 'ee_lst', name: 'Heat Exposure (LST)', type: 'raster', category: 'Heat & Urban Climate', opacity: 0.8 },
  { id: 'ee_elevation', name: 'Elevation (SRTM)', type: 'raster', category: 'Terrain', opacity: 0.8 },
  { id: 'ee_slope', name: 'Slope', type: 'raster', category: 'Terrain', opacity: 0.8 },
];

export function useEnvironmentalLayers() {
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [opacities, setOpacities] = useState<Record<string, number>>({});
  const [timeRange, setTimeRange] = useState<[number, number]>([2020, new Date().getFullYear()]);

  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]
    );
  }, []);

  const updateOpacity = useCallback((layerId: string, opacity: number) => {
    setOpacities(prev => ({ ...prev, [layerId]: opacity }));
  }, []);

  return {
    catalog: EE_LAYERS_CATALOG,
    activeLayers,
    toggleLayer,
    opacities,
    updateOpacity,
    timeRange,
    setTimeRange
  };
}
