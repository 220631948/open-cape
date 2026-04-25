import { MapSourceContract } from '../contracts/MapSourceContract';

export const CctErfBoundariesSource: MapSourceContract = {
  id: 'erf_boundaries',
  label: 'Cadastral (ERF) Boundaries',
  category: 'cadastre',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'raster',
    tiles: ["https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:57&size=256,256&format=png32&transparent=true&f=image"],
    tileSize: 256
  },
  mapLibreLayers: [
    {
      id: 'erf-boundaries-raster-layer',
      type: 'raster',
      source: 'erf_boundaries',
      paint: { "raster-opacity": 0.5 }
    }
  ],
  
  license: 'Authoritative',
  attribution: 'City of Cape Town',
  coverage: 'Cape Town Metro',
  
  isRenderable: true,
  isQueryable: true,
  
  userMessages: []
};

export const CctZoningSource: MapSourceContract = {
  id: 'zoning_dms',
  label: 'Zoning (DMS base)',
  category: 'zoning',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'raster',
    tiles: ["https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:59&size=256,256&format=png32&transparent=true&f=image"],
    tileSize: 256
  },
  mapLibreLayers: [
    {
      id: 'zoning-dms-raster-layer',
      type: 'raster',
      source: 'zoning_dms',
      paint: { "raster-opacity": 0.5 }
    }
  ],
  
  license: 'Authoritative',
  attribution: 'City of Cape Town',
  coverage: 'Cape Town Metro',
  
  isRenderable: true,
  isQueryable: true,
  
  userMessages: []
};
