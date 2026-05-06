import { useMemo } from 'react';
import { useAnnotations } from './useAnnotations';
import { useDrawings } from './useDrawings';
import * as turf from '@turf/turf';
import { FeatureCollection, Point, Feature } from 'geojson';

/**
 * Hook to generate a heatmap GeoJSON from project activity (drawings and annotations).
 */
export function useProjectHeatmap(projectId?: string) {
  const { annotations, isLoading: loadingAnnotations } = useAnnotations(projectId);
  const { drawings, isLoading: loadingDrawings } = useDrawings(projectId);

  const heatmapData = useMemo(() => {
    const points: Feature<Point>[] = [];

    // 1. Process Drawings
    drawings.forEach(drawing => {
      if (!drawing.geometry) return;
      
      try {
        let centroid: Feature<Point>;
        
        if (drawing.geometryType === 'Point') {
          centroid = turf.point(drawing.geometry.coordinates);
        } else {
          // Use turf to find centroid of lines or polygons
          centroid = turf.centroid(drawing.geometry);
        }

        if (centroid && centroid.geometry) {
          // Weight the point based on if it's a drawing or has annotations
          points.push(turf.point(centroid.geometry.coordinates, {
            id: drawing.id,
            type: 'drawing',
            weight: 1
          }));
        }
      } catch (e) {
        console.warn('Failed to calculate centroid for drawing heatmap', drawing.id, e);
      }
    });

    // 2. Process Annotations
    // For annotations, we link them to their target's location
    annotations.forEach(annotation => {
      if (annotation.targetType === 'drawing') {
        const linkedDrawing = drawings.find(d => d.id === annotation.targetId);
        if (linkedDrawing && linkedDrawing.geometry) {
          try {
            const centroid = linkedDrawing.geometryType === 'Point' 
              ? turf.point(linkedDrawing.geometry.coordinates)
              : turf.centroid(linkedDrawing.geometry);
            
            points.push(turf.point(centroid.geometry.coordinates, {
              id: annotation.id,
              type: 'annotation',
              weight: 0.5 // Annotations add weight to the 'pulse'
            }));
          } catch(e) {
            console.debug('Heatmap point calculation failed', e);
          }
        }
      }
      // Note: Parcel annotations are skipped for now unless we have parcel centroids loaded
    });

    return turf.featureCollection(points) as FeatureCollection<Point>;
  }, [annotations, drawings]);

  return {
    heatmapData,
    isLoading: loadingAnnotations || loadingDrawings
  };
}
