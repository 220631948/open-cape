import { forwardRef, useImperativeHandle } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl/maplibre';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import {
  SnapPolygonMode,
  SnapPointMode,
  SnapLineMode,
  SnapDirectSelect,
} from 'mapbox-gl-draw-snap-mode';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface DrawControlProps {
  onCreate?: (evt: any) => void;
  onUpdate?: (evt: any) => void;
  onDelete?: (evt: any) => void;
  onSelectionChange?: (evt: any) => void;
  mode?: 'simple_select' | 'direct_select' | 'draw_point' | 'draw_line_string' | 'draw_polygon' | 'draw_rectangle';
  controls?: {
    point?: boolean;
    line_string?: boolean;
    polygon?: boolean;
    trash?: boolean;
    combine_features?: boolean;
    uncombine_features?: boolean;
  };
}

export const DrawControl = forwardRef<MapboxDraw, DrawControlProps>((props, ref) => {
  const draw = useControl<any>(
    () => {
      const activeStyles = MapboxDraw.lib.theme.map((style: any) => {
        // Apply user-defined properties for INACTIVE features
        if (style.id.includes('inactive') && style.type === 'line') {
            return {
                ...style,
                filter: [...(style.filter || []), ['!=', 'user_isSnapGuide', 'true']],
                paint: {
                    ...style.paint,
                    'line-color': ['coalesce', ['get', 'user_stroke'], style.paint['line-color']],
                    'line-width': ['coalesce', ['get', 'user_strokeWidth'], style.paint['line-width']]
                }
            };
        }
        if (style.id.includes('inactive') && style.type === 'fill') {
            return {
                ...style,
                paint: {
                    ...style.paint,
                    'fill-color': ['coalesce', ['get', 'user_fill'], style.paint['fill-color']],
                    'fill-opacity': ['coalesce', ['get', 'user_fillOpacity'], style.paint['fill-opacity']]
                }
            };
        }
        if (style.id.includes('inactive') && style.type === 'circle') {
            return {
                ...style,
                paint: {
                    ...style.paint,
                    'circle-color': ['coalesce', ['get', 'user_fill'], style.paint['circle-color']],
                    'circle-radius': ['+', 3, ['coalesce', ['get', 'user_strokeWidth'], 4]],
                    'circle-stroke-color': ['coalesce', ['get', 'user_stroke'], style.paint['circle-stroke-color']],
                    'circle-stroke-width': 2
                }
            };
        }

        // Highlight active lines and polygon strokes
        if (style.id.includes('active') && style.type === 'line') {

            return {
                ...style,
                paint: {
                    ...style.paint,
                    'line-color': '#f59e0b', // amber-500
                    'line-width': 3,
                    'line-dasharray': [0.2, 2]
                }
            };
        }
        // Highlight active polygon fill
        if (style.id.includes('active') && style.type === 'fill') {
            return {
                ...style,
                paint: {
                    ...style.paint,
                    'fill-color': '#f59e0b',
                    'fill-opacity': 0.3
                }
            };
        }
        // Highlight active points
        if (style.id.includes('active') && style.type === 'circle') {
            return {
                ...style,
                paint: {
                    ...style.paint,
                    'circle-color': '#f59e0b',
                    'circle-radius': 7,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            };
        }
        return style;
      });

      // Add a symbol layer to render the title as text on the map
      activeStyles.push({
        id: 'gl-draw-annotation',
        type: 'symbol',
        filter: ['all', ['has', 'user_title'], ['!=', 'user_title', 'New Drawing']],
        layout: {
          'text-field': ['get', 'user_title'],
          'text-anchor': 'top',
          'text-offset': [0, 1],
          'text-size': 14,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#FFF',
          'text-halo-width': 2
        }
      });

      activeStyles.push({
        id: "guide",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "user_isSnapGuide", "true"]
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round"
        },
        paint: {
          "line-color": "#c00c00",
          "line-width": 1,
          "line-dasharray": [5, 5]
        }
      });

      return new MapboxDraw({
        displayControlsDefault: false,
        modes: {
          ...MapboxDraw.modes,
          draw_point: SnapPointMode as any,
          draw_polygon: SnapPolygonMode as any,
          draw_line_string: SnapLineMode as any,
          direct_select: SnapDirectSelect as any,
          draw_rectangle: DrawRectangle
        },
        controls: props.controls,
        defaultMode: 'simple_select',
        styles: activeStyles,
        userProperties: true,
        // @ts-expect-error - snapping plugin options
        snap: true,
        snapOptions: {
          snapPx: 15,
          snapToMidPoints: true,
          snapVertexPriorityDistance: 0.0025,
          snapGetFeatures: (map: any, draw: any) => {
            let externalFeatures: any[] = [];
            try {
              const layers = map.getStyle().layers;
              if (!layers) return [];
              
              // Find all dynamic layers (exclude basemap features to prevent extreme lag)
              const interactiveLayers = layers
                .filter((l: any) => l.id.startsWith('layer-'))
                .map((l: any) => l.id);

              if (interactiveLayers.length > 0) {
                externalFeatures = map.queryRenderedFeatures({
                  layers: interactiveLayers
                }).map((f: any) => ({
                  type: 'Feature',
                  geometry: f.geometry,
                  properties: f.properties || {}
                }));
              }
            } catch {
              // Layers might not be visible or loaded yet
            }
            return [...externalFeatures, ...draw.getAll().features];
          }
        },
        guides: true,
      });
    },
    ({ map }) => {
      map.on('draw.create', props.onCreate || (() => {}));
      map.on('draw.update', props.onUpdate || (() => {}));
      map.on('draw.delete', props.onDelete || (() => {}));
      map.on('draw.selectionchange', props.onSelectionChange || (() => {}));
    },
    ({ map }) => {
      map.off('draw.create', props.onCreate || (() => {}));
      map.off('draw.update', props.onUpdate || (() => {}));
      map.off('draw.delete', props.onDelete || (() => {}));
      map.off('draw.selectionchange', props.onSelectionChange || (() => {}));
    },
    {
      position: 'top-left'
    }
  );

  useImperativeHandle(ref, () => draw as unknown as MapboxDraw, [draw]);

  return null;
});

DrawControl.displayName = "DrawControl";
