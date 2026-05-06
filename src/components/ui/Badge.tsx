import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success';
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-surface-400 focus:ring-offset-2",
        {
          "border-transparent bg-surface-900 text-surface-50 hover:bg-surface-900/80": variant === 'default',
          "border-transparent bg-surface-100 text-surface-900 hover:bg-surface-100/80": variant === 'secondary',
          "border-surface-200 text-surface-950": variant === 'outline',
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200": variant === 'destructive',
          "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-200": variant === 'success',
        },
        className
      )}
      {...props}
    />
  );
}
