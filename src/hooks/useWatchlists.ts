import { useState, useEffect } from 'react';
import { collection, query, where, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { setDoc, updateDoc } from '../lib/safeFirestore';
import { useAuth } from '../contexts/AuthContext';

export interface WatchlistFilters {
  minPrice?: number;
  maxPrice?: number;
  zoning?: string;
  allotmentArea?: string;
}

export interface Watchlist {
  id: string;
  ownerUid: string;
  name: string;
  filters: WatchlistFilters;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchLog {
  id: string;
  watchlistId: string;
  ownerUid: string;
  erfNumber: string;
  allotmentArea: string;
  matchedAt: string;
  read: boolean;
}

export function useWatchlists() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [matchLogs, setMatchLogs] = useState<MatchLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWatchlists([]);
      setMatchLogs([]);
      setIsLoading(false);
      return;
    }

    const qw = query(
      collection(db, 'watchlists'),
      where('ownerUid', '==', user.uid)
    );

    const qm = query(
      collection(db, 'match_logs'),
      where('ownerUid', '==', user.uid)
    );

    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(qw, (snap) => {
        setWatchlists(snap.docs.map(d => ({ id: d.id, ...d.data() } as Watchlist)));
      })
    );

    unsubs.push(
      onSnapshot(qm, (snap) => {
        setMatchLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as MatchLog)));
        setIsLoading(false);
      })
    );

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, [user]);

  const createWatchlist = async (name: string, filters: WatchlistFilters) => {
    if (!user) return;
    const newDocParams = {
      ownerUid: user.uid,
      name,
      filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Autoid
    const newDocRef = doc(collection(db, 'watchlists'));
    await setDoc(newDocRef, { ...newDocParams, id: newDocRef.id });
    return newDocRef.id;
  };

  const updateWatchlist = async (id: string, updates: Partial<Watchlist>) => {
    if (!user) return;
    await updateDoc(doc(db, 'watchlists', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteWatchlist = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'watchlists', id));
  };

  const markMatchLogRead = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'match_logs', id), { read: true });
  };

  return {
    watchlists,
    matchLogs,
    isLoading,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    markMatchLogRead,
  };
}
