import React from 'react';
import { AlertCircle, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConnectionHealth } from '@/contexts/ConnectionHealthContext';
import { ALL_SOURCES } from '@/sources';
import { SchemaValidationResult } from '@/utils/validateVectorTileSchema';

interface DataStatusBannerProps {
  className?: string;
  variant?: 'warning' | 'info' | 'error' | 'success';
  title?: string;
  status?: string; 
  description?: string;
  sourceId?: string; 
  globalAlert?: boolean; 
  activeLayerIds?: string[];
  validationResult?: SchemaValidationResult | null;
}

export const DataStatusBanner: React.FC<DataStatusBannerProps> = ({ 
  className, 
  variant,
  title,
  status,
  description,
  sourceId,
  globalAlert = false,
  activeLayerIds = [],
  validationResult
}) => {
  const { services } = useConnectionHealth();
  
  const source = sourceId ? ALL_SOURCES.find(s => s.id === sourceId) : null;
  const activeVariant = variant || (source?.status === 'failed' ? 'error' : source?.status === 'pending-integration' ? 'warning' : 'info');

  if (validationResult) {
    const { isValid, missingFields } = validationResult;
    const isCompletelyInvalid = missingFields.length === 4; // Assuming 4 required fields

    return (
      <div className={cn("p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2", 
        isValid ? "bg-emerald-50 border-emerald-200 text-emerald-800" : 
        isCompletelyInvalid ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800",
        className
      )}>
        {isValid ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : isCompletelyInvalid ? (
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div>
          <strong className="block mb-0.5 text-current">
            {isValid ? 'Schema Valid' : isCompletelyInvalid ? 'Schema Invalid' : 'Schema Missing Fields'}
          </strong>
          {!isValid && (
            <span className="block mt-0.5 opacity-80">
              Missing required fields: {missingFields.join(', ')}
            </span>
          )}
        </div>
      </div>
    );
  }

  // If source has custom messages, prioritizing them
  if (source && source.userMessages.length > 0) {
    const msg = source.userMessages[0];
    return (
      <div className={cn(
        "flex items-start gap-2 p-3 rounded-lg text-xs leading-relaxed border",
        msg.type === 'error' ? "bg-rose-50 border-rose-200 text-rose-800" :
        msg.type === 'warning' ? "bg-amber-50 border-amber-200 text-amber-800" :
        "bg-blue-50 border-blue-200 text-blue-800",
        className
      )}>
        {msg.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />}
        <div>
          <strong className="block mb-0.5">{source.label}</strong>
          <span>{msg.text}</span>
        </div>
      </div>
    );
  }

  if (globalAlert) {
    const offlineServices = services.filter(s => s.status === 'offline');
    const failedSources = ALL_SOURCES.filter(s => s.status === 'failed' || s.health === 'offline');
    
    // Check WC coverage
    const wcgpLayerIds = ['wcgp-cadastre-vector', 'wcgp-topo', 'wcgp-zoning', 'wcgp-aerial'];
    const activeWcgpCount = activeLayerIds.filter(id => wcgpLayerIds.includes(id)).length;
    const wcgpSources = ALL_SOURCES.filter(s => s.id.startsWith('wcgp-'));
    const availableWcgpCount = wcgpSources.filter(s => s.status === 'live' && s.health === 'healthy').length;

    let wcTitle = 'Western Cape Data Pending';
    if (activeWcgpCount > 0) {
      wcTitle = 'Western Cape Province Coverage Active';
    } else if (availableWcgpCount > 0) {
      wcTitle = 'Partial Western Cape Coverage';
    }
    
    if (failedSources.length > 0 || offlineServices.length > 0) {
      return (
        <div className={cn(
          "flex flex-col gap-2 p-3 rounded-lg text-xs leading-relaxed border bg-amber-50 border-amber-200 text-amber-800",
          className
        )}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <strong className="block mb-0.5 text-amber-900">
                {wcTitle}
              </strong>
              <span className="block mb-1">Some sources are currently unavailable or pending integration.</span>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-700/80 font-medium">
                {failedSources.map(s => (
                  <li key={s.id}>{s.label}: {s.userMessages[0]?.text || "Unavailable"}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={cn(
          "flex items-start gap-2 p-3 rounded-lg text-xs leading-relaxed border bg-blue-50 border-blue-200 text-blue-800",
          className
        )}>
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
          <div>
            <strong className="block mb-0.5 text-blue-900">
              {wcTitle}
            </strong>
             <span className="block italic leading-tight">
               Verified sources are live. Application is performing normally.
            </span>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg text-xs leading-relaxed border",
      activeVariant === 'warning' ? "bg-amber-50 border-amber-200 text-amber-800 shadow-sm" : 
      activeVariant === 'error' ? "bg-rose-50 border-rose-200 text-rose-800" :
      activeVariant === 'success' ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
      "bg-blue-50 border-blue-200 text-blue-800",
      className
    )}>
      <AlertCircle className={cn("h-4 w-4 shrink-0 mt-0.5", 
        activeVariant === 'warning' ? "text-amber-600" : 
        activeVariant === 'error' ? "text-rose-600" :
        activeVariant === 'success' ? "text-emerald-600" :
        "text-blue-600"
      )} />
      <div>
        <strong className={cn("block mb-0.5", 
          activeVariant === 'warning' ? "text-amber-900" : 
          activeVariant === 'error' ? "text-rose-900" :
          activeVariant === 'success' ? "text-emerald-900" :
          "text-blue-900"
        )}>
          {title || source?.label || "Dataset status"}
        </strong>
        <div className="leading-tight">
          {status || description || (
            <span className="block italic">
               {source?.status === 'pending-integration' ? "Integration pending commercial approval." : "Verified sources are live. Application is performing normally. Data coverage has been expanded province-wide across the Western Cape."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

