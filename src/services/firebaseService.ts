import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence, getRedirectResult as firebaseGetRedirectResult } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  getAggregateFromServer,
  getCountFromServer,
  initializeFirestore,
  enableMultiTabIndexedDbPersistence,
  count,
  sum,
  average,
  doc,
  setDoc,
  writeBatch,
  increment
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getPerformance } from "firebase/performance";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "@/services/firebaseConfig";

// Helper for environment checks
const isBrowser = typeof window !== 'undefined';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services with proper exports
export const auth = getAuth(app);
export const db = initializeFirestore(app, {});
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const rtdb = getDatabase(app);

// Initialize optional services
let analyticsInstance = null;
let performanceInstance = null;

if (isBrowser) {
  try {
    analyticsInstance = getAnalytics(app);
    performanceInstance = getPerformance(app);

    // Auth Persistence
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    // Firestore Persistence
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      console.warn("Firestore persistence error:", err.code);
    });
  } catch (e) {
    console.warn("Firebase optional services failed to initialize:", e);
  }
}

export const analytics = analyticsInstance;
export const performance = performanceInstance;

// Re-export Auth utilities
export const getRedirectResult = (authInstance: any) => firebaseGetRedirectResult(authInstance);

// Legacy / Backward Compatibility Exports
export { getPaginatedCars } from '@/features/inventory/services/inventoryService';
export { addVehicle as addCar, updateVehicle as updateCar, deleteVehicle as deleteCar, incrementCarView } from '@/features/inventory/services/inventoryService';

// --- Application Logic ---

export const uploadImage = async (file: File) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const storageRef = ref(storage, `${dealerId}/profiles/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export const getInventoryStats = async () => {
  const coll = collection(db, 'cars');
  try {
    const countSnapshot = await getCountFromServer(coll);
    const aggregationSnapshot = await getAggregateFromServer(coll, {
      totalValue: sum('price'),
      avgPrice: average('price')
    });

    return {
      count: countSnapshot.data().count,
      totalValue: aggregationSnapshot.data().totalValue || 0,
      avgPrice: aggregationSnapshot.data().avgPrice || 0
    };
  } catch (e) {
    console.error("Aggregation failed:", e);
    return { count: 0, totalValue: 0, avgPrice: 0 };
  }
};

export const syncInventory = (callback: (inventory: any[]) => void) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'cars'), where('dealerId', '==', dealerId));

  return onSnapshot(q, snapshot => {
    const inventoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    inventoryList.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
    callback(inventoryList);
  }, (error) => {
    console.error("syncInventory Error:", error);
  });
};

export const getInventoryOnce = async (): Promise<any[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'cars'), where('dealerId', '==', dealerId), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// CTO Fix: Antigravity Edge Image Optimization (Next-Gen Performance)
export const optimizeImage = (url: string, width: number = 800): string => {
  if (!url) return '';
  if (url.includes('firebasestorage.googleapis.com')) return url;
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?q=80&w=${width}&auto=format&fit=crop`;
  }
  return url;
};

export const submitApplication = async (data: any) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const safeData = {
    ...data,
    dealerId,
    timestamp: new Date(),
    status: 'new'
  };
  return await addDoc(collection(db, 'applications'), safeData);
};

export const AI_LEGAL_DISCLAIMER = "Aviso: Los precios, pagos y disponibilidad generados por IA son estimaciones para fines informativos y no constituyen una oferta formal. Sujeto a cambios sin previo aviso.";

export const syncLeads = (callback: (leads: any[]) => void) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'applications'), where('dealerId', '==', dealerId));
  return onSnapshot(q, snapshot => {
    const leadsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(leadsList);
  });
};

export const getLeadsOnce = async (): Promise<any[]> => {
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

export const submitSurvey = async (data: any) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  return await addDoc(collection(db, 'surveys'), { ...data, dealerId, timestamp: serverTimestamp() });
};

export const getSubscribers = async (): Promise<any[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'subscribers'), where('dealerId', '==', dealerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
