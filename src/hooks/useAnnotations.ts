/* eslint-disable */
import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { setDoc, updateDoc } from '@/lib/safeFirestore';;
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeForFirestore } from '@/lib/firestoreUtils';

export interface Annotation {
  id: string;
  ownerUid: string;
  projectId: string | null;
  parcelId: string | null;
  targetType: 'drawing' | 'map' | 'saved-map' | 'placeholder-feature' | 'parcel';
  targetId: string; // ID of the drawing, map, etc.
  title: string;
  body: string;
  imageUrl?: string | null;
  geometry?: any | null; // For map-anchored notes
  style?: {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
  } | null;
  sourceRefs: string[];
  createdAt: any;
  updatedAt: any;
}

export function useAnnotations(projectId?: string, targetId?: string) {
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnotations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      let q = query(
        collection(db, 'annotations'),
        where('ownerUid', '==', user.uid)
      );
      
      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }
      
      if (targetId) {
        q = query(q, where('targetId', '==', targetId));
      }

      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Annotation));
      data.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
      
      setAnnotations(data);
    } catch (err: any) {
      console.error('Failed to fetch annotations:', err);
      setError(err.message || 'Failed to load annotations.');
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId, targetId]);

  useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  const createAnnotation = async (annotation: Omit<Annotation, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt' | 'projectId' | 'parcelId'> & { projectId?: string | null, parcelId?: string | null }) => {
    if (!user) throw new Error("Must be logged in.");
    const id = crypto.randomUUID();
     
    const newAnnotation: Annotation = {
      ...annotation,
      id,
      ownerUid: user.uid,
      projectId: annotation.projectId || null,
      parcelId: annotation.parcelId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
     
    await setDoc(doc(db, 'annotations', id), sanitizeForFirestore(newAnnotation));
    await fetchAnnotations();
    return id;
  };

  const updateAnnotation = async (id: string, updates: Partial<Annotation>) => {
    if (!user) return;
     
    await updateDoc(doc(db, 'annotations', id), sanitizeForFirestore({
      ...updates,
      updatedAt: serverTimestamp()
    }));
    await fetchAnnotations();
  };

  const deleteAnnotation = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'annotations', id));
    await fetchAnnotations();
  };

  return { annotations, isLoading, error, fetchAnnotations, createAnnotation, updateAnnotation, deleteAnnotation };
}
