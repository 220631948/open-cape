import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { setDoc, updateDoc } from '@/lib/safeFirestore';;
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeForFirestore } from '@/lib/firestoreUtils';

export interface Bookmark {
  id: string;
  ownerUid: string;
  label: string;
  type: 'map-state' | 'feature' | 'area' | 'placeholder';
  mapStateRef?: string;
  mapState?: any;
  projectId: string | null;
  featureRef?: any;
  sourceRefs: string[];
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export function useBookmarks(projectId?: string) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      let q = query(
        collection(db, 'bookmarks'),
        where('ownerUid', '==', user.uid)
      );
      if (projectId) {
         q = query(q, where('projectId', '==', projectId));
      }
      
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bookmark));
      data.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
      
      setBookmarks(data);
    } catch (err: any) {
      console.error('Failed to fetch bookmarks:', err);
      setError(err.message || 'Failed to load bookmarks.');
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const createBookmark = async (newBookmark: Omit<Bookmark, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error("Must be logged in.");
    const id = crypto.randomUUID();
    const bookmarkToSave = sanitizeForFirestore({
      ...newBookmark,
      id,
      ownerUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    await setDoc(doc(db, 'bookmarks', id), bookmarkToSave);
    
    await fetchBookmarks();
    return id;
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    if (!user) return;
    await updateDoc(doc(db, 'bookmarks', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    await fetchBookmarks();
  };

  const deleteBookmark = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'bookmarks', id));
    await fetchBookmarks();
  };

  return { bookmarks, isLoading, error, fetchBookmarks, createBookmark, updateBookmark, deleteBookmark };
}
