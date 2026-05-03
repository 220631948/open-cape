import React from 'react';
import { Popup } from "react-map-gl/maplibre";
import { MapPin, ShieldCheck } from 'lucide-react';
import { useProfile } from '@/src/contexts/useProfile';

interface FeaturePopupProps {
  popupInfo: { lngLat: [number, number]; feature: any; layerId: string };
  onClose: () => void;
  onBookmark: () => void;
  onVerify: () => void;
}

export const FeaturePopup: React.FC<FeaturePopupProps> = ({ popupInfo, onClose, onBookmark, onVerify }) => {
  const { profile } = useProfile();
  
  let osint: any = null;
  if (typeof popupInfo.feature.properties._osint === 'string') {
    try { osint = JSON.parse(popupInfo.feature.properties._osint); } catch { /* Ignore malformed JSON override */ }
  } else if (popupInfo.feature.properties._osint) {
    osint = popupInfo.feature.properties._osint;
  }

  const layerName = popupInfo.layerId.replace("layer-", "").replace(/_/g, " ");

  return (
    <Popup
      longitude={popupInfo.lngLat[0]}
      latitude={popupInfo.lngLat[1]}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      className="z-50 !p-0"
      maxWidth="320px"
    >
      <div className="flex flex-col w-[280px] sm:w-[320px] max-h-[400px] overflow-hidden -m-px rounded-xl bg-white shadow-xl border border-surface-200 pointer-events-auto">
        <div className="bg-surface-50 border-b border-surface-200 p-3 pt-4 pb-2 flex items-start justify-between shrink-0">
          <div>
            <h4 className="font-bold text-surface-900 capitalize leading-tight flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
              {layerName} Feature
            </h4>
            <span className="text-[10px] text-surface-500 font-medium uppercase tracking-wider mt-0.5 block">
               ID: {popupInfo.feature.properties?.OBJECTID || popupInfo.feature.properties?.id || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {osint && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-xs">
              <div className="font-bold text-emerald-900 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-600" /> OSINT Provenance</span>
                <span className="bg-emerald-200 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded capitalize">{osint.verificationStatus?.replace(/-/g, ' ')}</span>
              </div>
              <div className="space-y-1 text-emerald-800/80">
                <div><span className="font-medium text-emerald-900">Source:</span> <a href={osint.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-900 underline">{osint.sourceName}</a></div>
                <div><span className="font-medium text-emerald-900">Type:</span> {osint.sourceType}</div>
                {osint.verificationNotes && <div><span className="font-medium text-emerald-900">Notes:</span> {osint.verificationNotes}</div>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(popupInfo.feature.properties || {})
              .filter(([key, value]) => !key.startsWith("SHAPE") && key !== "OBJECTID" && key !== "_osint" && value !== null && value !== "")
              .map(([key, value]) => (
                <div key={key} className="bg-surface-50 p-2 rounded-md border border-surface-100 col-span-2 sm:col-span-1">
                  <span className="block text-[9px] text-surface-400 uppercase font-bold tracking-wider mb-0.5 truncate" title={key.replace(/_/g, ' ')}>
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="block text-xs font-medium text-surface-900 truncate" title={String(value)}>
                    {key === 'isVerified' ? '✅ Verified' : String(value)}
                  </span>
                </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-50 border-t border-surface-200 p-2 flex gap-2 shrink-0">
          <button 
            onClick={onBookmark}
            className="flex-1 bg-white border border-surface-200 text-surface-700 text-xs px-2 py-1.5 rounded hover:bg-surface-50 font-medium transition-colors"
          >
            Bookmark
          </button>
          {profile?.role === 'analyst' && (
            <button 
              onClick={onVerify}
              className="flex-1 bg-emerald-600 text-white shadow-sm text-xs px-2 py-1.5 rounded hover:bg-emerald-700 font-medium transition-colors"
            >
              Verify Point
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
};
