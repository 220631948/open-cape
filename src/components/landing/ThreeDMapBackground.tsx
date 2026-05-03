import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export const ThreeDMapBackground: React.FC<{ className?: string }> = ({ className }) => {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  const mapY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0%", "0%"] : ["0%", "-18%"]);
  const mapScale = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [1.25, 1.25] : [1.25, 1.18]);
  const mapRotateX = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [58, 58] : [58, 64]);
  const mapRotateZ = useTransform(scrollYProgress, [0, 1], [-14, -14]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.4, 0.8, 1], [0.1, 0.6, 0.6, 0.1]);

  return (
    <div className={cn("fixed inset-0 bg-slate-950 overflow-hidden pointer-events-none z-0", className)} aria-hidden="true" style={{ perspective: '1200px' }}>
      {/* Dark radial gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950/80 z-0" />

      {/* Perspective wrapper */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.div 
          className="relative w-[200vw] h-[200vh] sm:w-[150vw] sm:h-[150vh] flex items-center justify-center will-change-transform"
          style={{ 
            rotateX: mapRotateX, 
            rotateZ: mapRotateZ, 
            scale: mapScale, 
            y: mapY,
            transformStyle: "preserve-3d" 
          }}
        >
          {/* GIS Grid */}
          <motion.div 
            style={{ opacity: gridOpacity }}
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]" 
          />
          
          {/* Contour lines (SVG) */}
          <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <style>{`
              @keyframes pulse-glow {
                0% { filter: drop-shadow(0 0 2px rgba(20,184,166,0.2)); opacity: 0.6; }
                50% { filter: drop-shadow(0 0 10px rgba(20,184,166,0.8)); opacity: 1; }
                100% { filter: drop-shadow(0 0 2px rgba(20,184,166,0.2)); opacity: 0.6; }
              }
              .wave-glow {
                animation: pulse-glow 6s infinite ease-in-out;
              }
              @media (prefers-reduced-motion: reduce) {
                .wave-glow { animation: none; filter: drop-shadow(0 0 4px rgba(20,184,166,0.4)); opacity: 0.8; }
              }
            `}</style>
            <path d="M 200 400 Q 300 200 500 300 T 800 200" fill="none" className="stroke-teal-500/40 wave-glow" strokeWidth="2" style={{ animationDelay: '0s' }} />
            <path d="M 150 450 Q 350 250 550 350 T 850 250" fill="none" className="stroke-teal-500/40 wave-glow" strokeWidth="1" style={{ animationDelay: '2s' }} />
            <path d="M 250 350 Q 250 150 450 250 T 750 150" fill="none" className="stroke-teal-500/40 wave-glow" strokeWidth="3" style={{ animationDelay: '4s' }} />
          </svg>

          {/* Table Mountain Silhouette */}
          <motion.svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 1000 1000" 
            preserveAspectRatio="xMidYMid slice"
            style={{ translateZ: 80 }}
          >
            <path 
              d="M 460 415 L 475 390 L 515 390 L 525 415 Z" 
              fill="rgba(16,185,129,0.15)" 
              className="stroke-emerald-400/60 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
          </motion.svg>

          {/* Glowing Route Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: 0; }
              }
              .animated-route {
                stroke-dasharray: 20 10;
                stroke-dashoffset: 1000;
                animation: dash 30s linear infinite;
              }
              @media (prefers-reduced-motion: reduce) {
                .animated-route { animation: none; }
              }
            `}</style>
            <path d="M 400 600 Q 500 500 600 500 T 800 600" fill="none" className="stroke-cyan-400/40 animated-route drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" strokeWidth="4" />
            <path d="M 300 500 Q 400 400 550 450 T 700 700" fill="none" className="stroke-indigo-400/30 animated-route" strokeWidth="2" style={{ animationDuration: '40s' }} />
          </svg>

          {/* Floating elements & markers */}
          <div className="absolute inset-0 pointer-events-none transform-style-3d">
            {/* Cape Town marker */}
            <motion.div animate={shouldReduceMotion ? {} : { y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[45%] left-[45%] translate-z-[50px] drop-shadow-2xl">
              <div className="relative flex items-center justify-center">
                <style>{`
                  @keyframes pulse-ring {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: scale(3); opacity: 0; }
                  }
                  .ring-anim { animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
                  @media (prefers-reduced-motion: reduce) { .ring-anim { animation: none; } }
                `}</style>
                <div className="absolute w-8 h-8 rounded-full border border-cyan-400 ring-anim" />
                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,1)]" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Labels directly attached to perspective wrapper (to follow tilt) */}
        <motion.div 
          style={{ rotateX: mapRotateX, rotateZ: mapRotateZ, scale: mapScale, y: mapY, transformStyle: "preserve-3d" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none shadow-none bg-transparent"
        >
            <div className="absolute w-[150vw] h-[150vh]">
              <div className="absolute top-[48%] left-[46%] text-[10px] uppercase tracking-widest text-white/70 font-mono font-bold translate-z-[60px] drop-shadow-md">Cape Town</div>
              <div className="absolute top-[42%] left-[48%] text-[8px] uppercase tracking-widest text-emerald-400/60 font-mono translate-z-[30px]">Table Mountain</div>
              <div className="absolute top-[60%] left-[55%] text-[10px] italic text-blue-300/40 font-serif translate-z-[10px]">False Bay</div>
              <div className="absolute top-[48%] left-[58%] text-[8px] uppercase tracking-widest text-slate-300/50 font-mono">Cape Flats</div>
              <div className="absolute top-[35%] left-[65%] text-[9px] uppercase tracking-widest text-amber-300/40 font-mono">Winelands</div>
              <div className="absolute top-[20%] left-[40%] text-[12px] uppercase tracking-[0.3em] font-bold text-white/20 font-mono">Western Cape</div>
            </div>
        </motion.div>
      </div>

      {/* Floating layer chips (absolute above perspective) */}
      <div className="absolute right-4 md:right-12 top-24 md:top-1/3 flex flex-col gap-4 z-20">
        {["Layer: Transport", "Layer: Public Facilities", "Layer: Environmental Risk", "Layer: Land Use", "Layer: Water Systems"].map((layer, i) => (
            <motion.div 
              key={layer}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-3 py-1.5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full text-[8px] sm:text-[10px] font-mono text-white/60 tracking-widest uppercase shadow-lg shadow-black/50 hidden md:block"
            >
              {layer}
            </motion.div>
        ))}
      </div>

      {/* Coordinate HUD */}
      <div className="absolute left-6 bottom-6 md:left-12 md:bottom-12 z-20 hidden md:block text-white/50 text-xs font-mono tracking-widest">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          33.9249° S, 18.4241° E
        </div>
      </div>

      {/* Depth fog and soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,6,23,0.85)_100%)] z-20 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />
    </div>
  );
};

