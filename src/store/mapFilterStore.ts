import { useSyncExternalStore } from 'react';

type StoreType = {
  selectedMunicipality: string | null;
  availableMunicipalities: string[];
  isLoading: boolean;
};

let state: StoreType = {
  selectedMunicipality: null,
  availableMunicipalities: [],
  isLoading: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export const mapFilterStore = {
  getState: () => state,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setMunicipality: (municipality: string | null) => {
    state = { ...state, selectedMunicipality: municipality };
    listeners.forEach(l => l());
  },
  clearMunicipality: () => {
    state = { ...state, selectedMunicipality: null };
    listeners.forEach(l => l());
  },
  fetchMunicipalities: async () => {
    if (state.availableMunicipalities.length > 0 || state.isLoading) return;
    
    state = { ...state, isLoading: true };
    listeners.forEach(l => l());

    try {
      const response = await fetch('https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/2/query?where=1%3D1&outFields=MUNICNAME&returnGeometry=false&returnDistinctValues=true&orderByFields=MUNICNAME&f=json');
      const data = await response.json();
      const municipalities = data.features?.map((f: any) => f.attributes?.MUNICNAME).filter(Boolean) || [];
      
      state = { 
        ...state, 
        availableMunicipalities: municipalities.length > 0 ? municipalities : ['City of Cape Town'],
        isLoading: false 
      };
    } catch (e) {
      console.error('Failed to fetch live municipalities', e);
      state = { ...state, isLoading: false, availableMunicipalities: [] };
    }
    listeners.forEach(l => l());
  }
};

export function useMapFilterStore() {
  return useSyncExternalStore(mapFilterStore.subscribe, mapFilterStore.getState);
}
