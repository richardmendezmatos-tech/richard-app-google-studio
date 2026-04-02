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

if (!firebaseConfig.apiKey) {
  console.warn('[Firebase] Warning: API Key is missing. Check your environment variables.');
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Full SDK for onSnapshot/real-time
export const dbLite = db; // Alias para retrocompatibilidad, apunta a la misma instancia unificada.
export const functions = getFunctions(app); // Cloud Functions SDK

if (isBrowser) {
  try {
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error - FIREBASE_APPCHECK_DEBUG_TOKEN is not in the standard Window type
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY || process.env.VITE_RECAPTCHA_KEY;
    if (recaptchaKey && recaptchaKey !== 'dummy_key') {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('[Firebase] App Check initialized with reCAPTCHA v3');
    } else {
      console.warn('[Firebase] App Check skipped: Missing RECAPTCHA_KEY');
    }
  } catch (err) {
    console.warn('Firebase App Check failed to initialize:', err);
  }

  // Best effort: persistence is optional in constrained environments.
  setPersistence(auth, browserLocalPersistence).catch(console.error);
}

export const getRedirectResult = (authInstance: Auth) => firebaseGetRedirectResult(authInstance);
