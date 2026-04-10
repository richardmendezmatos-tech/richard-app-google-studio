import {
  listCars,
  getCar,
  createCar,
  CreateCarVariables,
  ListCarsVariables,
} from '@dataconnect/generated';
import { getStorageService, getAnalyticsService } from '@/shared/api/firebase/optionalServices';
import { Car } from '../../model/types';
import { carSchema } from '@/shared/lib/validators/car.schema';

export interface PaginatedResult {
  cars: Car[];
  nextOffset: number | null;
  hasMore: boolean;
}

// --- Data Fetching ---

export const getPaginatedCars = async (
  pageSize: number = 9,
  offset: number = 0,
  filterType: string = 'all',
  sortOrder: 'asc' | 'desc' | null = null,
): Promise<PaginatedResult> => {
  let dealerId = typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null;
  if (!dealerId || dealerId === 'undefined' || dealerId === 'null') {
    dealerId = 'richard-automotive';
  }

  try {
    const vars: ListCarsVariables = {
      limit: pageSize,
      offset,
      dealerId,
    };
    
    const response = await listCars(vars);
    const cars = response.data.cars.map((c) => ({
      ...c,
      name: `${c.make} ${c.model} ${c.year}`,
      status: (c.status as 'available' | 'reserved' | 'sold') || 'available',
    })) as unknown as Car[];

    return {
      cars,
      nextOffset: response.data.cars.length === pageSize ? offset + pageSize : null,
      hasMore: response.data.cars.length === pageSize,
    };
  } catch (e: any) {
    console.error('[DataConnect] Pagination Error:', e);
    throw e;
  }
};

export const getCarById = async (id: string): Promise<Car | null> => {
  try {
    const response = await getCar({ id });
    if (!response.data.car) return null;
    
    const c = response.data.car;
    return {
      ...c,
      name: `${c.make} ${c.model} ${c.year}`,
      status: (c.status as 'available' | 'reserved' | 'sold') || 'available',
    } as unknown as Car;
  } catch (error) {
    console.error('[DataConnect] Error fetching car:', error);
    return null;
  }
};

// --- CRUD Operations (Admin) ---

export const addVehicle = async (carData: Omit<Car, 'id'>): Promise<string> => {
  const currentDealerId = (typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';

  const validatedData = carSchema.parse({
    ...carData,
    dealerId: currentDealerId,
    views: 0,
    leadsCount: 0,
  });

  const response = await createCar({
    ...validatedData,
    year: validatedData.year || new Date().getFullYear(),
    make: validatedData.make || 'Universal',
    model: validatedData.model || 'Generic',
    name: validatedData.name,
    price: validatedData.price,
    mileage: validatedData.mileage || 0,
    type: validatedData.type,
    category: 'standard', // Default for now
    condition: 'used', // Default for now
    img: validatedData.img,
    dealerId: currentDealerId,
    featured: validatedData.featured || false,
  });

  return response.data.car_insert.id;
};

export const updateVehicle = async (id: string, updates: Partial<Car>) => {
  const validatedUpdates = carSchema.partial().parse(updates);

  const docRef = doc(db, CARS_COLLECTION, id);
  await updateDoc(docRef, {
    ...validatedUpdates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteVehicle = async (id: string) => {
  await deleteDoc(doc(db, CARS_COLLECTION, id));
};

export const uploadInitialInventory = async (inventory: Omit<Car, 'id'>[]) => {
  const currentDealerId = (typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';
  const batch = writeBatch(db);

  inventory.forEach((car) => {
    // Create an idempotent ID: brand-model-year slug
    const idSlug = `${car.name}-${car.year}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const carRef = doc(db, CARS_COLLECTION, idSlug);
    batch.set(
      carRef,
      {
        ...car,
        dealerId: currentDealerId,
        updatedAt: serverTimestamp(),
        // Only set createdAt if it doesn't exist (handled by set with merge if needed,
        // but for initial seeding we want to ensure we don't duplicate)
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  await batch.commit();
};

// --- Metrics & Analytics ---

export const incrementCarView = async (carId: string) => {
  const carRef = doc(db, CARS_COLLECTION, carId);
  await setDoc(carRef, { views: increment(1) }, { merge: true });

  const analytics = await getAnalyticsService();
  if (typeof window !== 'undefined' && analytics) {
    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, 'view_item', {
      items: [{ item_id: carId }],
    });
  }
};

// --- Image Management ---

export const uploadVehicleImages = async (files: File[], vin: string): Promise<string[]> => {
  const storage = await getStorageService();
  const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
  const uploadPromises = files.map((file) => {
    const path = `vehicles/${vin}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve);
        },
      );
    });
  });

  return Promise.all(uploadPromises);
};
