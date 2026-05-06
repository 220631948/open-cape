import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useEarthEngineAccess() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      if (mounted) {
        setHasAccess(false);
        setIsChecking(false);
      }
      return;
    }

    if (mounted) {
      // For this slice, we assume signed-in users represent enabled accounts
      setHasAccess(true);
      setIsChecking(false);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  return { hasAccess, isChecking };
}
