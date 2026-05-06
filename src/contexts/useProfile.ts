import { useState, useEffect } from 'react';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { updateDoc } from '@/lib/safeFirestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
  uid: string;
  fullName: string | null;
  role?: 'user' | 'analyst' | 'admin' | 'owner' | 'viewer' | string;
  tenantId?: string;
  defaultMapCenter: { lat: number; lng: number };
  defaultZoom: number;
  defaultBasemap: string;
  preferredLayers?: string[]; // Kept for backwards compatibility but we will use LayerPreferences collection
  theme: string;
  notificationPreferences?: {
    emailAlerts: boolean;
    productUpdates: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadProfile() {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const profileRef = doc(db, 'user_profiles', user.uid);
        const snap = await getDoc(profileRef);
        
        if (snap.exists()) {
          if (isMounted) setProfile(snap.data() as UserProfile);
        } else {
          // Fallback if not created by auth sync yet
          if (isMounted) setProfile(null);
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        if (isMounted) setError(err.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("Must be logged in to update profile");
    
    const profileRef = doc(db, 'user_profiles', user.uid);
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  return { profile, loading, error, updateProfile };
}
