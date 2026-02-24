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
  dbLite,
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
import { FirestoreLeadRepository } from '@/infra/repositories/FirestoreLeadRepository';
export { optimizeImage, AI_LEGAL_DISCLAIMER } from '@/services/firebaseShared';
export {
  app,
  auth,
  db,
  dbLite,
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

import { container } from '@/infra/di/container';

// --- Application Logic (Delegated to Repositories via DI) ---

export const uploadImage = async (file: File) => {
  return await container.getStorageRepository().uploadImage(file);
};

export const getInventoryStats = async () => {
  // Logic remains here for now as it's an aggregation across a collection,
  // but we should eventually move it to InventoryRepository.
  try {
    const coll = collection(db, 'cars');
    const snapshot = await getDocs(coll);
    const prices = snapshot.docs
      .map((d) => Number((d.data() as { price?: number }).price || 0))
      .filter((value) => Number.isFinite(value));
    const count = snapshot.size;
    const totalValue = prices.reduce((acc, value) => acc + value, 0);
    const avgPrice = count > 0 ? totalValue / count : 0;

    return { count, totalValue, avgPrice };
  } catch (e) {
    console.error("Aggregation failed:", e);
    return { count: 0, totalValue: 0, avgPrice: 0 };
  }
};

import { onSnapshot, collection as fullCollection, query as fullQuery, where as fullWhere, limit as fullLimit } from 'firebase/firestore';

export const syncInventory = (callback: (inventory: InventoryRecord[]) => void) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = fullQuery(fullCollection(db, 'cars'), fullWhere('dealerId', '==', dealerId), fullLimit(100));

  return onSnapshot(q, (snapshot) => {
    const inventoryList: InventoryRecord[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryRecord));
    inventoryList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(inventoryList);
  }, (error) => {
    console.error("syncInventory Error:", error);
  });
};

export const getInventoryOnce = async (): Promise<Car[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  return await container.getGetInventoryUseCase().execute(dealerId);
};

export const submitApplication = async (data: Record<string, unknown>) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  return await container.getApplicationRepository().submitApplication(data, dealerId);
};

export const syncLeads = (callback: (leads: LeadRecord[]) => void) => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const q = fullQuery(fullCollection(db, 'applications'), fullWhere('dealerId', '==', dealerId), fullLimit(200));

  return onSnapshot(q, (snapshot) => {
    const leadsList: LeadRecord[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    callback(leadsList);
  }, (error) => {
    console.error('syncLeads Error:', error);
  });
};

export const getLeadsOnce = async (): Promise<Lead[]> => {
  const dealerId = (isBrowser ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  return await container.getGetLeadsUseCase().execute(dealerId, 200);
};

export const updateLeadStatus = async (leadId: string, newStatus: string) => {
  await container.getLeadRepository().updateLead(leadId, { status: newStatus as any });
};

export const subscribeToNewsletter = async (email: string) => {
  await container.getSubscriberRepository().subscribe(email);
};

export const submitSurvey = async (data: Record<string, unknown>) => {
  await container.getSurveyRepository().submitSurvey(data);
};

export const getSubscribers = async (): Promise<SubscriberRecord[]> => {
  return await container.getSubscriberRepository().getSubscribers() as SubscriberRecord[];
};
