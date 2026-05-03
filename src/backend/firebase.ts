import * as admin from 'firebase-admin';

// Lazy initialize Firebase Admin to avoid crashes if credentials aren't set in environment
let adminApp: admin.app.App | null = null;

export function getAdminApp() {
  if (!adminApp) {
    // Check if we are running with credentials or if we should just use default (can fail if not on GCP)
    try {
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    } catch (error) {
      console.warn("Could not initialize Firebase Admin SDK. Please ensure GOOGLE_APPLICATION_CREDENTIALS are set.", error);
    }
  }
  return adminApp;
}

export function getDb() {
  const app = getAdminApp();
  if (!app) throw new Error("Firebase Admin not initialized.");
  return app.firestore();
}
