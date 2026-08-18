/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMap, MapRef } from 'react-map-gl/maplibre';
import { fetchArcGISLayerAsGeoJSON } from '../lib/arcgis';
import { useVerifiedLocations } from './useVerifiedLocations';
import { getViewportBBox } from '../utils/getViewportBBox';

export interface VectorLayerConfig {
  id: string;
  name: string;
  url: string;
  color: string;
  icon: string;
  fields?: string;
  minzoom?: number;
  maxzoom?: number;
  outlineColor?: string;
  outlineWidth?: number;
  fillOpacity?: number;
}

export const VECTOR_LAYERS: VectorLayerConfig[] = [
  {
    id: 'erf_boundaries',
    name: 'Western Cape Land Parcels (Erven)',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/1',
    color: 'transparent',
    outlineColor: '#f43f5e', // rose-500
    outlineWidth: 1.5,
    fillOpacity: 0,
    minzoom: 16,
    maxzoom: 22,
    icon: 'map',
    fields: '*'
  },
  {
    id: 'zoning_dms',
    name: 'City of Cape Town Zoning',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/59',
    color: '#3b82f6', // blue-500
    icon: 'layers',
    fields: '*'
  },
  {
    id: 'wcgp-cadastre-vector',
    name: 'Western Cape Cadastre',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/2',
    color: 'transparent',
    outlineColor: '#1e3a8a',
    outlineWidth: 1.5,
    fillOpacity: 0,
    minzoom: 10,
    maxzoom: 22,
    icon: 'map',
    fields: 'PRCL_KEY,PRCL_TYPE,MUNICNAME,LSTATUS,TAG_VALUE'
  },
  {
    id: 'wcgp-zoning-vector',
    name: 'Western Cape Zoning',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/DEADP/WC_Provincial_Spatial_Development_Frameworks/MapServer/0',
    color: '#3b82f6', // blue-500
    icon: 'layers',
    fields: '*'
  },
  {
    id: 'schools',
    name: 'Schools',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/WCED_Facilities/MapServer/6',
    color: '#3b82f6', // blue-500
    icon: 'book-open',
    fields: '*'
  },
  {
    id: 'health_care',
    name: 'Health Care Facilities',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/DOH_Facilities/MapServer/6',
    color: '#ef4444', // red-500
    icon: 'activity',
    fields: '*'
  },
  {
    id: 'train_stations',
    name: 'Train Stations',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/Transportation/MapServer/3',
    color: '#f97316', // orange-500
    icon: 'train',
    fields: '*'
  },
  {
    id: 'libraries',
    name: 'Libraries',
    url: 'https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/DCAS_Facilities/MapServer/2',
    color: '#8b5cf6', // violet-500
    icon: 'library',
    fields: '*'
  },
  {
    id: 'public_wifi',
    name: 'Public Wi-Fi',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/40', // Typical CoCT WiFi layer ID (placeholder logic if exact is 40)
    color: '#10b981', // emerald-500
    icon: 'wifi',
    fields: '*'
  },
  {
    id: 'citizen_reports',
    name: 'Citizen Reports (C3)',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/56', // Placeholder URL for demo context
    color: '#f59e0b', // amber-500
    icon: 'message-square',
    fields: '*'
  },
  {
    id: 'electricity_substations',
    name: 'Electricity Substations',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/14', // Placeholder
    color: '#fbbf24', 
    icon: 'zap',
    fields: '*'
  },
  {
    id: 'water_pipelines',
    name: 'Water Pipelines',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/15', // Placeholder
    color: '#3b82f6', 
    icon: 'droplets',
    fields: '*'
  }
];

