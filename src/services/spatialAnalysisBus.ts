import * as turf from '@turf/turf';

export interface SpatialQueryResult {
  category: string;
  count: number;
  features: any[];
}

/**
 * Queries local map features within a radius
 */
export function queryNearbyFeatures(
  center: [number, number],
  radiusInMeters: number,
  allFeatures: any[]
): SpatialQueryResult[] {
  const centerPoint = turf.point(center);
  const radiusInKm = radiusInMeters / 1000;
  
  const categories: Record<string, any[]> = {};

  allFeatures.forEach(feature => {
    try {
      let featurePoint;
      if (feature.geometry.type === 'Point') {
        featurePoint = feature;
      } else {
        featurePoint = turf.centroid(feature);
      }

      const distance = turf.distance(centerPoint, featurePoint);
      
      if (distance <= radiusInKm) {
        const cat = feature.properties?.category || feature.layer?.id || 'General';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(feature);
      }
    } catch (e) {
      // Skip invalid geometries
    }
  });

  return Object.entries(categories).map(([category, features]) => ({
    category,
    count: features.length,
    features
  }));
}

/**
 * Generates a GeoJSON buffer circle
 */
export function getBufferPolygon(center: [number, number], radiusInMeters: number) {
  return turf.buffer(turf.point(center), radiusInMeters, { units: 'meters' });
}
