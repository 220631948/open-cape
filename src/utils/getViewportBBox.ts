import { MapRef } from 'react-map-gl/maplibre';

export function getViewportBBox(map: MapRef | null): [number, number, number, number] | null {
  if (!map) return null;
  const maplibreMap = map.getMap();
  
  try {
    const bounds = maplibreMap.getBounds();
    return [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
  } catch (e) {
    return null;
  }
}
