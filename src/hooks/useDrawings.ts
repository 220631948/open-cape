/* eslint-disable */
import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { setDoc, updateDoc } from '@/src/lib/safeFirestore';;
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface DrawingStyle {
  stroke: string;
  strokeWidth: number;
  fill: string;
  fillOpacity: number;
}

export interface Drawing {
  id: string;
  ownerUid: string;
  projectId: string | null;
  parcelId: string | null;
  title: string;
  geometryType: 'Point' | 'LineString' | 'Polygon';
  geometry: any; // GeoJSON geometry object
  style: DrawingStyle;
  privacy: 'private' | 'shared' | 'public';
  sourceRefs: string[];
  order?: number;
  createdAt: any;
  updatedAt: any;
}


export function useDrawings(projectId?: string) {
  const { user } = useAuth();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrawings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      let q = query(
        collection(db, 'drawings'),
        where('ownerUid', '==', user.uid)
      );
      
      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => {
        const docData = doc.data();
        let geom = docData.geometry;
        if (typeof geom === 'string') {
          try {
            geom = JSON.parse(geom);
          } catch(e) {}
        }
        return { 
          id: doc.id, 
          ...docData, 
          geometry: geom 
        } as Drawing;
      });
      data.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0);
      });
      
      setDrawings(data);
    } catch (err: any) {
      console.error('Failed to fetch drawings:', err);
      setError(err.message || 'Failed to load drawings.');
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const createDrawing = async (drawing: Omit<Drawing, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt' | 'projectId' | 'parcelId'> & { projectId?: string | null, parcelId?: string | null }) => {
    if (!user) throw new Error("Must be logged in.");
    const id = crypto.randomUUID();
     
    const newDrawing = {
      ...drawing,
      geometry: drawing.geometry ? JSON.stringify(drawing.geometry) : null,
      id,
      ownerUid: user.uid,
      projectId: drawing.projectId || null,
      parcelId: drawing.parcelId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
     
    await setDoc(doc(db, 'drawings', id), newDrawing);
    await fetchDrawings();
    return id;
  };

  const updateDrawing = async (id: string, updates: Partial<Drawing>) => {
    if (!user) return;
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    if (updates.geometry) {
      payload.geometry = JSON.stringify(updates.geometry);
    }
     
    await updateDoc(doc(db, 'drawings', id), payload);
    await fetchDrawings();
  };

  const deleteDrawing = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'drawings', id));
    await fetchDrawings();
  };

  const reorderDrawings = async (orderedIds: string[]) => {
    if (!user) return;
    
    // Optimistic update
    setDrawings(prev => {
      const copy = [...prev];
      copy.sort((a, b) => {
        const indexA = orderedIds.indexOf(a.id);
        const indexB = orderedIds.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      // apply new order numbers
      return copy.map((d, i) => ({ ...d, order: i }));
    });

    // Update in firestore
    // To do it properly, we might use a batch here
    // but safeFirestore doesn't have a batch equivalent exposed directly. We'll do multiple updateDocs.
    try {
      await Promise.all(
        orderedIds.map((id, index) => 
          updateDoc(doc(db, 'drawings', id), { order: index, updatedAt: serverTimestamp() })
        )
      );
    } catch (err) {
      console.error('Failed to reorder:', err);
      await fetchDrawings(); // Revert on error
    }
  };

  return { drawings, isLoading, error, fetchDrawings, createDrawing, updateDrawing, deleteDrawing, reorderDrawings };
}
