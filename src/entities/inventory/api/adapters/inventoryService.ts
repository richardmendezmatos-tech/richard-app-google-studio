import { supabase } from '@/shared/api/supabase/supabaseClient';
import { Car, CarSchema } from '../../model/types';
import { getAnalyticsService, getStorageService } from '@/shared/api/firebase/optionalServices';

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
  try {
    let query = supabase
      .from('inventory')
      .select('*')
      .range(offset, offset + pageSize - 1);

    // Apply Filter
    if (filterType !== 'all') {
      if (filterType === 'ford' || filterType === 'hyundai') {
         query = query.ilike('make', filterType);
      } else {
         // Placeholder for more complex filters (e.g. type)
      }
    }

    // Apply Sort
    if (sortOrder) {
      query = query.order('price', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('last_scraped_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    const cars = (data || []).map((row) => ({
      id: row.vin,
      vin: row.vin,
      make: row.make,
      model: row.model,
      year: row.year,
      price: row.price || 0,
      mileage: row.mileage || 0,
      img: row.images?.[0] || '/images/placeholders/car.webp',
      images: row.images || [],
      gallery: row.images || [],
      status: (row.status?.toLowerCase() as any) || 'available',
      type: 'suv', // placeholder or logic needed
      color: 'N/A',
      name: `${row.make} ${row.model} ${row.year}`,
    })) as unknown as Car[];

    return {
      cars,
      nextOffset: (data?.length || 0) === pageSize ? offset + pageSize : null,
      hasMore: (data?.length || 0) === pageSize,
    };
  } catch (e: any) {
    console.error('[Supabase] Pagination Error:', e);
    throw e;
  }
};

export const getCarById = async (id: string): Promise<Car | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('vin', id)
      .single();

    if (error || !data) return null;
    
    return {
      id: data.vin,
      vin: data.vin,
      make: data.make,
      model: data.model,
      year: data.year,
      price: data.price || 0,
      mileage: data.mileage || 0,
      img: data.images?.[0] || '/images/placeholders/car.webp',
      images: data.images || [],
      gallery: data.images || [],
      status: (data.status?.toLowerCase() as any) || 'available',
      type: 'suv',
      color: 'N/A',
      name: `${data.make} ${data.model} ${data.year}`,
    } as unknown as Car;
  } catch (error) {
    console.error('[Supabase] Error fetching car:', error);
    return null;
  }
};

// --- CRUD Operations (Admin) ---

export const addVehicle = async (carData: Omit<Car, 'id'>): Promise<string> => {
  const currentDealerId = (typeof window !== 'undefined' ? localStorage.getItem('current_dealer_id') : null) || 'richard-automotive';

  const validatedData = CarSchema.parse({
    ...carData,
    dealerId: currentDealerId,
    views: 0,
    leadsCount: 0,
  });

  console.warn('[inventoryService] addVehicle: SQL mutation not yet mapped. data:', validatedData);
  return "stub-id";
};

export const updateVehicle = async (id: string, updates: Partial<Car>): Promise<void> => {
  const validatedUpdates = CarSchema.partial().parse(updates);
  console.warn('[inventoryService] updateVehicle: SQL mutation not yet mapped. id:', id, 'updates:', validatedUpdates);
};

export const deleteVehicle = async (id: string): Promise<void> => {
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
