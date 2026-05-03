import { LayerCapabilities } from '../types/LayerCapabilities';

export const layerCapabilityRegistry: LayerCapabilities[] = [
  {
    layerId: 'erf_boundaries',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: true,
    geometryType: 'Polygon',
    sourceType: 'vector'
  },
  {
    layerId: 'zoning_dms',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Polygon',
    sourceType: 'vector'
  },
  {
    layerId: 'wcgp-cadastre-vector',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: true,
    geometryType: 'Polygon',
    sourceType: 'vector'
  },
  {
    layerId: 'wcgp-zoning-vector',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Polygon',
    sourceType: 'vector'
  },
  {
    layerId: 'schools',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Point',
    sourceType: 'vector'
  },
  {
    layerId: 'health_care',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Point',
    sourceType: 'vector'
  },
  {
    layerId: 'train_stations',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Point',
    sourceType: 'vector'
  },
  {
    layerId: 'libraries',
    supportsFiltering: true,
    supportsOffline: true,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Point',
    sourceType: 'vector'
  },
  {
    layerId: 'ee_ndvi',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  },
  {
    layerId: 'ee_landcover',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  },
  {
    layerId: 'ee_water',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  },
  {
    layerId: 'ee_flood_indicator',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  },
  {
    layerId: 'ee_lst',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  },
  {
    layerId: 'ee_elevation',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  },
  {
    layerId: 'ee_slope',
    supportsFiltering: false,
    supportsOffline: false,
    supportsBBoxLoading: true,
    supportsEditing: false,
    geometryType: 'Raster',
    sourceType: 'raster'
  }
];

export function getLayerCapabilities(layerId: string): LayerCapabilities | undefined {
  return layerCapabilityRegistry.find(c => c.layerId === layerId);
}
