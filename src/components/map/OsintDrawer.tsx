import React, { useState } from 'react';
import { X, ExternalLink, ShieldCheck, Crosshair, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/useProfile';

interface OsintDrawerProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  featureInfo: {layerId: string, feature: any} | null;
  onInitiateLocationCorrection: () => void;
}

export const OsintDrawer: React.FC<OsintDrawerProps> = ({ className, isOpen, onClose, featureInfo, onInitiateLocationCorrection }) => {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'info' | 'verify'>('info');

  if (!isOpen || !featureInfo) return null;

  const { layerId, feature } = featureInfo;
  const props = feature.properties || {};
  const isVerified = props.isVerified;

  const lat = feature.geometry.coordinates[1];
  const lng = feature.geometry.coordinates[0];

  const layerName = layerId.replace('layer-', '').replace(/_/g, ' ');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;

  return (
    <div className={cn("w-full sm:w-80 bg-white border-l border-surface-200 shadow-xl flex flex-col h-full z-20 transition-transform relative", className)}>
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200 shrink-0 bg-surface-50">
        <h2 className="font-semibold text-surface-900 text-sm flex items-center gap-2 capitalize">
          <ShieldCheck className={cn("h-4 w-4", isVerified ? "text-emerald-500" : "text-surface-400")} />
          OSINT: {layerName}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-surface-500 hover:text-surface-900 -mr-2">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex border-b border-surface-200 bg-surface-50 px-2 shrink-0 overflow-x-auto no-scrollbar">
        {['info', 'verify'].map((tabId) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId as any)}
            className={cn(
              "px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap capitalize",
              activeTab === tabId
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300"
            )}
          >
            {tabId}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-50/50">
        {activeTab === 'info' && (
           <div className="space-y-4">
              <div className="bg-white p-3 rounded-md border border-surface-200 shadow-sm">
                 <h3 className="text-xs font-semibold text-surface-900 uppercase tracking-wider mb-2">Raw Metadata</h3>
                 <div className="space-y-1">
                 {Object.entries(props).map(([key, value]) => {
                    if (key.startsWith("SHAPE") || key === "OBJECTID" || value === null || value === "") return null;
                    return (
                        <div key={key} className="flex justify-between items-start gap-2 border-b border-surface-100 last:border-0 pb-1 last:pb-0">
                           <span className="text-[10px] text-surface-500 break-all">{key}</span>
                           <span className="text-xs font-medium text-surface-900 text-right break-words">{String(value)}</span>
                        </div>
                    );
                 })}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'verify' && (
           <div className="space-y-4">
              {isVerified ? (
                 <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md border border-emerald-200 shadow-sm text-sm">
                    <ShieldCheck className="h-5 w-5 mb-2 text-emerald-600" />
                    <strong>Location Verified</strong>
                    <p className="text-xs mt-1">This feature has been verified by analyst: {props.verifiedBy}</p>
                    <p className="text-xs mt-1 italic">"{props.verifiedReason}"</p>
                 </div>
              ) : (
                 <div className="bg-amber-50 text-amber-800 p-3 rounded-md border border-amber-200 shadow-sm text-sm">
                    <strong>Pending Verification</strong>
                    <p className="text-xs mt-1">This feature is derived from open data and is pending spatial verification.</p>
                 </div>
              )}

              <div className="bg-white p-3 rounded-md border border-surface-200 shadow-sm space-y-2">
                 <h3 className="text-xs font-semibold text-surface-900 uppercase tracking-wider">Trusted Comparison</h3>
                 
                 <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-xs font-medium text-blue-600 hover:text-blue-800 border bg-surface-50 px-2 py-1.5 rounded">
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                 </a>
                 <a href={osmUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between text-xs font-medium text-blue-600 hover:text-blue-800 border bg-surface-50 px-2 py-1.5 rounded">
                    <span>OpenStreetMap</span>
                    <ExternalLink className="h-3 w-3" />
                 </a>
                 <div className="text-[10px] text-surface-500 mt-1">
                    Compare location: {lat.toFixed(6)}, {lng.toFixed(6)}
                 </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-surface-200 shadow-sm flex flex-col gap-2">
                 <h3 className="text-xs font-semibold text-surface-900 uppercase tracking-wider mb-1">Analyst Actions</h3>
                 <p className="text-[10px] text-surface-600 mb-1">Select an action to augment or export this record.</p>
                 <Button onClick={onInitiateLocationCorrection} className="w-full text-xs justify-start" variant="primary">
                    <Crosshair className="h-3 w-3 mr-2" /> Correct Location
                 </Button>
                 <div className="p-2 border border-indigo-100 bg-indigo-50 rounded text-[10px] text-indigo-700 leading-tight mb-1">
                    Click "Correct Location" to open the location correction dialog.
                 </div>
                 <Button className="w-full text-xs justify-start" variant="outline" onClick={() => alert('Add Note functionality initiated')}>
                    <FileText className="h-3 w-3 mr-2 text-indigo-500" /> Add Investigation Note
                 </Button>
                 <Button className="w-full text-xs justify-start" variant="outline" onClick={() => window.print()}>
                    <Download className="h-3 w-3 mr-2 text-rose-500" /> Export PDF Report
                 </Button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
