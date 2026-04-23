import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-surface-50 cursor-pointer",
          {
            // Variants
            "bg-surface-900 text-white hover:bg-surface-800 shadow-sm": variant === 'primary',
            "bg-surface-100 text-surface-900 hover:bg-surface-200": variant === 'secondary',
            "hover:bg-surface-100 text-surface-600 hover:text-surface-900": variant === 'ghost',
            "border border-surface-200 bg-white hover:bg-surface-50 text-surface-900": variant === 'outline',
            "bg-red-600 text-white hover:bg-red-700 shadow-sm": variant === 'destructive',
            // Sizes
            "h-8 px-3 text-sm": size === 'sm',
            "h-10 py-2 px-4": size === 'md',
            "h-12 px-8 text-lg": size === 'lg',
            "h-10 w-10": size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
