import React from 'react';
import { cn } from '@/src/lib/utils';
import { WifiOff, HardDriveDownload } from 'lucide-react';

interface DataFreshnessPillProps {
  isLive?: boolean;
  className?: string;
  lastUpdated?: Date;
  status?: string;
}

export const DataFreshnessPill: React.FC<DataFreshnessPillProps> = ({ isLive = false, className, lastUpdated, status }) => {
  if (status === 'simulated') {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700", className)}>
        <WifiOff className="h-3 w-3" />
        Simulated Data
      </span>
    );
  }

  if (!isLive) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-100 text-surface-500", className)}>
        <WifiOff className="h-3 w-3" />
        Not Yet Connected
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700", className)}>
      <HardDriveDownload className="h-3 w-3" />
      {lastUpdated ? `Live - Updated ${lastUpdated.toLocaleDateString()}` : 'Live System'}
    </span>
  );
};
