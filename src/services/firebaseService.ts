import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, getRedirectResult as firebaseGetRedirectResult, type Auth } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  getFirestore,
  doc,
  setDoc
} from 'firebase/firestore/lite';
import { firebaseConfig } from "@/services/firebaseConfig";
export { optimizeImage, AI_LEGAL_DISCLAIMER } from '@/services/firebaseShared';

// Helper for environment checks
const isBrowser = typeof window !== 'undefined';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Services with proper exports
export const auth = getAuth(app);
export const db = getFirestore(app);

// Lazy-loaded optional services
let analyticsPromise: Promise<unknown | null> | null = null;
let performancePromise: Promise<unknown | null> | null = null;
let storagePromise: Promise<unknown> | null = null;
let functionsPromise: Promise<unknown> | null = null;
let realtimeDbPromise: Promise<unknown> | null = null;

type InventoryRecord = { id: string; name?: string } & Record<string, unknown>;
type LeadRecord = { id: string } & Record<string, unknown>;
type SubscriberRecord = { id: string } & Record<string, unknown>;

if (isBrowser) {
  try {
    // Auth Persistence
    setPersistence(auth, browserLocalPersistence).catch(console.error);
  } catch (e) {
    console.warn("Firebase optional services failed to initialize:", e);
  }
}

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

// Re-export Auth utilities
export const getRedirectResult = (authInstance: Auth) => firebaseGetRedirectResult(authInstance);

// Legacy / Backward Compatibility Exports
export { getPaginatedCars } from '@/features/inventory/services/inventoryService';
export { addVehicle as addCar, updateVehicle as updateCar, deleteVehicle as deleteCar, incrementCarView } from '@/features/inventory/services/inventoryService';

// --- Application Logic ---

export const uploadImage = async (file: File) => {
  const storage = await getStorageService();
  const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const storageRef = ref(storage, `${dealerId}/profiles/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const getInventoryStats = async () => {
  try {
    const coll = collection(db, 'cars');
    const snapshot = await getDocs(coll);
    const prices = snapshot.docs
      .map((d) => Number((d.data() as { price?: number }).price || 0))
      .filter((value) => Number.isFinite(value));
    const count = snapshot.size;
    const totalValue = prices.reduce((acc, value) => acc + value, 0);
    const avgPrice = count > 0 ? totalValue / count : 0;

    return {
      count,
      totalValue,
      avgPrice
    };
  } catch (e) {
    console.error("Aggregation failed:", e);
    return { count: 0, totalValue: 0, avgPrice: 0 };
  }
};

export const syncInventory = (callback: (inventory: InventoryRecord[]) => void) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'cars'), where('dealerId', '==', dealerId), limit(100));

  let cancelled = false;
  const fetchInventory = async () => {
    try {
      const snapshot = await getDocs(q);
      if (cancelled) return;
      const inventoryList: InventoryRecord[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      inventoryList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      callback(inventoryList);
    } catch (error) {
      console.error("syncInventory Error:", error);
    }
  };

  fetchInventory();
  const intervalId = setInterval(fetchInventory, 10000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
};

export const getInventoryOnce = async (): Promise<InventoryRecord[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'cars'), where('dealerId', '==', dealerId), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const submitApplication = async (data: Record<string, unknown>) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const safeData = {
    ...data,
    dealerId,
    timestamp: new Date(),
    status: 'new'
  };
  return await addDoc(collection(db, 'applications'), safeData);
};

export const syncLeads = (callback: (leads: LeadRecord[]) => void) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'applications'), where('dealerId', '==', dealerId), limit(200));
  let cancelled = false;

  const fetchLeads = async () => {
    try {
      const snapshot = await getDocs(q);
      if (cancelled) return;
      const leadsList: LeadRecord[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(leadsList);
    } catch (error) {
      console.error('syncLeads Error:', error);
    }
  };

  fetchLeads();
  const intervalId = setInterval(fetchLeads, 10000);

  return () => {
    cancelled = true;
    clearInterval(intervalId);
  };
};

export const getLeadsOnce = async (): Promise<LeadRecord[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'applications'), where('dealerId', '==', dealerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateLeadStatus = async (leadId: string, newStatus: string) => {
  const leadRef = doc(db, 'applications', leadId);
  await setDoc(leadRef, { status: newStatus }, { merge: true });
};

export const subscribeToNewsletter = async (email: string) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  await addDoc(collection(db, "subscribers"), { email, dealerId, timestamp: serverTimestamp() });
};

export const submitSurvey = async (data: Record<string, unknown>) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  return await addDoc(collection(db, 'surveys'), { ...data, dealerId, timestamp: serverTimestamp() });
};

export const getSubscribers = async (): Promise<SubscriberRecord[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'subscribers'), where('dealerId', '==', dealerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
