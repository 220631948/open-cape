import { useState, useCallback } from 'react';
import { detectOGCService, OGCServiceInfo } from '../utils/detectOGCService';

export function useOGCAutoDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedService, setDetectedService] = useState<OGCServiceInfo | null>(null);

  const detectService = useCallback(async (url: string) => {
    setIsDetecting(true);
    setError(null);
    setDetectedService(null);
    try {
      const info = await detectOGCService(url);
      if (info) {
        setDetectedService(info);
      } else {
        setError('No supported OGC service detected at this URL.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during service detection');
    } finally {
      setIsDetecting(false);
    }
  }, []);

  return { isDetecting, error, detectedService, detectService, clearDetection: () => setDetectedService(null) };
}
