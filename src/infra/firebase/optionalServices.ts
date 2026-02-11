import { app, isBrowser } from '@/infra/firebase/client';

let analyticsPromise: Promise<unknown | null> | null = null;
let performancePromise: Promise<unknown | null> | null = null;
let storagePromise: Promise<unknown> | null = null;
let functionsPromise: Promise<unknown> | null = null;
let realtimeDbPromise: Promise<unknown> | null = null;

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
