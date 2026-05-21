import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
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

const isConfigured = (): boolean => Boolean(config.apiKey && config.projectId);

if (FIREBASE_LOGS_ENABLED) {
  console.log("[firebase] env check:", {
    hasApiKey: Boolean(config.apiKey),
    hasProjectId: Boolean(config.projectId),
    projectId: config.projectId,
    authDomain: config.authDomain,
  });
}

export const getDb = (): Firestore | null => {
  if (!isConfigured()) {
    if (FIREBASE_LOGS_ENABLED) {
      console.warn("[firebase] not configured — VITE_FIREBASE_API_KEY or VITE_FIREBASE_PROJECT_ID missing. Falling back to localStorage.");
    }
    return null;
  }
  if (!appInstance) {
    if (FIREBASE_LOGS_ENABLED) {
      console.log("[firebase] initializing app for project:", config.projectId);
    }
    appInstance = initializeApp(config);
  }
  if (!dbInstance) dbInstance = getFirestore(appInstance);
  return dbInstance;
};
