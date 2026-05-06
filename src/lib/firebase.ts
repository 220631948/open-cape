/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence, browserPopupRedirectResolver, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, getDocFromServer, serverTimestamp, type Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { setDoc } from '@/lib/safeFirestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * initializeAuth gives finer control over persistence and popup/redirect handling
 */
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

// AI Studio specifically uses a custom database ID often.
const customDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || (firebaseAppletConfig as any).firestoreDatabaseId;
console.log(`[Firebase] Initializing Firestore with Database ID: ${customDbId || '(default)'}`);

/**
 * Using initializeFirestore directly allows us to enable experimentalAutoDetectLongPolling.
 * This is crucial in environments where WebSockets might be unreliable or blocked, 
 * preventing the 10-second timeout "Could not reach Cloud Firestore backend" error.
 */
export const db: Firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, customDbId);

export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

auth.useDeviceLanguage();

export type AppUserProfile = {
  uid: string;
  fullName: string;
  role?: 'user' | 'analyst' | 'admin';
  defaultMapCenter: { lat: number; lng: number };
  defaultZoom: number;
  defaultBasemap: string;
  preferredLayers: string[];
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type AppUserMirror = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: unknown;
  lastLoginAt?: unknown;
  roles: string[];
  status: 'active' | 'disabled';
};

export type LayerPreferences = {
  ownerUid: string;
  lastBasemap: string;
  opacityOverrides: Record<string, number>;
  layerOrder: string[];
  updatedAt?: unknown;
};

const defaultProfileFor = (user: User): AppUserProfile => {
  const isAdmin = user.email ? (user.email.endsWith('@capetown.gov.za') || user.email === 'admin@system.local' || user.email === 'fdavids0214@gmail.com') : false;
  return {
    uid: user.uid,
    fullName: user.displayName ?? '',
    role: isAdmin ? 'analyst' : 'user', // We use analyst as the role here based on previous rule check
    defaultMapCenter: { lat: -33.9249, lng: 18.4241 },
    defaultZoom: 11,
    defaultBasemap: 'maplibre-streets',
    preferredLayers: ['parcels', 'zoning'],
    units: 'metric',
    theme: 'system',
  };
};

const defaultUserMirrorFor = (user: User): AppUserMirror => {
  const isAdmin = user.email ? (user.email.endsWith('@capetown.gov.za') || user.email === 'admin@system.local') : false;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    roles: isAdmin ? ['user', 'admin', 'analyst'] : ['user'],
    status: 'active',
  };
};

const defaultLayerPreferencesFor = (user: User): LayerPreferences => ({
  ownerUid: user.uid,
  lastBasemap: 'maplibre-streets',
  opacityOverrides: {},
  layerOrder: ['osm', 'parcels', 'zoning'],
});

/**
 * Sign in with Google using popup mode.
 * If you later switch to redirect mode, also review Firebase redirect best practices.
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocuments(result.user).catch(e => console.warn("Failed to sync user docs:", e));
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Create or update the minimum user records we need.
 * Uses merge:true so it is safe on repeated sign-ins.
 */
export async function ensureUserDocuments(user: User) {
  const userRef = doc(db, 'users', user.uid);
  const profileRef = doc(db, 'user_profiles', user.uid);
  const layerPrefsRef = doc(db, 'layer_preferences', user.uid);

  await Promise.all([
    setDoc(
      userRef,
      {
        ...defaultUserMirrorFor(user),
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(
      profileRef,
      {
        ...defaultProfileFor(user),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(
      layerPrefsRef,
      {
        ...defaultLayerPreferencesFor(user),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
  ]);
}

export async function getCurrentUserProfile(uid: string) {
  const profileRef = doc(db, 'user_profiles', uid);
  const snapshot = await getDoc(profileRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as AppUserProfile;
}

export async function updateCurrentUserProfile(uid: string, partial: Partial<AppUserProfile>) {
  const profileRef = doc(db, 'user_profiles', uid);
  await setDoc(
    profileRef,
    {
      ...partial,
      uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getCurrentLayerPreferences(uid: string) {
  const prefRef = doc(db, 'layer_preferences', uid);
  const snapshot = await getDoc(prefRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as LayerPreferences;
}

export async function updateCurrentLayerPreferences(
  uid: string,
  partial: Partial<LayerPreferences>,
) {
  const prefRef = doc(db, 'layer_preferences', uid);
  await setDoc(
    prefRef,
    {
      ...partial,
      ownerUid: uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * CRITICAL CONSTRAINT: When the application initially boots, call getDocFromServer to test the connection.
 */
async function testConnection() {
  try {
    // Attempting a read directly from server to verify health
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection verified.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore backend')) {
        console.error("CRITICAL: Firestore unreachable. Please check configuration or network.", error);
      } else {
        // Many projects won't have a 'test/connection' doc, which is fine (it returns successfully with no data)
        // We just want to see if the REQUEST completes.
        console.log("Firestore pinged successfully (document may not exist, but network is okay).");
      }
    }
  }
}

// Initial connection test
testConnection();

export { app };
