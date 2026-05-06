import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { EnvironmentalLayerConfig, EE_LAYERS_CATALOG } from '@/hooks/useEnvironmentalLayers';
import { useLayerPreferences } from './useLayerPreferences';

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
  const { preferences, updatePreferences } = useLayerPreferences();
  const [activeLayers, setActiveLayers] = useState<string[]>([]);
  const [opacities, setOpacities] = useState<Record<string, number>>({});
  const [timeRange, setTimeRange] = useState<[number, number]>([2020, new Date().getFullYear()]);

  // Sync initial opacities from preferences only on load or actual change
  useEffect(() => {
    if (preferences?.opacities) {
      setOpacities(prev => {
        // Simple check to avoid unnecessary updates if deep equal (shallow check here)
        const isDifferent = Object.keys(preferences.opacities || {}).some(
          key => preferences.opacities?.[key] !== prev[key]
        );
        if (!isDifferent) return prev;
        return {
          ...prev,
          ...preferences.opacities
        };
      });
    }
  }, [preferences?.opacities]);

  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) ? prev.filter(id => id !== layerId) : [...prev, layerId]
    );
  }, []);

  const updateOpacity = useCallback((layerId: string, opacity: number) => {
    setOpacities(prev => ({ ...prev, [layerId]: opacity }));
  }, []);

  // Persist opacities to preferences when they change (debouncing might be good here)
  useEffect(() => {
    if (preferences && Object.keys(opacities).length > 0) {
       // Only update if different from what's in preferences to avoid loops
       const isDifferent = Object.keys(opacities).some(
         key => opacities[key] !== preferences.opacities?.[key]
       );
       if (isDifferent) {
         updatePreferences({ opacities }).catch(err => {
           console.error("Failed to persist environmental opacity preference:", err);
         });
       }
    }
  }, [opacities, preferences, updatePreferences]);

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
