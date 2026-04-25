import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface VerifiedLocation {
  id: string; // The objectId or unique string of the point
  layerId: string;
  originalCoords: [number, number];
  newCoords: [number, number];
  reason: string;
  verifiedBy: string;
  verifiedAt: any;
}

export function useVerifiedLocations() {
  const [verifiedLocations, setVerifiedLocations] = useState<VerifiedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'verified_locations'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerifiedLocation));
        setVerifiedLocations(data);
      } catch (err) {
        console.error("Failed to load verified locations", err);
      } finally {
         setLoading(false);
      }
    }
    load();
  }, []);

  return { verifiedLocations, loading };
}
