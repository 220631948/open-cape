import React, { useState } from 'react';
import { useOGCAutoDetection } from '../../hooks/useOGCAutoDetection';
import { Button } from '../ui/Button';

export const AddLayerDialog: React.FC<{ onClose: () => void, onAdd: (source: any) => void }> = ({ onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const { isDetecting, error, detectedService, detectService } = useOGCAutoDetection();

  const handleDetect = () => {
    if (url) {
      detectService(url);
    }
  };

  const handleAdd = () => {
    if (detectedService) {
      onAdd(detectedService.mapLibreSource);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-4">Add Custom Layer</h2>
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Service URL (WMS/WMTS/XYZ)</label>
             <input 
               type="text" 
               className="w-full border rounded-md px-3 py-2 text-sm" 
               value={url} 
               onChange={e => setUrl(e.target.value)}
               placeholder="https://example.com/wms"
             />
          </div>
          
          <Button onClick={handleDetect} disabled={isDetecting || !url} className="w-full">
             {isDetecting ? 'Detecting...' : 'Detect Service'}
          </Button>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          {detectedService && (
             <div className="bg-blue-50 p-3 rounded-md text-sm border border-blue-100">
                <p className="font-semibold text-blue-800">Detected: {detectedService.type}</p>
                {detectedService.layers && detectedService.layers.length > 0 && (
                   <div className="mt-2 text-blue-700">
                     Found {detectedService.layers.length} layers. Defaulting to first layer.
                   </div>
                )}
                <Button onClick={handleAdd} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                   Add to Map
                </Button>
             </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};
