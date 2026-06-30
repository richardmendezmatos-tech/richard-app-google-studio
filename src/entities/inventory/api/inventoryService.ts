import { createClient } from '@/shared/api/supabase/client';
import { STATIC_INVENTORY_FALLBACK } from '@/shared/api/inventory/staticInventory';

export const inventoryService = {
  async fetchInventory(dealerId: string) {
    try {
      // Repository Pattern: instanciar el repo del propio dominio (sin pasar por el DI de app)
      const { SupabaseInventoryRepository } = await import('./SupabaseInventoryRepository');
      const repository = new SupabaseInventoryRepository(createClient());
      const results = await repository.getInventory(dealerId);

      // Sentinel Check: If empty or nearly empty, augment with fallback for cinematic density
      if (!results || results.length === 0) {
        console.warn('[Sentinel Sync] Empty API response. Engaging Fallback.');
        return STATIC_INVENTORY_FALLBACK;
      }

      return results;
    } catch (error) {
      console.error('[inventoryService] Backend Offline. Engaging Sentinel Sync Fallback:', error);
      return STATIC_INVENTORY_FALLBACK;
    }
  },
};

export const uploadInitialInventory = async (data: any[]) => {
  console.log('[inventoryService] Initializing Database with', data.length, 'units...');
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = data.map((car) => ({
      vin: car.vin,
      make: car.make,
      model: car.model,
      year: car.year,
      name: car.name || `${car.year} ${car.make} ${car.model}`,
      price: car.price,
      mileage: car.mileage || 0,
      images: car.image ? [car.image] : car.images || [],
      status: (car.status || 'AVAILABLE').toUpperCase(),
      condition: (car.condition || 'USED').toUpperCase(),
      last_scraped_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('inventory').upsert(payload, { onConflict: 'vin' });
    if (error) throw error;

    console.log('[inventoryService] Database Initialized Successfully.');
  } catch (error) {
    console.error('[inventoryService] Error initializing database:', error);
    throw error;
  }
};
