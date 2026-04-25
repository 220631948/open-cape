import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export function useOSINTVerification() {
  const { user } = useAuth();
  
  const saveVerification = async (
    layerId: string, 
    featureId: string, 
    originalCoords: [number, number], 
    newCoords: [number, number], 
    reason: string
  ) => {
    if (!user) throw new Error("Must be logged in");
    
    // Use a composite ID to easily find it later or overwrites existing override
    const docId = `${layerId}_${featureId}`;
    
    await setDoc(doc(db, 'verified_locations', docId), {
      layerId,
      originalCoords,
      newCoords,
      reason,
      verifiedBy: user.uid,
      verifiedAt: serverTimestamp()
    });
  };

  return { saveVerification };
}
