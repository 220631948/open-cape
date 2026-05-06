import { doc, serverTimestamp } from 'firebase/firestore';
import { setDoc, updateDoc } from '@/lib/safeFirestore';
import { db } from '../lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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
    
    // Create verification record
    const docId = `${layerId}_${featureId}`;
    await setDoc(doc(db, 'verified_locations', docId), {
      layerId,
      originalCoords,
      newCoords,
      reason,
      verifiedBy: user.uid,
      verifiedAt: serverTimestamp()
    });

    // Attempt to update the imported feature's properties if it exists.
    // If it fails, that means we don't have write access or it's not an imported feature (e.g. vector tile).
    try {
      const featureRef = doc(db, 'importedGeoJsonLayers', layerId, 'features', featureId);
      await updateDoc(featureRef, {
        'properties.verification_status': 'pending_review',
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Could not update original feature verification_status. It might be read-only or an external tileset.", e);
    }
  };

  return { saveVerification };
}

