import { useEffect, useState } from 'react';
import { getTile, putTile } from '../services/tileCacheService';

let isFetchWrapped = false;

export function useOfflineTileFallback() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!isFetchWrapped) {
      isFetchWrapped = true;
      const originalFetch = window.fetch;

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const urlString = typeof input === 'string' ? input : 
                         (input instanceof URL ? input.toString() : 
                         (input as Request).url);

        // Detect if request is related to tiles or geospatial data
        const isTile = urlString.includes('/tile') || 
                       urlString.includes('.pbf') || 
                       urlString.includes('.mvt') ||
                       urlString.includes('MapServer') ||
                       urlString.includes('bbox=');

        if (!isTile) {
          return originalFetch(input, init);
        }

        try {
          if (!navigator.onLine) {
            const cachedData = await getTile(urlString);
            if (cachedData) {
              return new Response(cachedData, { status: 200 });
            }
          }

          const response = await originalFetch(input, init);

          if (response.ok) {
            const cloned = response.clone();
            cloned.arrayBuffer().then(buffer => {
              if (buffer.byteLength > 0) {
                putTile(urlString, buffer).catch(() => {});
              }
            }).catch(() => {});
          }

          return response;
        } catch (error) {
          const cachedData = await getTile(urlString);
          if (cachedData) {
            return new Response(cachedData, { status: 200 });
          }
          throw error;
        }
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOffline };
}
