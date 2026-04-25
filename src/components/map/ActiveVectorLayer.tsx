import React, { useMemo } from 'react';
import { Source, Layer, LayerProps } from 'react-map-gl/maplibre';
import { useVectorLayer, VECTOR_LAYERS } from '../../hooks/useVectorLayer';

export const ActiveVectorLayer: React.FC<{ layerId: string; opacity?: number }> = ({ layerId, opacity = 1 }) => {
  const config = useMemo(() => VECTOR_LAYERS.find(l => l.id === layerId), [layerId]);
  const { data, loading, error } = useVectorLayer(config, true);

  if (!config) return null;
  
  if (loading || error || !data) {
    // Optionally render a loading state or handle error
    return null;
  }

  // Create layer props based on points
  let paint: any = {
    'circle-color': config.color,
    'circle-radius': 5,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': opacity
  };

  const isPolygon = data.features?.[0]?.geometry?.type?.includes('Polygon');

  if (isPolygon) {
      paint = {
          'fill-color': config.color,
          'fill-opacity': opacity * 0.4,
          'fill-outline-color': config.color
      };
      return (
        <Source id={`src-${layerId}`} type="geojson" data={data}>
          <Layer 
            id={`layer-${layerId}`} 
            type="fill" 
            paint={paint} 
          />
        </Source>
      );
  }

  const pointPaint: any = {
    'circle-color': [
      'case',
      ['==', ['get', 'isGhostPoint'], true], '#9ca3af', // gray-400 for ghosts
      ['==', ['get', 'isVerified'], true], '#10b981', // emerald-500 for overriden
      config.color
    ],
    'circle-radius': [
      'case',
      ['==', ['get', 'isGhostPoint'], true], 3,
      ['==', ['get', 'isVerified'], true], 6,
      5
    ],
    'circle-stroke-width': 1,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': [
      'case',
      ['==', ['get', 'isGhostPoint'], true], opacity * 0.5,
      opacity
    ]
  };

  return (
    <Source id={`src-${layerId}`} type="geojson" data={data}>
      <Layer 
        id={`layer-${layerId}-lines`} 
        type="line" 
        filter={['==', ['get', 'isOverrideLine'], true]}
        paint={{
          'line-color': '#f59e0b', // amber-500
          'line-width': 2,
          'line-dasharray': [2, 2]
        }} 
      />
      <Layer 
        id={`layer-${layerId}`} 
        type="circle" 
        filter={['!=', ['get', 'isOverrideLine'], true]}
        paint={pointPaint} 
      />
    </Source>
  );
};
