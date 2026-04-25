import { RegistryReferenceContract, CommercialMarketContract } from '../contracts/SourceExtensions';

export const SaDeedsSource: RegistryReferenceContract = {
  id: 'deeds-registration',
  label: 'SA Deeds Registration',
  category: 'authoritative-registry',
  status: 'simulated',
  health: 'healthy',
  
  mapLibreSource: null,
  mapLibreLayers: [],
  
  license: 'Official Registry',
  attribution: 'Department of Agriculture, Land Reform and Rural Development',
  coverage: 'South Africa',
  
  isRenderable: false,
  isQueryable: true,
  
  userMessages: [
    {
      type: 'info',
      text: 'Using simulated fallback integration.'
    }
  ]
};

export const Property24Source: CommercialMarketContract = {
  id: 'property24',
  label: 'Property24 Market Data',
  category: 'commercial-market',
  status: 'simulated',
  health: 'healthy',
  
  mapLibreSource: null,
  mapLibreLayers: [],
  
  license: 'Commercial',
  attribution: 'Property24',
  coverage: 'South Africa',
  
  isRenderable: false,
  isQueryable: true,
  
  userMessages: [
    {
      type: 'info',
      text: 'Using simulated fallback integration.'
    }
  ]
};
