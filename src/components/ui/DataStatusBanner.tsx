import { AlertCircle, WifiOff, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useConnectionHealth } from '@/src/contexts/ConnectionHealthContext';
import { ALL_SOURCES } from '@/src/sources';
import { MapSourceContract } from '@/src/contracts/MapSourceContract';

interface DataStatusBannerProps {
  className?: string;
  variant?: 'warning' | 'info' | 'error' | 'success';
  title?: string;
  status?: string; 
  description?: string;
  sourceId?: string; 
  globalAlert?: boolean; 
}

export const DataStatusBanner: React.FC<DataStatusBannerProps> = ({ 
  className, 
  variant,
  title,
  status,
  description,
  sourceId,
  globalAlert = false
}) => {
  const { services } = useConnectionHealth();
  
  const source = sourceId ? ALL_SOURCES.find(s => s.id === sourceId) : null;
  const activeVariant = variant || (source?.status === 'failed' ? 'error' : source?.status === 'pending-integration' ? 'warning' : 'info');

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

  // If this banner is the designated global alert
  if (globalAlert) {
    const offlineServices = services.filter(s => s.status === 'offline');
    const failedSources = ALL_SOURCES.filter(s => s.status === 'failed' || s.health === 'offline');
    
    if (failedSources.length > 0 || offlineServices.length > 0) {
      return (
        <div className={cn(
          "flex flex-col gap-2 p-3 rounded-lg text-xs leading-relaxed border bg-rose-50 border-rose-200 text-rose-800",
          className
        )}>
          <div className="flex items-start gap-2">
            <WifiOff className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <strong className="block mb-0.5 text-rose-900">
                Data Infrastructure Note
              </strong>
              <span className="block mb-1">Some sources are currently unavailable or pending integration.</span>
              <ul className="list-disc pl-4 space-y-0.5 text-rose-700/80 font-medium">
                {failedSources.map(s => (
                  <li key={s.id}>{s.label}: {s.userMessages[0]?.text || "Unavailable"}</li>
                ))}
              </ul>
            </div>
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
               {source?.status === 'pending-integration' ? "Integration pending commercial approval." : "Verified sources are live. Application is performing normally."}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

