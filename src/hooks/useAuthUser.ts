import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthUserChanged } from '@/lib/firebase';

/**
 * A custom hook to access the current authenticated user.
 * This is a lightweight alternative to using a full Context if preferred,
 * but often used in conjunction with one.
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}
