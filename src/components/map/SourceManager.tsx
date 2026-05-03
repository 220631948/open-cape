import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { MapSourceContract } from '../../contracts/MapSourceContract';

interface SourceManagerProps {
  sources: MapSourceContract[];
  activeLayerIds: string[];
  layerOpacities?: Record<string, number>;
}

export const SourceManager: React.FC<SourceManagerProps> = ({ sources, activeLayerIds, layerOpacities = {} }) => {
  return (
    <>
      {sources.map(source => {
        // Only render if we have a valid MapLibre source definition
        if (!source.mapLibreSource) return null;

        return (
          <Source key={source.id} id={source.id} {...source.mapLibreSource}>
            {source.isRenderable && source.mapLibreLayers.map(layer => {
              if (activeLayerIds.includes(source.id)) {
                 const opacity = layerOpacities[source.id] ?? 1;
                 const typeOpacityKey = 
                    layer.type === 'raster' ? 'raster-opacity' :
                    layer.type === 'fill' ? 'fill-opacity' :
                    layer.type === 'line' ? 'line-opacity' :
                    layer.type === 'circle' ? 'circle-opacity' :
                    layer.type === 'symbol' ? 'icon-opacity' : null;

                 const updatedPaint = { ...layer.paint };
                 if (typeOpacityKey && opacity !== 1) {
                    updatedPaint[typeOpacityKey as keyof typeof updatedPaint] = opacity;
                 }

                 return <Layer key={layer.id} {...layer} paint={updatedPaint} />;
              }
              return null;
            })}
          </Source>
        );
      })}
    </>
  );
};
