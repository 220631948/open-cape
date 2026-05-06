import React from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from 'motion/react';

interface SkeletonBlockProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  lines?: number;
}

export const SkeletonBlock = ({ 
  className, 
  width, 
  height, 
  rounded = 'md',
  lines = 0
}: SkeletonBlockProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  const baseClasses = cn(
    "bg-surface-800", 
    !prefersReducedMotion && "animate-pulse",
    {
      'rounded-sm': rounded === 'sm',
      'rounded-md': rounded === 'md',
      'rounded-lg': rounded === 'lg',
      'rounded-full': rounded === 'full',
    },
    className
  );

  const style = { width, height };

  if (lines > 0) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(baseClasses, "h-4", i === lines - 1 ? "w-2/3" : "w-full")}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={style}
    />
  );
};
