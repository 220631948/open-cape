import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ScrollSceneProps {
  totalScenes: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * ScrollScene acts as a master container for a multi-scene scroll experience.
 * It sets the total scrollable height based on the number of scenes.
 */
export const ScrollScene = ({ totalScenes, children, className }: ScrollSceneProps) => {
  return (
    <div 
      className={cn("relative w-full", className)} 
      style={{ height: `${totalScenes * 100}vh` }}
    >
      {children}
    </div>
  );
};

interface SceneSectionProps {
  index: number;
  totalScenes: number;
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

/**
 * SceneSection is a single 'slide' within a ScrollScene.
 * It stays sticky while the user scrolls through its portion of the container.
 */
export const SceneSection = ({ children, className, animate = true }: SceneSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Track scroll progress specifically for this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Define refined entrance/exit animations
  // 0.0 -> 0.2: Entering from bottom
  // 0.2 -> 0.8: Active in center
  // 0.8 -> 1.0: Exiting to top
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.9, 1, 1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [40, 0, 0, -40]);
  const blur = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"]);

  const animatedStyle = prefersReducedMotion ? { opacity } : { opacity, scale, y, filter: blur };

  return (
    <div 
      ref={sectionRef}
      className={cn(
        "sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pointer-events-none", 
        className
      )}
    >
      <motion.div 
        style={animate ? animatedStyle : {}}
        className="pointer-events-auto w-full select-none"
      >
        {children}
      </motion.div>
    </div>
  );
};
