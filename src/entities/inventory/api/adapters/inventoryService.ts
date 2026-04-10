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

export const updateVehicle = async (id: string, updates: Partial<Car>): Promise<void> => {
  // TODO (SQL-Migration): Replace with DataConnect updateCar mutation when available.
  // Firestore writes for inventory are disabled post-migration.
  const validatedUpdates = carSchema.partial().parse(updates);
  console.warn('[inventoryService] updateVehicle: SQL mutation not yet mapped. id:', id, 'updates:', validatedUpdates);
};

export const deleteVehicle = async (id: string): Promise<void> => {
  // TODO (SQL-Migration): Replace with DataConnect deleteCar mutation when available.
  console.warn('[inventoryService] deleteVehicle: SQL mutation not yet mapped. id:', id);
};

export const uploadInitialInventory = async (inventory: Omit<Car, 'id'>[]): Promise<void> => {
  // TODO (SQL-Migration): Implement bulk insert via DataConnect createCar mutation.
  // This function is a no-op until the bulk SQL migration script is executed.
  console.warn('[inventoryService] uploadInitialInventory: Bulk SQL insert not yet implemented. Items:', inventory.length);
};

// --- Metrics & Analytics ---

export const incrementCarView = async (carId: string): Promise<void> => {
  // Analytics only — no Firestore write needed post-migration.
  try {
    const analytics = await getAnalyticsService();
    if (typeof window !== 'undefined' && analytics) {
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, 'view_item', { items: [{ item_id: carId }] });
    }
  } catch (e) {
    console.debug('[inventoryService] incrementCarView analytics skipped', e);
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
