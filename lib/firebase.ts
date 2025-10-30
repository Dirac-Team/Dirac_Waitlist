import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Firebase config is missing required fields. Check your .env.local file.");
}

// Initialize Firebase (lazy initialization)
function getApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

// Initialize Firestore (lazy initialization)
let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) {
    const app = getApp();
    _db = getFirestore(app);
  }
  return _db;
}

// Export db for backward compatibility
export const db = getDb();
export default getApp();
