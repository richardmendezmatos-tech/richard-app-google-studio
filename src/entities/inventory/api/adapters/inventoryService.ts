import { uploadVehicleImages as uploadToSupabase } from '@/shared/api/storage/storageService';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { Car } from '@/entities/inventory/model/types';

// Legacy alias for backwards compatibility
export type Vehicle = Car;

const mapRowToVehicle = (item: any): Vehicle => {
  const make = item.make || 'Ford';
  const model = item.model || '';
  const year = item.year || 2025;
  const name = item.name || `${make} ${model} ${year}`.trim();
  const condition = (item.condition || 'used').toLowerCase();
  
  return {
    id: item.vin || item.id,
    vin: item.vin || item.id,
    make,
    model,
    year,
    price: item.price || 0,
    mileage: item.mileage || 0,
    image: item.images?.[0] || item.image_url || '/images/placeholders/car.webp',
    images: item.images || (item.image_url ? [item.image_url] : []),
    gallery: item.images || (item.image_url ? [item.image_url] : []),
    status: (item.status || 'available').toLowerCase() as any,
    condition: condition as any,
    type: (item.body_style || item.type || 'suv').toLowerCase(),
    color: item.exterior_color || item.color || 'N/A',
    name,
    category: item.category || (condition === 'new' ? 'nuevos' : 'usados'),
    dealerId: item.dealer_id || 'central-ford',
    ...item
  };
};

export const getInventory = async (dealerId: string): Promise<Vehicle[]> => {
  if (!supabase) {
    console.error('[InventoryService] Supabase client not available');
    return [];
  }

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('dealer_id', dealerId);

  if (error) {
    console.error('[InventoryService] Error fetching inventory:', error);
    return [];
  }

  return (data || []).map(mapRowToVehicle);
};

export const logInventoryVelocityEvent = (vin: string, action: string, weight: number = 1) => {
  if (!supabase) return;

  // Fire-and-Forget pattern: No esperamos la respuesta para no bloquear la UI
  supabase
    .from('sentinel_metrics')
    .insert([{
      type: 'inventory_velocity',
      data: { vin, action, weight },
      operational_score: weight,
      metadata: { source: 'command_center_conversion' }
    }])
    .then(({ error }) => {
      if (error) console.warn('[InventoryService] Velocity Log Error:', error);
    })
    .catch(err => console.warn('[InventoryService] Velocity Log Exception:', err));
};

export const getRecentVelocityMetrics = async (days: number = 7) => {
  if (!supabase) return [];

  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  const { data, error } = await supabase
    .from('sentinel_metrics')
    .select('*')
    .eq('type', 'inventory_velocity')
    .gte('timestamp', dateLimit.toISOString());

  if (error) {
    console.error('[InventoryService] Error fetching velocity metrics:', error);
    return [];
  }

  return data || [];
};

export const incrementCarView = async (carId: string) => {
  // Migration Note: Firebase Analytics replaced by native event logging or simple DB increment
  if (!supabase) return;
  
  try {
    const { error } = await supabase.rpc('increment_vehicle_view', { vehicle_id: carId });
    if (error) {
      console.warn('[InventoryService] Could not increment car view in DB:', error);
    }
  } catch (err) {
    console.warn('[InventoryService] Exception incrementing car view:', err);
  }
};

export const getCarById = async (id: string): Promise<Vehicle | null> => {
  if (!supabase) return null;

  // Support querying by either primary ID or VIN
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .or(`id.eq.${id},vin.eq.${id}`)
    .limit(1)
    .single();

  if (error) {
    console.error('[InventoryService] Error fetching car by id:', error);
    return null;
  }

  return mapRowToVehicle(data);
}

export const uploadVehicleImages = async (files: File[], vin: string): Promise<string[]> => {
  try {
    return await uploadToSupabase(files, vin);
  } catch (error) {
    console.error('[InventoryService] Failed to upload vehicle images:', error);
    throw error;
  }
};

export const getPaginatedCars = async (
  pageSize: number,
  offset: number | null,
  filterType: string,
  sortOrder: 'asc' | 'desc' | null = null
) => {
  if (!supabase) return { cars: [], nextOffset: null };

  let query = supabase
    .from('inventory')
    .select('*', { count: 'exact' });

  if (filterType !== 'all') {
    if (filterType === 'nuevos') {
      query = query.or('category.eq.nuevos,condition.ilike.new');
    } else if (filterType === 'usados') {
      query = query.or('category.eq.usados,condition.ilike.used');
    } else {
      query = query.eq('category', filterType);
    }
  }

  if (sortOrder) {
    query = query.order('price', { ascending: sortOrder === 'asc' });
  }

  const start = offset || 0;
  const { data, error, count } = await query
    .range(start, start + pageSize - 1);

  if (error) {
    console.error('[InventoryService] Error fetching paginated cars:', error);
    return { cars: [], nextOffset: null };
  }

  const cars = (data || []).map(mapRowToVehicle);

  const nextOffset = (count && start + pageSize < count) ? start + pageSize : null;
  return { cars, nextOffset };
};

export const addVehicle = async (car: Record<string, any>) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('inventory')
    .insert([car])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateVehicle = async (id: string, updates: Record<string, any>) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteVehicle = async (id: string) => {
  if (!supabase) return null;
  const { error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};
