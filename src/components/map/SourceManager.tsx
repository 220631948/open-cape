import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { MapSourceContract } from '../../contracts/MapSourceContract';

interface SourceManagerProps {
  sources: MapSourceContract[];
  activeLayerIds: string[];
}

export const SourceManager: React.FC<SourceManagerProps> = ({ sources, activeLayerIds }) => {
  return (
    <>
      {sources.map(source => {
        // Only render if we have a valid MapLibre source definition
        if (!source.mapLibreSource) return null;

        return (
          <Source key={source.id} id={source.id} {...source.mapLibreSource}>
            {source.isRenderable && source.mapLibreLayers.map(layer => {
              // Note: We could add logic here to filter layers based on activeLayerIds 
              // if the contract defined multiple sub-layers.
              // For now we assume if the source is active, its layers should be rendered.
              if (activeLayerIds.includes(source.id)) {
                 return <Layer key={layer.id} {...layer} />;
              }
              return null;
            })}
          </Source>
        );
      })}
    </>
  );
};
