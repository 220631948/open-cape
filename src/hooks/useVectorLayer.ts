import { useState, useEffect } from 'react';
import { fetchArcGISLayerAsGeoJSON } from '../lib/arcgis';
import { useVerifiedLocations, VerifiedLocation } from './useVerifiedLocations';

export interface VectorLayerConfig {
  id: string;
  name: string;
  url: string;
  color: string;
  icon: string;
  fields?: string;
}

export const VECTOR_LAYERS: VectorLayerConfig[] = [
  {
    id: 'schools',
    name: 'Schools',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/27',
    color: '#3b82f6', // blue-500
    icon: 'book-open',
    fields: '*'
  },
  {
    id: 'health_care',
    name: 'Health Care Facilities',
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/45',
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
    url: 'https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/23',
    color: '#8b5cf6', // violet-500
    icon: 'library',
    fields: '*'
  }
];

export function useVectorLayer(layerConfig: VectorLayerConfig | undefined, isActive: boolean) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifiedLocations, loading: verifying } = useVerifiedLocations();

  useEffect(() => {
    if (!isActive || !layerConfig) return;

    let mounted = true;
    setLoading(true);
    window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: true, error: null, loaded: 0, total: null } }));

    fetchArcGISLayerAsGeoJSON(layerConfig.url, layerConfig.fields, (loaded, total) => {
      if (mounted) {
        window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: true, error: null, loaded, total } }));
      }
    })
      .then(featureCollection => {
        if (mounted) {
          // Merge verified locations
          const overrides = verifiedLocations.filter(v => v.layerId === layerConfig.id);
          const extraFeatures: any[] = [];
          const mergedFeatures = featureCollection.features.map((f: any) => {
             // Find override by something unique, like OBJECTID
             const fId = f.properties.OBJECTID?.toString() || f.properties.id?.toString();
             const expectedDocId = `${layerConfig.id}_${fId}`;
             const override = overrides.find(o => o.id === expectedDocId);

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
                verificationNotes: "Fetched directly from a verified City of Cape Town source."
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

          setData({ ...featureCollection, features: [...mergedFeatures, ...extraFeatures] });
          setLoading(false);
          window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: false, error: null, loaded: mergedFeatures.length, total: mergedFeatures.length } }));
        }
      })
      .catch(err => {
        console.error(`Failed to load layer ${layerConfig.id}:`, err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
          window.dispatchEvent(new CustomEvent('vector-layer-status', { detail: { id: layerConfig.id, loading: false, error: err.message, loaded: 0, total: null } }));
        }
      });

    return () => {
      mounted = false;
    };
  }, [layerConfig, isActive, verifiedLocations]);

  return { data, loading: loading || verifying, error };
}
