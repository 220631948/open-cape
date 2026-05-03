import { MapSourceContract } from '../contracts/MapSourceContract';

export const FloodRiskSource: MapSourceContract = {
  id: 'flood-risk',
  label: 'Composite Flood Hazard Areas',
  category: 'analytical-imagery',
  status: 'failed',
  health: 'offline',
  isRenderable: false,
  isQueryable: false,
  license: 'CC-BY-4.0',
  attribution: 'City of Cape Town / WCG',
  coverage: 'Western Cape',
  userMessages: [
    { type: 'info', text: 'Indicative mapping of flood hazard/precautionary zones.' }
  ],
  mapLibreSource: {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] } // Real implementation would connect to WFS/FeatureServer
  },
  mapLibreLayers: [
    {
      id: 'flood-risk-fill',
      type: 'fill',
      source: 'flood-risk',
      paint: {
        'fill-color': '#0ea5e9',
        'fill-opacity': 0.3
      }
    },
    {
      id: 'flood-risk-line',
      type: 'line',
      source: 'flood-risk',
      paint: {
        'line-color': '#0369a1',
        'line-width': 1,
        'line-dasharray': [2, 2]
      }
    }
  ]
};

export const ComplianceRiskSource: MapSourceContract = {
  id: 'compliance-risk',
  label: 'Zoning & Planning Overlays',
  category: 'analytical-imagery',
  status: 'failed',
  health: 'offline',
  isRenderable: false,
  isQueryable: false,
  license: 'CC-BY-4.0',
  attribution: 'City of Cape Town',
  coverage: 'Western Cape',
  userMessages: [
    { type: 'info', text: 'Precautionary and non-compliance risk indicators.' }
  ],
  mapLibreSource: {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  },
  mapLibreLayers: [
    {
      id: 'compliance-risk-fill',
      type: 'fill',
      source: 'compliance-risk',
      paint: {
        'fill-color': '#f43f5e',
        'fill-opacity': 0.2
      }
    }
  ]
};
