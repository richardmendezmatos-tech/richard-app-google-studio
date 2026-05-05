import { uploadVehicleImages as uploadToSupabase } from '@/shared/api/storage/storageService';
import { supabase } from '@/shared/api/supabase/supabaseClient';

export interface Vehicle {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'sedan' | 'suv' | 'truck' | 'luxury';
  vin: string;
  dealerId: string;
}

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

export const uploadVehicleImages = async (files: File[], vin: string): Promise<string[]> => {
  try {
    return await uploadToSupabase(files, vin);
  } catch (error) {
    console.error('[InventoryService] Failed to upload vehicle images:', error);
    throw error;
  }
};
