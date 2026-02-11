import { initializeApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult as firebaseGetRedirectResult,
  type Auth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore/lite';
import { firebaseConfig } from '@/services/firebaseConfig';

export const isBrowser = typeof window !== 'undefined';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (isBrowser) {
  // Best effort: persistence is optional in constrained environments.
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const getRedirectResult = (authInstance: Auth) =>
  firebaseGetRedirectResult(authInstance);
