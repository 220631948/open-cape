import React, { useEffect } from 'react';
import { useMotionValue, MotionValue } from 'motion/react';
import Map, { Source, Layer, useMap } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/src/lib/utils';

interface MapFlythroughProps {
  className?: string;
  scrollYProgress?: MotionValue<number>;
}

// Controller component to adjust camera based on scroll
const CameraController = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) => {
  const { current: map } = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    return scrollYProgress.onChange((v) => {
      // Create a smooth flythrough effect 
      // Cape Town coordinates roughly
      const centerLng = 18.4232;
      const centerLat = -33.9249;
      
      const zoom = 12 + (v * 2.5); // Zoom in as we scroll
      const pitch = 45 + (v * 20); // Tilt more
      const bearing = v * 60; // Rotate
      
      map.jumpTo({
        center: [centerLng, centerLat],
        zoom,
        pitch,
        bearing,
      });
    });
  }, [map, scrollYProgress]);
  
  return null;
};

export const MapFlythrough = ({ className, scrollYProgress }: MapFlythroughProps) => {
  const proxyScroll = useMotionValue(0);
  const activeScroll = scrollYProgress || proxyScroll;

  return (
    <div className={cn("relative w-full h-[600px] overflow-hidden rounded-xl bg-surface-950 border border-surface-800", className)}>
      <Map
        initialViewState={{
          longitude: 18.4232,
          latitude: -33.9249,
          zoom: 12,
          pitch: 45,
          bearing: 0
        }}
        interactive={false}
        mapStyle={{
          version: 8,
          sources: {},
          layers: [{
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#000000' }
          }]
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Source 
          id="esri-world-imagery" 
          type="raster" 
          tiles={['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']} 
          tileSize={256} 
          maxzoom={19}
        >
          <Layer id="esri-world-imagery-layer" type="raster" paint={{ "raster-opacity": 0.8 }} />
        </Source>
        <CameraController scrollYProgress={activeScroll} />
      </Map>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-surface-950/20 pointer-events-none mix-blend-multiply" />
    </div>
  );
};
