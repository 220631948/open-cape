import React from 'react';
import { Shield, ShieldAlert, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceRecord } from '@/hooks/useSourceCatalog';

interface SourceBadgeProps {
  source: SourceRecord;
  className?: string;
  showIcon?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className, showIcon = true }) => {
  const isPending = source.verificationStatus === 'pending-integration';
  
  if (source.isPublic && !isPending) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm", className)} title="Authoritative Public Source">
        {showIcon && <Shield className="h-3 w-3" />}
        {source.name}
      </span>
    );
  }

  if (isPending) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200", className)} title="Pending System Integration">
        {showIcon && <ShieldAlert className="h-3 w-3" />}
        {source.name} (Pending)
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200", className)} title="Commercial Source">
      {showIcon && <Server className="h-3 w-3" />}
      {source.name}
    </span>
  );
};

export const PlaceholderSourceBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200", className)} title="Not Live">
    <ShieldAlert className="h-3 w-3" />
    Placeholder
  </span>
);
