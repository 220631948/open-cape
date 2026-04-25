import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  projectId?: string;
  title: string;
  geometryType: 'Point' | 'LineString' | 'Polygon';
  geometry: any; // GeoJSON geometry object
  style: DrawingStyle;
  privacy: 'private' | 'shared' | 'public';
  sourceRefs: string[];
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
      // Sort manually if index is missing or just to be safe
      data.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
      
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

  const createDrawing = async (drawing: Omit<Drawing, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("Must be logged in.");
    const id = crypto.randomUUID();
    const newDrawing = {
      ...drawing,
      geometry: drawing.geometry ? JSON.stringify(drawing.geometry) : null,
      id,
      ownerUid: user.uid,
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

  return { drawings, isLoading, error, fetchDrawings, createDrawing, updateDrawing, deleteDrawing };
}
