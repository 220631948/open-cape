import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export interface ImportedGeoJsonFeature {
  id: string;
  geojson: any; // FeatureCollection or Feature
  name?: string;
  features?: any[];
}

export function useImportedGeoJsonLayers(tenantId?: string) {
  const [importedLayers, setImportedLayers] = useState<any[]>([]);
  const [layersLoading, setLayersLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setImportedLayers([]);
      return;
    }

    setLayersLoading(true);
    const q = query(collection(db, 'importedGeoJsonLayers'), where('tenantId', '==', tenantId));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // For each layer, we'll fetch its features subcollection
      const layersPromises = snapshot.docs.map(async (doc) => {
        const layerData = doc.data();
        
        let geojsonFeatures: any[] = [];
        try {
           const featuresSnapshot = await getDocs(collection(db, 'importedGeoJsonLayers', doc.id, 'features'));
           geojsonFeatures = featuresSnapshot.docs.map(fDoc => {
             const fData = fDoc.data();
             // the geometry is usually stored inside fData.geometry
             // We'll reconstruct the feature
             return {
               type: fData.type || "Feature",
               geometry: fData.geometry,
               properties: fData.properties || {},
               id: fDoc.id
             };
           });
        } catch (e) {
           console.error("Error fetching features for layer", doc.id, e);
        }

        return {
          id: doc.id,
          ...layerData,
          geojson: {
            type: "FeatureCollection",
            features: geojsonFeatures
          }
        };
      });

      const layers = await Promise.all(layersPromises);
      setImportedLayers(layers);
      setLayersLoading(false);
    }, (error) => {
      console.error("Error fetching importedGeoJsonLayers:", error);
      setLayersLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  return { importedLayers, layersLoading };
}
