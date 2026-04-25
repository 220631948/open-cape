import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EnvironmentalLayerConfig, EE_LAYERS_CATALOG } from '@/src/hooks/useEnvironmentalLayers';

interface EnvironmentalContextType {
  catalog: EnvironmentalLayerConfig[];
  activeLayers: string[];
  toggleLayer: (layerId: string) => void;
  opacities: Record<string, number>;
  updateOpacity: (layerId: string, opacity: number) => void;
  timeRange: [number, number];
  setTimeRange: (range: [number, number]) => void;
}

export const EnvironmentalContext = createContext<EnvironmentalContextType | null>(null);

export const EnvironmentalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  return (
    <EnvironmentalContext.Provider value={{
      catalog: EE_LAYERS_CATALOG,
      activeLayers,
      toggleLayer,
      opacities,
      updateOpacity,
      timeRange,
      setTimeRange
    }}>
      {children}
    </EnvironmentalContext.Provider>
  );
};

export const useEnvironmentalContext = () => {
  const ctx = useContext(EnvironmentalContext);
  if (!ctx) throw new Error("Missing EnvironmentalProvider");
  return ctx;
};
