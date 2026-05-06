import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useProjectHeatmap } from '@/hooks/useProjectHeatmap';

interface ProjectPulseLayerProps {
  projectId?: string;
  visible?: boolean;
}

export const ProjectPulseLayer: React.FC<ProjectPulseLayerProps> = ({ 
  projectId, 
  visible = true 
}) => {
  const { heatmapData, isLoading } = useProjectHeatmap(projectId);
  
  if (!visible || isLoading || heatmapData.features.length === 0) {
    return null;
  }

  return (
    <Source type="geojson" data={heatmapData}>
      {/* Heatmap Layer */}
      <Layer
        id="project-pulse-heat"
        type="heatmap"
        paint={{
          // Increase the heatmap weight based on frequency and property density
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0,
            1, 1
          ],
          // Increase the heatmap color weight weight by zoom level
          // heatmap-intensity is a multiplier on top of heatmap-weight
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3
          ],
          // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
          // Beginning color (0) must be transparent.
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          // Adjust the heatmap radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20
          ],
          // Transition from heatmap to circle layer by zoom level
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0.5
          ],
        }}
      />

      {/* Point Layer (visible at high zooms) */}
      <Layer
        id="project-pulse-point"
        type="circle"
        paint={{
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            16, 5
          ],
          'circle-color': [
            'match',
            ['get', 'type'],
            'drawing', '#f43f5e',
            'annotation', '#fbbf24',
            '#ccc'
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0,
            15, 1
          ],
          'circle-stroke-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12, 0,
            15, 1
          ],
        }}
      />
    </Source>
  );
};
