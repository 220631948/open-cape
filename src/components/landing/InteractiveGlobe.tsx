import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useSpring } from 'react-spring';

export const InteractiveGlobe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<{ x: number, y: number } | null>(null);
  const pointerInteractionMovement = useRef({ x: 0, y: 0 });
  const [{ r }, api] = useSpring(() => ({
    r: [0, 0],
    config: {
      mass: 1,
      tension: 280,
      friction: 40,
      precision: 0.001,
    },
  }));

  useEffect(() => {
    // Correct angle calculation for cobe to center on Cape Town
    const lat = -33.9249;
    const lon = 18.4241;
    const centerPhi = Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2);
    const centerTheta = (lat * Math.PI) / 180;
    
    let width = 0;
    let currentPhi = centerPhi;
    const currentTheta = centerTheta;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: currentPhi,
      theta: currentTheta, 
      dark: 1,
      diffuse: 1.2,
      mapSamples: 24000,
      mapBrightness: 4,
      baseColor: [0.1, 0.1, 0.2], 
      markerColor: [0.1, 0.8, 0.5], 
      glowColor: [0.2, 0.2, 0.4],
      markers: [
        { location: [-33.9249, 18.4241], size: 0.15 } // Cape Town
      ],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          // Subtle auto-rotation
          currentPhi -= 0.003;
        }
        const [rx, ry] = r.get();
        state.phi = currentPhi + rx;
        
        // Clamp Theta to prevent flipping over
        const nextTheta = currentTheta + ry;
        state.theta = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, nextTheta));
        
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="w-full flex justify-center items-center overflow-visible">
      <div className="w-full max-w-[600px] aspect-square relative cursor-grab active:cursor-grabbing scale-125 sm:scale-150 origin-center transition-transform duration-1000">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-full"
          onPointerDown={(e) => {
            pointerInteracting.current = {
              x: e.clientX - pointerInteractionMovement.current.x,
              y: e.clientY - pointerInteractionMovement.current.y
            };
            canvasRef.current!.style.cursor = 'grabbing';
          }}
          onPointerUp={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            pointerInteracting.current = null;
            canvasRef.current!.style.cursor = 'grab';
          }}
          onMouseMove={(e) => {
            if (pointerInteracting.current) {
              const deltaX = e.clientX - pointerInteracting.current.x;
              const deltaY = e.clientY - pointerInteracting.current.y;
              pointerInteractionMovement.current = { x: deltaX, y: deltaY };
              api.start({
                r: [deltaX / 100, deltaY / 100],
              });
            }
          }}
          onTouchMove={(e) => {
            if (pointerInteracting.current && e.touches[0]) {
              const deltaX = e.touches[0].clientX - pointerInteracting.current.x;
              const deltaY = e.touches[0].clientY - pointerInteracting.current.y;
              pointerInteractionMovement.current = { x: deltaX, y: deltaY };
              api.start({
                r: [deltaX / 100, deltaY / 100],
              });
            }
          }}
        />
        <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      </div>
    </div>
  );
};
