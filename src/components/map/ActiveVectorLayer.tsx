import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useVectorLayer, VECTOR_LAYERS } from '../../hooks/useVectorLayer';
import { Loader2, AlertCircle } from 'lucide-react';

export const ActiveVectorLayer: React.FC<{ layerId: string; opacity?: number }> = ({ layerId, opacity = 1 }) => {
  const config = useMemo(() => VECTOR_LAYERS.find(l => l.id === layerId), [layerId]);
  const { data, loading, error } = useVectorLayer(config, true);

  const validFeatures = useMemo(() => {
    if (!data?.features) return [];
    return data.features.filter((f: any) => {
      // Must have valid geometry
      if (!f.geometry || !f.geometry.coordinates) return false;

      // Remove ArcGIS placeholder/extent footprint square
      if (f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon') {
         const coords = f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates[0];
         if (coords?.[0] && coords[0].length === 5) {
            const ring = coords[0];
            const [p1, p2, p3, p4] = ring;
            // Check if it's an axis-aligned rectangle (often used as an extent placeholder)
            const isRect = 
               (p1[0] === p2[0] && p2[1] === p3[1] && p3[0] === p4[0] && p4[1] === p1[1]) ||
               (p1[1] === p2[1] && p2[0] === p3[0] && p3[1] === p4[1] && p4[0] === p1[0]);
            
            if (isRect) {
               const width = Math.abs(p1[0] - p3[0]);
               const height = Math.abs(p1[1] - p3[1]);
               // If it's larger than a typical building or parcel, it's a placeholder
               if (width > 0.01 && height > 0.01) {
                   return false;
               }
            }
         }
      }

      // Check required attributes: if it only has structural/system attributes, it's considered empty
      const propKeys = Object.keys(f.properties || {}).filter(k => 
         !['OBJECTID', 'objectid', 'id', 'Shape_Length', 'Shape_Area', 'Shape__Area', 'Shape__Length', '_osint', 'isOverrideLine', 'isGhostPoint', 'isVerified'].includes(k)
      );
      
      if (propKeys.length === 0) {
         return false;
      }

      return true;
    });
  }, [data]);

  if (!config) return null;
  
  if (loading && (!data || !data.features || data.features.length === 0)) {
    return (
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white border border-surface-200 px-4 py-2 rounded-full shadow-lg z-[100] text-sm font-medium text-surface-700 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500 shrink-0" />
        Loading {config.name}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-lg shadow-lg z-[100] text-sm font-medium text-rose-700 flex items-center gap-2 max-w-sm">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <span className="truncate">Failed to load {config.name}: {error}</span>
      </div>
    );
  }

  if (!validFeatures || validFeatures.length === 0) {
    return null;
  }

  const processedData = {
    ...data,
    features: validFeatures
  };

  const isPolygon = validFeatures[0]?.geometry?.type?.includes('Polygon');

  if (isPolygon) {
      const fillPaint = {
          'fill-color': config.color || 'transparent',
          'fill-opacity': config.fillOpacity !== undefined ? config.fillOpacity * opacity : opacity * 0.4,
          'fill-outline-color': config.outlineColor || config.color
      };

      return (
        <Source id={`src-${layerId}`} type="geojson" data={processedData}>
          <Layer 
            id={`layer-${layerId}-fill`} 
            type="fill" 
            minzoom={config.minzoom}
            maxzoom={config.maxzoom}
            paint={fillPaint} 
          />
          {config.outlineWidth && (
             <Layer
                id={`layer-${layerId}-line`}
                type="line"
                minzoom={config.minzoom}
                maxzoom={config.maxzoom}
                paint={{
                   'line-color': config.outlineColor || config.color,
                   'line-width': config.outlineWidth,
                   'line-opacity': opacity
                }}
             />
          )}
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
    <Source 
      id={`src-${layerId}`} 
      type="geojson" 
      data={processedData}
      cluster={!isPolygon}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      <Layer 
        id={`layer-${layerId}-lines`} 
        type="line" 
        minzoom={config.minzoom}
        maxzoom={config.maxzoom}
        filter={['==', ['get', 'isOverrideLine'], true]}
        paint={{
          'line-color': '#f59e0b', // amber-500
          'line-width': 2,
          'line-dasharray': [2, 2]
        }} 
      />
      {/* Clustered Points Layer */}
      <Layer
        id={`layer-${layerId}-clusters`}
        type="circle"
        source={`src-${layerId}`}
        filter={['has', 'point_count']}
        paint={{
          'circle-color': [
            'step',
            ['get', 'point_count'],
            config.color,
            100, // at 100 features, use slightly darker
            '#4F46E5', 
            750,
            '#312E81'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            100,
            20,
            750,
            24
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': opacity
        }}
      />
      
      {/* Cluster Count Layer */}
      <Layer
        id={`layer-${layerId}-cluster-count`}
        type="symbol"
        source={`src-${layerId}`}
        filter={['has', 'point_count']}
        layout={{
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }}
        paint={{
          'text-color': '#ffffff'
        }}
      />

      {/* Unclustered Points Layer */}
      <Layer 
        id={`layer-${layerId}`} 
        type="circle" 
        minzoom={config.minzoom}
        maxzoom={config.maxzoom}
        filter={['all', ['!', ['has', 'point_count']], ['!=', ['get', 'isOverrideLine'], true]]}
        paint={pointPaint} 
      />
    </Source>
  );
};
