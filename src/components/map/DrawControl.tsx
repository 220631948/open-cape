import { forwardRef, useImperativeHandle } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl/maplibre';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface DrawControlProps {
  onCreate?: (evt: any) => void;
  onUpdate?: (evt: any) => void;
  onDelete?: (evt: any) => void;
  onSelectionChange?: (evt: any) => void;
  mode?: 'simple_select' | 'direct_select' | 'draw_point' | 'draw_line_string' | 'draw_polygon';
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

      return new MapboxDraw({
        displayControlsDefault: false,
        controls: props.controls,
        defaultMode: 'simple_select',
        styles: activeStyles,
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
