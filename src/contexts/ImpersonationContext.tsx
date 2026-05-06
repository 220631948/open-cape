import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

interface ImpersonationContextType {
  isImpersonating: boolean;
  impersonatingAdminUid: string | null;
  impersonateUser: (targetUid: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  error: string | null;
}

const ImpersonationContext = createContext<ImpersonationContextType | null>(null);

export const ImpersonationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [impersonatingAdminUid, setImpersonatingAdminUid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check ID token on mount or auth change to see if we're currently impersonating
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        try {
          const result = await user.getIdTokenResult();
          if (result.claims.impersonatedBy) {
            setIsImpersonating(true);
            setImpersonatingAdminUid(result.claims.impersonatedBy as string);
          } else {
            setIsImpersonating(false);
            setImpersonatingAdminUid(null);
          }
        } catch (e) {
          console.error("Error reading token claims:", e);
        }
      } else {
        setIsImpersonating(false);
        setImpersonatingAdminUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const impersonateUser = async (targetUid: string) => {
    setError(null);
    try {
      if (!auth.currentUser) throw new Error("Must be logged in to impersonate");
      const idToken = await auth.currentUser.getIdToken();
      
      const res = await fetch('/api/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ targetUid })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to impersonate");
      
      await signInWithCustomToken(auth, data.customToken);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  };

  const stopImpersonation = async () => {
    setError(null);
    try {
      if (!auth.currentUser) throw new Error("Not logged in");
      const idToken = await auth.currentUser.getIdToken();
      
      const res = await fetch('/api/stop-impersonation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to stop impersonation");
      
      await signInWithCustomToken(auth, data.customToken);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <ImpersonationContext.Provider value={{
      isImpersonating,
      impersonatingAdminUid,
      impersonateUser,
      stopImpersonation,
      error
    }}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) throw new Error('useImpersonation must be used inside ImpersonationProvider');
  return ctx;
};
