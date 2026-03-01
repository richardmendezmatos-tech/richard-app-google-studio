import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult as firebaseGetRedirectResult,
  type Auth,
} from 'firebase/auth';
import { getFirestore as getFirestoreLite } from 'firebase/firestore/lite';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig } from '@/services/firebaseConfig';

export const isBrowser = typeof window !== 'undefined';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbLite = getFirestoreLite(app); // Fast, small, for write/once operations
export const db = getFirestore(app); // Full SDK for onSnapshot/real-time
export const functions = getFunctions(app); // Cloud Functions SDK

if (isBrowser) {
  // Best effort: persistence is optional in constrained environments.
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const getRedirectResult = (authInstance: Auth) => firebaseGetRedirectResult(authInstance);
