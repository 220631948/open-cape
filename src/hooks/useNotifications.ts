import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'match_logs'),
      where('ownerUid', '==', user.uid),
      where('read', '==', false)
    );

    return onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, (err) => {
      console.error("Notification listener error:", err);
    });
  }, [user]);

  return { unreadCount };
}
