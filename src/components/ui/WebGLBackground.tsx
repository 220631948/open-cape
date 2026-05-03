import React, { useRef, useMemo, useEffect, useState } from 'react';
import { cn } from '@/src/lib/utils';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';

interface WebGLBackgroundProps {
  className?: string;
  scrollYProgress?: any; // optional if passed from outside
}

const Particle = ({ p, smoothProgress }: { p: any, smoothProgress: any }) => {
  const y = useTransform(smoothProgress, [0, 1], [0, p.yMultiplier]);
  return (
    <motion.div
      style={{
         x: `${p.x}vw`,
         top: `${p.top}vh`,
         y
      }}
      className="absolute w-1 h-1 bg-white rounded-full opacity-20 blur-[1px]"
    />
  );
};

export const WebGLBackground = ({ className }: WebGLBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll(); // Fallback if not passed
  const prefersReducedMotion = useReducedMotion();
  
  const [isLowGPU, setIsLowGPU] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const gpuTier = navigator.hardwareConcurrency || 4;
    setIsLowGPU(gpuTier < 4);
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

  const y1 = useTransform(smoothProgress, [0, 1], [0, -300]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, -600]);
  const y3 = useTransform(smoothProgress, [0, 1], [0, -900]);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      top: Math.random() * 200,
      yMultiplier: -(Math.random() * 1500 + 500)
    }));
  }, []);

  if (isMobile || isLowGPU || prefersReducedMotion) {
    return (
      <div 
        className={cn("fixed inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-surface-950 via-surface-900 to-surface-950 z-[-1]", className)}
      >
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz4KPC9zdmc+')] opacity-20" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("fixed inset-0 pointer-events-none overflow-hidden bg-surface-950 z-[-1]", className)}>
       <motion.div
         style={{ y: y1 }}
         className="absolute top-[10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary-900/40 blur-[120px] mix-blend-screen"
         animate={{ 
           scale: [1, 1.2, 1],
           opacity: [0.3, 0.5, 0.3],
           x: [0, 50, 0]
         }}
         transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
       />
       <motion.div
         style={{ y: y2 }}
         className="absolute top-[40%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-emerald-900/30 blur-[120px] mix-blend-screen"
         animate={{ 
           scale: [1, 1.1, 1],
           opacity: [0.2, 0.4, 0.2],
           x: [0, -40, 0]
         }}
         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
       />
       <motion.div
         style={{ y: y3 }}
         className="absolute top-[80%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-rose-900/20 blur-[100px] mix-blend-screen"
         animate={{ 
           scale: [1, 1.3, 1],
           opacity: [0.1, 0.3, 0.1],
           x: [0, 30, 0]
         }}
         transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
       />
       
       {/* High frequency grid moving slightly faster to simulate depth */}
       <motion.div 
         style={{ y: y1 }}
         className="absolute inset-[-100%] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz4KPC9zdmc+')] opacity-30" 
       />
       
       {/* Optional floating dust particles */}
       {particles.map((p, i) => (
         <Particle key={i} p={p} smoothProgress={smoothProgress} />
       ))}
    </div>
  );
};
