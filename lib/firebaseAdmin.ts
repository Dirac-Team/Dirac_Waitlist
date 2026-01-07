import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

function initAdminApp() {
  if (getApps().length) return getApps()[0]!;

  // Option A: single JSON env var (recommended)
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    return initializeApp({ credential: cert(parsed) });
  }

  // Option B: split env vars
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  // Option C: platform-provided credentials (rare in Netlify; useful in GCP)
  return initializeApp({ credential: applicationDefault() });
}

let _adminDb: Firestore | null = null;

export function getAdminDb(): Firestore {
  if (_adminDb) return _adminDb;
  initAdminApp();
  _adminDb = getFirestore();
  return _adminDb;
}


