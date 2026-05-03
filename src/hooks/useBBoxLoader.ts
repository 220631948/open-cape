import { useState, useEffect, useRef, useCallback } from 'react';
import { useMap, MapRef } from 'react-map-gl/maplibre';
import { getViewportBBox } from '../utils/getViewportBBox';

export function useBBoxLoader(baseUrl: string) {
  const mapContext = useMap();
  const map = mapContext.current || Object.values(mapContext)[0];
  const [url, setUrl] = useState<string>(baseUrl);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevBBoxKey = useRef<string>('');

  const updateUrl = useCallback(() => {
    if (!map) return;
    const bbox = getViewportBBox(map as MapRef);
    if (!bbox) return;

    const [minLng, minLat, maxLng, maxLat] = bbox;
    const bboxParam = `${minLng},${minLat},${maxLng},${maxLat}`;
    
    if (prevBBoxKey.current === bboxParam) return;
    prevBBoxKey.current = bboxParam;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    let newUrl = baseUrl;
    if (newUrl.includes('{minLng}')) {
      newUrl = newUrl
        .replace(/\{minLng\}/g, minLng.toString())
        .replace(/\{minLat\}/g, minLat.toString())
        .replace(/\{maxLng\}/g, maxLng.toString())
        .replace(/\{maxLat\}/g, maxLat.toString());
    } else {
      const separator = newUrl.includes('?') ? '&' : '?';
      newUrl = `${newUrl}${separator}bbox=${bboxParam}`;
    }

    setUrl(newUrl);
  }, [map, baseUrl]);

  useEffect(() => {
    if (!map) return;
    const maplibreMap = map.getMap();

    // Initial config
    updateUrl();

    const onMoveEnd = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        updateUrl();
      }, 500);
    };

    maplibreMap.on('moveend', onMoveEnd);
    
    return () => {
      maplibreMap.off('moveend', onMoveEnd);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [map, updateUrl]);

  return { url, abortController: abortControllerRef.current };
}
