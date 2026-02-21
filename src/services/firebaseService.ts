import {
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore/lite';
import {
  app,
  auth,
  db,
  isBrowser,
  getRedirectResult
} from '@/infra/firebase/client';
import { Car, Lead, Subscriber } from '@/types/types';
import {
  getAnalyticsService,
  getPerformanceService,
  getStorageService,
  getFunctionsService,
  getRealtimeDbService
} from '@/infra/firebase/optionalServices';
export { optimizeImage, AI_LEGAL_DISCLAIMER } from '@/services/firebaseShared';
export {
  app,
  auth,
  db,
  getRedirectResult,
  getAnalyticsService,
  getPerformanceService,
  getStorageService,
  getFunctionsService,
  getRealtimeDbService
};

// Internal record types for document data before casting
type InventoryRecord = Car;
type LeadRecord = Lead;
type SubscriberRecord = Subscriber;

// Legacy / Backward Compatibility Exports
// Keep these as lazy wrappers to avoid circular ESM initialization between
// firebaseService <-> inventoryService in production bundles.
export const getPaginatedCars = async (...args: Parameters<typeof import('@/app/adapters/inventory/inventoryGateway')['getPaginatedCars']>) => {
  const mod = await import('@/app/adapters/inventory/inventoryGateway');
  return mod.getPaginatedCars(...args);
};

export const addCar = async (...args: Parameters<typeof import('@/app/adapters/inventory/inventoryGateway')['addVehicle']>) => {
  const mod = await import('@/app/adapters/inventory/inventoryGateway');
  return mod.addVehicle(...args);
};

export const updateCar = async (...args: Parameters<typeof import('@/app/adapters/inventory/inventoryGateway')['updateVehicle']>) => {
  const mod = await import('@/app/adapters/inventory/inventoryGateway');
  return mod.updateVehicle(...args);
};

export const deleteCar = async (...args: Parameters<typeof import('@/app/adapters/inventory/inventoryGateway')['deleteVehicle']>) => {
  const mod = await import('@/app/adapters/inventory/inventoryGateway');
  return mod.deleteVehicle(...args);
};

export const incrementCarView = async (...args: Parameters<typeof import('@/app/adapters/inventory/inventoryGateway')['incrementCarView']>) => {
  const mod = await import('@/app/adapters/inventory/inventoryGateway');
  return mod.incrementCarView(...args);
};

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
      } as InventoryRecord));
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

export const getInventoryOnce = async (): Promise<Car[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'cars'), where('dealerId', '==', dealerId), limit(100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car));
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
      const leadsList: LeadRecord[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LeadRecord));
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

export const getLeadsOnce = async (): Promise<Lead[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = query(collection(db, 'applications'), where('dealerId', '==', dealerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
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
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubscriberRecord));
};
