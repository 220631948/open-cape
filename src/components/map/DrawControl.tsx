import React, { forwardRef, useImperativeHandle } from 'react';
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
        if (style.id === 'gl-draw-lines') {
          return {
            ...style,
            paint: {
               ...style.paint,
               'line-dasharray': [
                 'case',
                 ['==', ['get', 'active'], 'true'],
                 ['literal', [0.2, 2]],
                 ['literal', [2, 0]],
               ],
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
