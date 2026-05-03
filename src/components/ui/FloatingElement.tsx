import React from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

interface FloatingElementProps {
  children: React.ReactNode;
  depth?: number; // 0 (front) to 1 (far back)
  className?: string;
  speed?: number; // speed multiplier for scroll parallax
  floatOffset?: number; // float duration offset
}

export const FloatingElement = ({ children, depth = 0.5, className, speed = 1, floatOffset = 0 }: FloatingElementProps) => {
  const { scrollYProgress } = useScroll();
  
  // Depth determines scale, opacity, and base parallax
  const scale = 1 - depth * 0.5; // Farther objects are smaller
  const baseOpacity = 1 - depth * 0.6; // Farther objects are fainter
  
  // Determine movement range based on depth and speed
  const yMove = useTransform(scrollYProgress, [0, 1], [0, speed * -(500 + depth * 1000)]);
  const smoothY = useSpring(yMove, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ y: smoothY }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{
          y: ["-3%", "3%"],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 4 + floatOffset,
          ease: "easeInOut"
        }}
        style={{
          scale,
          opacity: baseOpacity,
          filter: `blur(${depth * 4}px)`,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
