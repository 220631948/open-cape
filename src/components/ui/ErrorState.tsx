import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  className,
  title = "Something went wrong",
  description = "We encountered an issue loading this information. Please try again.",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-xl bg-red-50 border border-red-100",
        className
      )}
      {...props}
    >
      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-1">{title}</h3>
      <p className="text-red-700 text-sm max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="destructive" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
