import React, { FC, ReactNode, useEffect } from 'react';
import { useBBoxLoader } from '../../hooks/useBBoxLoader';
import { useOfflineTileFallback } from '../../hooks/useOfflineTileFallback';

interface MapContainerProps {
  children?: ReactNode;
  urlPattern?: string;
  onUrlUpdate?: (url: string) => void;
}

const BBoxWrapper: FC<{ urlPattern: string; onUrlUpdate?: (url: string) => void }> = ({ urlPattern, onUrlUpdate }) => {
  const { url } = useBBoxLoader(urlPattern);
  
  useEffect(() => {
    if (onUrlUpdate) {
      onUrlUpdate(url);
    }
  }, [url, onUrlUpdate]);

  return null;
};

export const MapContainer: FC<MapContainerProps> = ({ children, urlPattern, onUrlUpdate }) => {
  useOfflineTileFallback();

  return (
    <>
      {urlPattern && <BBoxWrapper urlPattern={urlPattern} onUrlUpdate={onUrlUpdate} />}
      {children}
    </>
  );
};
