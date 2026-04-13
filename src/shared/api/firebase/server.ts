import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig } from '@/shared/api/firebase/firebaseConfig';

// Sentinel N23: Ensure this ONLY runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Firebase Server Bridge should never be imported on the client side.');
}

// Initialize Firebase for Server-Side (No persistence, no App Check)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Use this for any logic that runs in Next.js Server Components or API Routes
export { app };
