export interface LayerCapabilities {
  layerId: string;
  supportsFiltering: boolean;
  supportsOffline: boolean;
  supportsBBoxLoading: boolean;
  supportsEditing: boolean;
  geometryType: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon' | 'Raster' | 'Unknown';
  sourceType: 'vector' | 'raster' | 'geojson';
}
