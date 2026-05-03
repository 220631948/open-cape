import React from 'react';
import { OwnershipChangeEvent } from '../../types/history';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  event: OwnershipChangeEvent | null;
  className?: string;
}

export const OwnershipChangeAlert: React.FC<Props> = ({ event, className }) => {
  if (!event || !event.detected) {
    return null;
  }

  return (
    <div className={cn("bg-blue-50/50 p-3 rounded border border-blue-100", className)}>
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex flex-col gap-1 w-full">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Ownership change detected
          </span>
          <p className="text-[10px] text-blue-600/80 mb-2">
            Ownership changes are detected using title deed transfer records.
          </p>
          
          <div className="bg-white rounded p-2 border border-blue-100 text-xs text-surface-700 space-y-1">
             {event.transferDate && (
                <div className="flex justify-between">
                   <span className="text-surface-500">Transfer date:</span>
                   <span className="font-medium">{new Date(event.transferDate).toLocaleDateString()}</span>
                </div>
             )}
             {event.eventType && (
                <div className="flex justify-between">
                   <span className="text-surface-500">Event type:</span>
                   <span className="font-medium">{event.eventType}</span>
                </div>
             )}
             {event.previousOwnerType && (
                <div className="flex justify-between border-t border-surface-100 pt-1 mt-1">
                   <span className="text-surface-500">Previous owner:</span>
                   <span className="font-medium truncate max-w-[150px]" title={event.previousOwnerType}>
                      {event.previousOwnerType} {event.previousOwnerCategory ? `(${event.previousOwnerCategory})` : ''}
                   </span>
                </div>
             )}
             {event.newOwnerType && (
                <div className="flex justify-between">
                   <span className="text-surface-500">New owner:</span>
                   <span className="font-medium truncate max-w-[150px]" title={event.newOwnerType}>
                      {event.newOwnerType} {event.newOwnerCategory ? `(${event.newOwnerCategory})` : ''}
                   </span>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
