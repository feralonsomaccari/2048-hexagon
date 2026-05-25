import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { FIREBASE_LOGS_ENABLED } from "../config/gameConfig";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let dbPromise: Promise<Firestore | null> | null = null;

// Synchronous check so callers can decide whether to bother loading the SDK
// (and surface "remote vs local" state) without pulling Firebase into the main bundle.
export const isFirebaseConfigured = (): boolean =>
  Boolean(config.apiKey && config.projectId);

if (FIREBASE_LOGS_ENABLED) {
  console.log("[firebase] env check:", {
    hasApiKey: Boolean(config.apiKey),
    hasProjectId: Boolean(config.projectId),
    projectId: config.projectId,
    authDomain: config.authDomain,
  });
}

// Lazily loads the Firebase SDK via dynamic import so it is code-split into its
// own chunk and kept off the critical path. Resolves to null when not configured.
export const getDb = async (): Promise<Firestore | null> => {
  if (!isFirebaseConfigured()) {
    if (FIREBASE_LOGS_ENABLED) {
      console.warn("[firebase] not configured — VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID missing. Falling back to localStorage.");
    }
    return null;
  }
  if (dbInstance) return dbInstance;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const [{ initializeApp }, { getFirestore }] = await Promise.all([
      import("firebase/app"),
      import("firebase/firestore"),
    ]);
    if (!appInstance) {
      if (FIREBASE_LOGS_ENABLED) {
        console.log("[firebase] initializing app for project:", config.projectId);
      }
      appInstance = initializeApp(config);
    }
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  })();

  return dbPromise;
};
