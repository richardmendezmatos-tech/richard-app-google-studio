import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult as firebaseGetRedirectResult,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig } from '@/services/firebaseConfig';

export const isBrowser = typeof window !== 'undefined';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Full SDK for onSnapshot/real-time
export const dbLite = db; // Alias para retrocompatibilidad, apunta a la misma instancia unificada.
export const functions = getFunctions(app); // Cloud Functions SDK

if (isBrowser) {
  // Best effort: persistence is optional in constrained environments.
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const getRedirectResult = (authInstance: Auth) => firebaseGetRedirectResult(authInstance);
