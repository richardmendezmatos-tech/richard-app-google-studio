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
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig } from '@/shared/api/firebase/firebaseConfig';

export const isBrowser = typeof window !== 'undefined';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Full SDK for onSnapshot/real-time
export const dbLite = db; // Alias para retrocompatibilidad, apunta a la misma instancia unificada.
export const functions = getFunctions(app); // Cloud Functions SDK

if (isBrowser) {
  try {
    if (import.meta.env.DEV) {
      // @ts-expect-error - FIREBASE_APPCHECK_DEBUG_TOKEN is not in the standard Window type
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_KEY || 'dummy_key'),
      isTokenAutoRefreshEnabled: true
    });
  } catch (err) {
    console.warn("Firebase App Check failed to initialize:", err);
  }

  // Best effort: persistence is optional in constrained environments.
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const getRedirectResult = (authInstance: Auth) => firebaseGetRedirectResult(authInstance);
