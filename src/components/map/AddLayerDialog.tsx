import React, { useState } from 'react';
import { useOGCAutoDetection } from '../../hooks/useOGCAutoDetection';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const AddLayerDialog: React.FC<{ onClose: () => void, onAdd: (source: any) => void }> = ({ onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const { isDetecting, error, detectedService, detectService } = useOGCAutoDetection();

  const handleDetect = () => {
    if (url) {
      if (url.toLowerCase().endsWith('.json') || url.toLowerCase().endsWith('.geojson') || url.includes('/FeatureServer')) {
        // Direct GeoJSON or FeatureService (ArcGIS)
        onAdd({
          id: `custom-${Date.now()}`,
          name: label || 'Custom GeoJSON Layer',
          type: 'geojson',
          url: url
        });
        onClose();
      } else {
        detectService(url);
      }
    }
  };

  const handleAdd = () => {
    if (detectedService) {
      onAdd({
        ...detectedService,
        name: label || detectedService.type
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-surface-900 border-none">
        <h2 className="text-xl font-bold mb-1 tracking-tight">Add Map Layer</h2>
        <p className="text-[11px] text-surface-500 mb-6 font-medium leading-relaxed">External GeoJSON URLs or OGC endpoints (WMS/WMTS/XYZ).</p>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase tracking-widest text-surface-400 ml-1">Identity Reference</label>
             <Input 
               value={label} 
               onChange={e => setLabel(e.target.value)}
               placeholder="e.g. Cadastre Overlay"
               className="h-10 bg-surface-50 border-surface-100 text-xs rounded-lg"
             />
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase tracking-widest text-surface-400 ml-1">Source Connection</label>
             <Input 
               value={url} 
               onChange={e => setUrl(e.target.value)}
               placeholder="https://.../data.geojson"
               className="h-10 bg-surface-50 border-surface-100 font-mono text-[10px] rounded-lg"
             />
          </div>
          
          {!detectedService ? (
            <Button onClick={handleDetect} disabled={isDetecting || !url} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/10">
               {isDetecting ? 'Sensing Service Type...' : 'Analyze & Inject'}
            </Button>
          ) : (
            <div className="bg-indigo-50/50 p-4 rounded-xl text-xs border border-indigo-100/50 animate-in slide-in-from-bottom-2">
               <p className="font-bold text-indigo-900 border-b border-indigo-200/50 pb-2 mb-3 flex justify-between">
                 <span>Protocol Isolated</span>
                 <span className="uppercase text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded tracking-tighter">{detectedService.type}</span>
               </p>
               {detectedService.layers && detectedService.layers.length > 0 && (
                  <p className="text-[10px] font-bold text-indigo-700/70 uppercase mb-3 text-center">
                    Manifest contains {detectedService.layers.length} sub-layers
                  </p>
               )}
               <Button onClick={handleAdd} className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 font-bold text-white rounded-lg">
                  Confirm Pipeline Integration
               </Button>
            </div>
          )}

          {error && <div className="text-[10px] text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 font-medium animate-in shake-in-1">{error}</div>}
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={onClose} className="h-9 text-surface-400 font-bold hover:text-surface-900 hover:bg-transparent text-[10px]">Cancel Transaction</Button>
        </div>
      </div>
    </div>
  );
};
