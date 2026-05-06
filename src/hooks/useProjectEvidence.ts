import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { setDoc } from '@/lib/safeFirestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface ProjectEvidence {
  id: string;
  projectId: string;
  ownerUid: string;
  type: 'image' | 'document' | 'video';
  url: string;
  thumbnailUrl?: string;
  caption: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: any;
  updatedAt: any;
}

export function useProjectEvidence(projectId?: string) {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<ProjectEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = useCallback(async () => {
    if (!user || !projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'project_evidence'),
        where('projectId', '==', projectId),
        where('ownerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setEvidence(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectEvidence)));
    } catch (err: any) {
      console.error('Failed to fetch evidence:', err);
      // Fallback for missing index
      if (err.message.includes('index')) {
        const q2 = query(
          collection(db, 'project_evidence'),
          where('projectId', '==', projectId),
          where('ownerUid', '==', user.uid)
        );
        const snap = await getDocs(q2);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectEvidence));
        data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setEvidence(data);
      } else {
        setError(err.message || 'Failed to load evidence.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const addEvidence = async (data: Omit<ProjectEvidence, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt' | 'projectId'>) => {
    if (!user || !projectId) throw new Error("Missing context.");
    const id = crypto.randomUUID();
    const newEvidence: ProjectEvidence = {
      ...data,
      id,
      projectId,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'project_evidence', id), newEvidence);
    await fetchEvidence();
    return id;
  };

  const deleteEvidence = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'project_evidence', id));
    await fetchEvidence();
  };

  return { evidence, isLoading, error, addEvidence, deleteEvidence, fetchEvidence };
}
