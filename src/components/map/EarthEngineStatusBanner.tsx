import React from 'react';
import { AlertTriangle, Lock, Globe } from 'lucide-react';
import { useEarthEngineAccess } from '@/src/hooks/useEarthEngineAccess';

export const EarthEngineStatusBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { hasAccess, isChecking } = useEarthEngineAccess();

  if (isChecking) {
    return (
      <div className={`p-4 bg-surface-50 border border-surface-200 rounded-lg animate-pulse flex items-start gap-3 ${className}`}>
        <div className="h-5 w-5 bg-surface-200 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-surface-200 rounded w-1/3" />
          <div className="h-3 bg-surface-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className={`p-4 bg-surface-50 border border-surface-200 rounded-lg flex items-start gap-3 ${className}`}>
        <Lock className="h-5 w-5 text-surface-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-surface-900 mb-1">Environmental Intelligence not enabled.</h4>
          <p className="text-xs text-surface-600">
            Sign in with an Earth Engine-enabled Google account to activate environmental layers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Dataset Status</h4>
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          Environmental layers are derived from satellite and remote-sensing analysis. 
          These layers are analytical and do not replace official cadastral, zoning, or planning records.
        </p>
      </div>
    </div>
  );
};
