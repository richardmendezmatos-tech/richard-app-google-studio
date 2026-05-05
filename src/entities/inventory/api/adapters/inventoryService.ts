import { uploadVehicleImages as uploadToSupabase } from '@/shared/api/storage/storageService';
import { supabase } from '@/shared/api/supabase/supabaseClient';
import { Car } from '@/entities/inventory/model/types';

// Legacy alias for backwards compatibility
export type Vehicle = Car;

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

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image_url,
    category: item.category,
    vin: item.vin,
    dealerId: item.dealer_id
  }));
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

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[InventoryService] Error fetching car by id:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    price: data.price,
    image: data.image_url,
    category: data.category,
    vin: data.vin,
    dealerId: data.dealer_id,
    ...data
  } as Vehicle;
};

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
    query = query.eq('category', filterType);
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

  const cars = (data || []).map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image_url,
    category: item.category,
    vin: item.vin,
    dealerId: item.dealer_id
  }));

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
