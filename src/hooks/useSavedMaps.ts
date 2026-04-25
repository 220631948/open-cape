import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';
import { sanitizeForFirestore } from '@/src/lib/firestoreUtils';

export interface ViewportState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface SavedMap {
  id: string;
  ownerUid: string;
  projectId?: string;
  title: string;
  description: string;
  viewport: ViewportState;
  visibleLayers: string[];
  activeFilters: any; // e.g. zoning filters
  createdAt: any;
  updatedAt: any;
}

export function useSavedMaps(projectId?: string) {
  const { user } = useAuth();
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedMaps = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      let q = query(
        collection(db, 'saved_maps'),
        where('ownerUid', '==', user.uid)
      );
      
      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedMap));
      data.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
      
      setSavedMaps(data);
    } catch (err: any) {
      console.error('Failed to fetch saved maps:', err);
      setError(err.message || 'Failed to load saved maps.');
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchSavedMaps();
  }, [fetchSavedMaps]);

  const createSavedMap = async (savedMap: Omit<SavedMap, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("Must be logged in.");
    const id = crypto.randomUUID();
    const newSavedMap = {
      ...savedMap,
      id,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'saved_maps', id), sanitizeForFirestore(newSavedMap));
    await fetchSavedMaps();
    return id;
  };

  const updateSavedMap = async (id: string, updates: Partial<SavedMap>) => {
    if (!user) return;
    const payload: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    await updateDoc(doc(db, 'saved_maps', id), payload);
    await fetchSavedMaps();
  };

  const deleteSavedMap = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'saved_maps', id));
    await fetchSavedMaps();
  };

  return { savedMaps, isLoading, error, fetchSavedMaps, createSavedMap, updateSavedMap, deleteSavedMap };
}