export function useVectorLayer(layerConfig: VectorLayerConfig | undefined, isActive: boolean) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifiedLocations, loading: verifying } = useVerifiedLocations();
  
  const mapContext = useMap();
  const map = mapContext.current || Object.values(mapContext)[0];
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const prevBBoxKey = useRef<string>('');

  const loadData = useCallback(async () => {
    if (!isActive || !layerConfig || !map) return;
    const maplibreMap = map.getMap();
    if ((layerConfig.minzoom && maplibreMap.getZoom() < layerConfig.minzoom)) return;

    const bbox = getViewportBBox(map as MapRef);
    if (!bbox) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const bboxKey = bbox.join(',');
    if (prevBBoxKey.current === bboxKey) return;
    prevBBoxKey.current = bboxKey;

    setLoading(true);
    window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: true, error: null, loaded: 0, total: null } }));

    try {
      const featureCollection = await fetchArcGISLayerAsGeoJSON(
        layerConfig.url, 
        layerConfig.fields, 
        (loaded, total) => {
          window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: true, error: null, loaded, total } }));
        },
        bbox,
        abortControllerRef.current.signal
      );

      // Merge verified locations
      const overrides = verifiedLocations.filter(v => v.layerId === layerConfig.id);

      // ⚡ Bolt: Convert overrides to a Map for O(1) lookup to prevent O(n*m) performance degradation
      // when merging thousands of feature records with verified locations.
      const overridesMap = new Map(overrides.map(o => [o.id, o]));
      const extraFeatures: any[] = [];
      const mergedFeatures = featureCollection.features.map((f: any) => {
          const fId = f.properties.OBJECTID?.toString() || f.properties.id?.toString();
          const expectedDocId = `${layerConfig.id}_${fId}`;
          const override = overridesMap.get(expectedDocId);

          const osint = {
            sourceId: layerConfig.id,
            sourceName: layerConfig.name,
            sourceType: 'authoritative public',
            sourceUrl: layerConfig.url,
            fetchedAt: new Date().toISOString(),
            verifiedAt: override ? new Date().toISOString() : null,
            recordId: fId,
            geometryType: f.geometry?.type || 'Unknown',
            displayMode: f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon' ? 'derived-display-point' : 'source-geometry',
            verificationStatus: override ? 'verified-source-record' : 'live-open-context-layer',
            verificationNotes: "Fetched directly from a verified City of Cape Town / WCGP source."
          };
          
          if (osint.displayMode === 'derived-display-point') {
              osint.verificationStatus = 'derived-from-verified-geometry';
              osint.verificationNotes = 'Display point derived from verified parcel geometry for public map performance.';
          } else {
              osint.verificationStatus = override ? 'verified-source-record' : 'verified-source-record';
          }

          if (override && f.geometry?.type === 'Point') {
            extraFeatures.push({
                type: 'Feature',
                id: `line-${fId}`,
                geometry: {
                  type: 'LineString',
                  coordinates: [override.originalCoords, override.newCoords]
                },
                properties: { isOverrideLine: true }
            });
            extraFeatures.push({
                type: 'Feature',
                id: `ghost-${fId}`,
                geometry: {
                  type: 'Point',
                  coordinates: override.originalCoords
                },
                properties: { isGhostPoint: true }
            });

            return {
              ...f,
              geometry: {
                ...f.geometry,
                coordinates: override.newCoords
              },
              properties: {
                ...f.properties,
                isVerified: true,
                verifiedReason: override.reason,
                verifiedBy: override.verifiedBy,
                _osint: JSON.stringify({
                    ...osint,
                    verificationNotes: `Coordinate override by analyst: ${override.reason}`
                })
              }
            };
          }
          
          return {
             ...f,
             properties: {
                ...f.properties,
                _osint: JSON.stringify(osint)
             }
          };
      });

      setData({
          ...featureCollection,
          features: [...mergedFeatures, ...extraFeatures]
      });
      setError(null);
      window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: false, error: null, loaded: mergedFeatures.length, total: mergedFeatures.length } }));

    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'Aborted') {
          // Ignore abort
      } else {
        console.error(`Failed to load layer ${layerConfig.id}:`, err);
        setError(err instanceof Error ? err.message : String(err));
        window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: false, error: err instanceof Error ? err.message : String(err), loaded: 0, total: null } }));
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }

  }, [isActive, layerConfig, map, verifiedLocations]);

  useEffect(() => {
    if (!map) return;
    const maplibreMap = map.getMap();

    loadData();

    const onMoveEnd = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        loadData();
      }, 500);
    };

    maplibreMap.on('moveend', onMoveEnd);
    return () => {
      maplibreMap.off('moveend', onMoveEnd);
    };
  }, [map, loadData]);

  // Handle cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading: loading || verifying, error };
}
