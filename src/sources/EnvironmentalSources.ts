import { MapSourceContract } from '../contracts/MapSourceContract';

export const EnvironmentalNdviSource: MapSourceContract = {
  id: 'ee_ndvi',
  label: 'Vegetation Index (NDVI)',
  category: 'open-contextual',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'geojson',
    data: { 
      type: 'FeatureCollection', 
      features: [] 
    }
  },
  mapLibreLayers: [
    {
      id: 'ee-ndvi-layer',
      type: 'fill',
      source: 'ee_ndvi',
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.24 // Default (0.8 * 0.3)
      }
    }
  ],
  
  license: 'Open Data',
  attribution: 'Sentinel-2 / Google Earth Engine',
  coverage: 'South Africa',
  
  isRenderable: true,
  isQueryable: false,
  
  userMessages: []
};

// ... others could be added
