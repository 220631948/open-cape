import React, { createContext, useContext, useState, useEffect } from 'react';

interface ImpersonationContextType {
  impersonatedUid: string | null;
  setImpersonatedUid: (uid: string | null) => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | null>(null);

export const ImpersonationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [impersonatedUid, setImpersonatedUid] = useState<string | null>(() => {
    return sessionStorage.getItem('impersonatedUid');
  });

  useEffect(() => {
    if (impersonatedUid) {
      sessionStorage.setItem('impersonatedUid', impersonatedUid);
    } else {
      sessionStorage.removeItem('impersonatedUid');
    }
  }, [impersonatedUid]);

  return (
    <ImpersonationContext.Provider value={{ impersonatedUid, setImpersonatedUid }}>
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => {
  const ctx = useContext(ImpersonationContext);
  if (!ctx) throw new Error('useImpersonation must be used inside ImpersonationProvider');
  return ctx;
};
