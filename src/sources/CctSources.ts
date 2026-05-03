import { MapSourceContract } from '../contracts/MapSourceContract';

export const CctErfBoundariesSource: MapSourceContract = {
  id: 'erf_boundaries',
  label: 'Cadastral (ERF) Boundaries',
  category: 'cadastre',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: null,
  mapLibreLayers: [],
  
  license: 'Authoritative',
  attribution: 'City of Cape Town',
  coverage: 'Cape Town Metro',
  
  isRenderable: false,
  isQueryable: true,
  
  userMessages: []
};

export const CctZoningSource: MapSourceContract = {
  id: 'zoning_dms',
  label: 'Zoning (DMS base)',
  category: 'zoning',
  status: 'live',
  health: 'healthy',

  mapLibreSource: null,
  mapLibreLayers: [],
  
  license: 'Authoritative',
  attribution: 'City of Cape Town',
  coverage: 'Cape Town Metro',
  
  isRenderable: false,
  isQueryable: true,
  
  userMessages: []
};
