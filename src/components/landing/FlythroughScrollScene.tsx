"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, useReducedMotion } from "motion/react";
import { FlyoutPanels } from "./FlyoutPanels";

export const FlythroughScrollScene = ({ children }: { children?: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // tracks window scroll — correct for landing page
  const { scrollYProgress } = useScroll(); 
  const reduceMotion = useReducedMotion();

  // If reduceMotion, collapse all transforms to identity
  const cardY       = useTransform(scrollYProgress, [0, 1], reduceMotion ? ["20%",  "20%"]  : ["20%", "-45%"]);
  const cardOpacity = useTransform(scrollYProgress, [0.05, 0.2, 0.85],     reduceMotion ? [1, 1, 1] : [0, 1, 1]);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden min-h-[50vh]">
      <FlyoutPanels cardY={cardY} cardOpacity={cardOpacity} />
      {children}
    </section>
  );
};
