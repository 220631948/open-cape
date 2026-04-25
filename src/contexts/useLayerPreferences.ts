import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/contexts/AuthContext';

export interface LayerPreferences {
  uid: string;
  defaultViews: string[]; // array of layer IDs or names
  opacities?: Record<string, number>;
  createdAt?: any;
  updatedAt?: any;
}

export function useLayerPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<LayerPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadPreferences() {
      if (!user) {
        if (isMounted) {
          setPreferences(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const prefRef = doc(db, 'layer_preferences', user.uid);
        const snap = await getDoc(prefRef);
        
        if (snap.exists()) {
          if (isMounted) setPreferences(snap.data() as LayerPreferences);
        } else {
          // Initialize if it doesn't exist
          const newPrefs: LayerPreferences = {
            uid: user.uid,
            defaultViews: [],
            opacities: {}
          };
          await setDoc(prefRef, {
            ...newPrefs,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          if (isMounted) setPreferences(newPrefs);
        }
      } catch (err: any) {
        console.error("Error loading layer preferences:", err);
        if (isMounted) setError(err.message || "Failed to load layer preferences");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPreferences();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const updatePreferences = async (updates: Partial<LayerPreferences>) => {
    if (!user) throw new Error("Must be logged in to update layer preferences");
    
    const prefRef = doc(db, 'layer_preferences', user.uid);
    await updateDoc(prefRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    setPreferences(prev => prev ? { ...prev, ...updates } : null);
  };

  return { preferences, loading, error, updatePreferences };
}
