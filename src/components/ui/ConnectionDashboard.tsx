import React from 'react';
import { useConnectionHealth } from '@/src/contexts/ConnectionHealthContext';
import { Activity, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Button } from './Button';

export const ConnectionDashboard: React.FC = () => {
   const { services, checkAllServices } = useConnectionHealth();

   return (
      <div className="bg-white border border-surface-200 rounded-lg shadow-sm overflow-hidden mb-8">
         <div className="bg-surface-50 border-b border-surface-200 p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
               <Activity className="h-4 w-4 text-surface-500" />
               Live System Diagnostics
            </h3>
            <Button variant="outline" size="sm" onClick={checkAllServices} className="h-8 text-xs">
               <RefreshCw className="h-3 w-3 mr-1.5" /> Retry Connections
            </Button>
         </div>
         <div className="divide-y divide-surface-100">
            {services.map(service => (
               <div key={service.id} className="p-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-4">
                     {service.status === 'operational' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                     ) : service.status === 'offline' ? (
                        <XCircle className="h-5 w-5 text-rose-500" />
                     ) : (
                        <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />
                     )}
                     <div>
                        <p className="text-sm font-medium text-surface-900">
                           {service.name}
                        </p>
                        <p className="text-xs text-surface-500 font-mono mt-0.5 truncate max-w-[280px] sm:max-w-md">
                           {service.endpoint}
                        </p>
                     </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                     <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex",
                        service.status === 'operational' ? "bg-emerald-100 text-emerald-700" :
                        service.status === 'offline' ? "bg-rose-100 text-rose-700" :
                        "bg-amber-100 text-amber-700"
                     )}>
                        {service.status === 'offline' && service.errorMessage ? `OFFLINE (${service.errorMessage})` : service.status}
                     </span>
                     {service.lastChecked && (
                        <span className="text-[10px] text-surface-400 flex items-center gap-1">
                           <Clock className="h-3 w-3" />
                           {service.lastChecked.toLocaleTimeString()}
                        </span>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};
