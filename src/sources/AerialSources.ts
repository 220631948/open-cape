import { AerialImageryContract } from '../contracts/SourceExtensions';

export const OpenAerialMapSource: AerialImageryContract = {
  id: 'openaerialmap',
  label: 'OpenAerialMap Community Index',
  category: 'open-contextual',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://tiles.openaerialmap.org/mosaic/{z}/{x}/{y}.png'
    ],
    tileSize: 256,
    attribution: '© OpenAerialMap contributors'
  },
  mapLibreLayers: [
    {
      id: 'openaerialmap-layer',
      type: 'raster',
      source: 'openaerialmap',
      paint: {
        'raster-opacity': 1
      }
    }
  ],
  
  license: 'CC-BY 4.0',
  attribution: '© OpenAerialMap contributors',
  coverage: 'Global (Patchy)',
  
  isRenderable: true,
  isQueryable: false,
  
  userMessages: []
};

export const NasaGibsSource: AerialImageryContract = {
  id: 'nasa-gibs',
  label: 'NASA GIBS Satellite Imagery',
  category: 'analytical-imagery',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/2022-04-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg'
    ],
    tileSize: 256,
    attribution: '© NASA Global Imagery Browse Services (GIBS)'
  },
  mapLibreLayers: [
    {
      id: 'nasa-gibs-layer',
      type: 'raster',
      source: 'nasa-gibs',
      paint: {
        'raster-opacity': 1
      }
    }
  ],
  
  license: 'Public Domain',
  attribution: 'NASA GIBS',
  coverage: 'Global',
  
  isRenderable: true,
  isQueryable: false,
  
  userMessages: []
};
