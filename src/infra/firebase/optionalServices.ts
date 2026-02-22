import { app, isBrowser } from '@/infra/firebase/client';

import type { Analytics } from 'firebase/analytics';
import type { FirebasePerformance } from 'firebase/performance';
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';
import type { Database } from 'firebase/database';

let analyticsPromise: Promise<Analytics | null> | null = null;
let performancePromise: Promise<FirebasePerformance | null> | null = null;
let storagePromise: Promise<FirebaseStorage> | null = null;
let functionsPromise: Promise<Functions> | null = null;
let realtimeDbPromise: Promise<Database> | null = null;

export const getAnalyticsService = async () => {
  if (!isBrowser) return null;
  if (!analyticsPromise) {
    analyticsPromise = import('firebase/analytics')
      .then(async ({ getAnalytics, isSupported }) => {
        const supported = await isSupported().catch(() => false);
        return supported ? getAnalytics(app) : null;
      })
      .catch(() => null);
  }
  return analyticsPromise;
};

export const getPerformanceService = async () => {
  if (!isBrowser) return null;
  if (!performancePromise) {
    performancePromise = import('firebase/performance')
      .then(({ getPerformance }) => getPerformance(app))
      .catch(() => null);
  }
  return performancePromise;
};

export const getStorageService = async () => {
  if (!storagePromise) {
    storagePromise = import('firebase/storage').then(({ getStorage }) => getStorage(app));
  }
  return storagePromise;
};

export const getFunctionsService = async () => {
  if (!functionsPromise) {
    functionsPromise = import('firebase/functions').then(({ getFunctions }) => getFunctions(app));
  }
  return functionsPromise;
};

export const getRealtimeDbService = async () => {
  if (!realtimeDbPromise) {
    realtimeDbPromise = import('firebase/database').then(({ getDatabase }) => getDatabase(app));
  }
  return realtimeDbPromise;
};
