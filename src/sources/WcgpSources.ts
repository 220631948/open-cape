import { MapSourceContract } from '../contracts/MapSourceContract';

export const WcgpCadastreSource: MapSourceContract = {
  id: 'wcgp-cadastre',
  label: 'Western Cape Cadastre',
  category: 'cadastre',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'vector',
    tiles: [
      'https://maptiles.westerncape.gov.za/services/Cadastre/MapServer/tile/{z}/{y}/{x}.pbf'
    ],
    minzoom: 12,
    maxzoom: 20
  },
  
  mapLibreLayers: [
    {
      id: 'wcgp-cadastre-fill',
      type: 'fill',
      source: 'wcgp-cadastre',
      'source-layer': 'Western Cape Cadastre',
      paint: {
        'fill-color': 'rgba(255, 255, 255, 0)',
        'fill-outline-color': 'rgba(100, 116, 139, 0.4)'
      }
    },
    {
      id: 'wcgp-cadastre-line',
      type: 'line',
      source: 'wcgp-cadastre',
      'source-layer': 'Western Cape Cadastre',
      paint: {
        'line-color': 'rgba(100, 116, 139, 0.8)',
        'line-width': 1
      }
    }
  ],
  
  license: 'Western Cape Open Data License',
  attribution: 'Western Cape Department of Agriculture',
  coverage: 'Western Cape Province',
  
  isRenderable: true,
  isQueryable: true,
  
  userMessages: [
    {
      type: 'info',
      text: 'Province-wide cadastral boundaries.'
    }
  ]
};

export const WcgpZoningSource: MapSourceContract = {
  id: 'wcgp-zoning',
  label: 'Western Cape Zoning',
  category: 'zoning',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/Land_Parcel_Zoning/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&format=png32&transparent=true&f=image'
    ],
    tileSize: 256
  },
  
  mapLibreLayers: [
    {
      id: 'wcgp-zoning-raster',
      type: 'raster',
      source: 'wcgp-zoning',
      paint: {
        'raster-opacity': 0.6
      }
    }
  ],
  
  license: 'Western Cape Open Data License',
  attribution: 'Western Cape Department of Environmental Affairs and Development Planning',
  coverage: 'Western Cape Province',
  
  isRenderable: true,
  isQueryable: true,
  
  userMessages: [
    {
      type: 'info',
      text: 'Province-wide zoning information.'
    }
  ]
};

export const WcgpTopoSource: MapSourceContract = {
  id: 'wcgp-topo',
  label: 'Western Cape Topographic Map',
  category: 'open-contextual',
  status: 'live',
  health: 'healthy',
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/Elevation/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&format=png32&transparent=true&f=image'
    ],
    tileSize: 256,
    attribution: 'Western Cape Government'
  },
  mapLibreLayers: [
    {
      id: 'wcgp-topo-raster',
      type: 'raster',
      source: 'wcgp-topo',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'raster-opacity': 1.0
      }
    }
  ],
  license: 'Western Cape Open Data License',
  attribution: 'Western Cape Government',
  coverage: 'Western Cape Province',
  isRenderable: true,
  isQueryable: false,
  userMessages: []
};

export const WcgpAerialSource: MapSourceContract = {
  id: 'wcgp-aerial',
  label: 'Western Cape Aerial Imagery',
  category: 'analytical-imagery',
  status: 'live',
  health: 'healthy',
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/NGI_AerialPhtography_ImageDate/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&format=png32&transparent=true&f=image'
    ],
    tileSize: 256,
    attribution: 'Western Cape Government'
  },
  mapLibreLayers: [
    {
      id: 'wcgp-aerial-raster',
      type: 'raster',
      source: 'wcgp-aerial',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'raster-opacity': 1.0
      }
    }
  ],
  license: 'Western Cape Open Data License',
  attribution: 'Western Cape Government',
  coverage: 'Western Cape Province',
  isRenderable: true,
  isQueryable: false,
  userMessages: []
};

export const WcgpAdminBoundariesSource: MapSourceContract = {
  id: 'wcgp-admin-boundaries',
  label: 'Western Cape Administrative Boundaries',
  category: 'open-contextual',
  status: 'live',
  health: 'healthy',
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/AfriGIS_MainAdminBoundaries/MapServer/export?bbox={bbox-epsg-3857}&bboxSR=3857&layers=show:0&size=256,256&format=png32&transparent=true&f=image'
    ],
    tileSize: 256,
    attribution: 'Western Cape Government'
  },
  mapLibreLayers: [
    {
      id: 'wcgp-admin-boundaries-raster',
      type: 'raster',
      source: 'wcgp-admin-boundaries',
      layout: {
        visibility: 'visible'
      },
      paint: {
        'raster-opacity': 1.0
      }
    }
  ],
  license: 'Western Cape Open Data License',
  attribution: 'Western Cape Government',
  coverage: 'Western Cape Province',
  isRenderable: true,
  isQueryable: false,
  userMessages: []
};

export const OsmGeofabrikSaSource: MapSourceContract = {
  id: 'osm_geofabrik_sa',
  label: 'Geofabrik SA Extract (OSM)',
  category: 'open-contextual',
  status: 'live',
  health: 'healthy',
  
  mapLibreSource: {
    type: 'raster',
    tiles: [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],
    tileSize: 256
  },
  
  mapLibreLayers: [
    {
      id: 'osm_geofabrik_sa_raster',
      type: 'raster',
      source: 'osm_geofabrik_sa',
      paint: {
        'raster-opacity': 0.7
      }
    }
  ],
  
  license: 'ODbL',
  attribution: 'OpenStreetMap contributors',
  coverage: 'South Africa',
  
  isRenderable: true,
  isQueryable: false,
  
  userMessages: [
    {
      type: 'info',
      text: 'General contextual map data for the entire region.'
    }
  ]
};
