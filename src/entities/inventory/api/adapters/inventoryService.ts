import { uploadVehicleImages as uploadToSupabase } from '@/shared/api/supabase/storage';
import { Car } from '@/entities/inventory/model/types';

let _supabase: any = null;
async function getSupabase() {
  if (!_supabase) {
    const m = await import('@/shared/api/supabase/supabaseClient');
    _supabase = await m.getSupabase();
  }
  return _supabase;
}

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
    image: item.images?.[0] || '/placeholder-car.webp',
    images: item.images || [],
    status: (item.status || 'available').toLowerCase() as any,
    condition: condition as any,
    type: (item.body_style || item.type || 'suv').toLowerCase(),
    color: item.exterior_color || item.color || 'N/A',
    name,
    category: item.category || (condition === 'new' ? 'nuevos' : 'usados'),
    dealerId: item.dealer_id || 'central-ford',
    ...item,
  };
};

export const getInventory = async (dealerId: string): Promise<Vehicle[]> => {
  const sb = await getSupabase();
  if (!sb) return [];

  const { data, error } = await sb.from('inventory').select('make, model, year, name, condition, vin, id, price, mileage, images, status, body_style, type, exterior_color, color, category, dealer_id').eq('dealer_id', dealerId).limit(100);

  if (error) {
    console.error('[InventoryService] Error fetching inventory:', error);
    return [];
  }

  return (data || []).map(mapRowToVehicle);
};

export const logInventoryVelocityEvent = (vin: string, action: string, weight: number = 1) => {
  // Fire-and-Forget pattern: No esperamos la respuesta para no bloquear la UI
  getSupabase().then((sb) => {
    if (!sb) return;
    sb.from('sentinel_metrics')
    .insert([
      {
        type: 'inventory_velocity',
        data: { vin, action, weight },
        operational_score: weight,
        metadata: { source: 'command_center_conversion' },
      },
    ])
    .then(({ error }: { error: any }) => {
      if (error) console.warn('[InventoryService] Velocity Log Error:', error);
    })
    .catch((err: any) => console.warn('[InventoryService] Velocity Log Exception:', err));
  });
};

export const getRecentVelocityMetrics = async (days: number = 7) => {
  const sb = await getSupabase();
  if (!sb) return [];

  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  const { data, error } = await sb
    .from('sentinel_metrics')
    .select('data, operational_score, type, timestamp')
    .eq('type', 'inventory_velocity')
    .gte('timestamp', dateLimit.toISOString())
    .limit(100);

  if (error) {
    console.error('[InventoryService] Error fetching velocity metrics:', error);
    return [];
  }

  return data || [];
};

export const incrementCarView = async (carId: string) => {
  const sb = await getSupabase();
  if (!sb) return;

  try {
    const { error } = await sb.rpc('increment_vehicle_view', { vehicle_id: carId });
    if (error) {
      console.warn('[InventoryService] Could not increment car view in DB:', error);
    }
  } catch (err) {
    console.warn('[InventoryService] Exception incrementing car view:', err);
  }
};

export const getCarById = async (id: string): Promise<Vehicle | null> => {
  const sb = await getSupabase();
  if (!sb) return null;

  // Support querying by either primary ID or VIN
  const { data, error } = await sb
    .from('inventory')
    .select('*')
    .eq('vin', id)
    .limit(1)
    .single();

  if (error) {
    console.error('[InventoryService] Error fetching car by id:', error);
    return null;
  }

  return mapRowToVehicle(data);
};

export const getSimilarCars = async (
  make: string,
  type: string,
  excludeId: string,
  limit: number = 4,
): Promise<Car[]> => {
  const sb = await getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('inventory')
    .select('*')
    .neq('vin', excludeId)
    .or(`make.ilike.${make},type.ilike.${type}`)
    .limit(limit);

  if (error) {
    console.error('[InventoryService] Error fetching similar cars:', error);
    return [];
  }
  return (data || []).map(mapRowToVehicle);
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
  sortOrder: 'asc' | 'desc' | null = null,
  searchTerm?: string,
  sortBy: 'price' | 'year' | 'mileage' | 'created_at' = 'price',
) => {
  const sb = await getSupabase();
  if (!sb) return { cars: [], nextOffset: null };

  let query = sb.from('inventory').select('*', { count: 'estimated' });

  if (searchTerm) {
    const term = searchTerm.trim().toLowerCase();
    query = query.or(
      `make.ilike.%${term}%,model.ilike.%${term}%,name.ilike.%${term}%`,
    );
  }

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
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  } else {
    // Default boost for New Fords (Ford-First Strategy)
    query = query
      .order('condition', { ascending: true }) // 'new' < 'used' alphabetically? No, need to be careful.
      .order('make', { ascending: true }) // Ford starts with F
      .order('price', { ascending: false });
  }

  const start = offset || 0;
  const { data, error, count } = await query.range(start, start + pageSize - 1);

  if (error) {
    console.error('[InventoryService] Error fetching paginated cars:', error);
    return { cars: [], nextOffset: null };
  }

  const cars = (data || []).map(mapRowToVehicle);

  const nextOffset = count && start + pageSize < count ? start + pageSize : null;
  return { cars, nextOffset };
};

export const addVehicle = async (car: Record<string, any>) => {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('inventory').insert([car]).select().single();

  if (error) throw error;
  return data;
};

export const updateVehicle = async (id: string, updates: Record<string, any>) => {
  const sb = await getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from('inventory')
    .update(updates)
    .eq('vin', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteVehicle = async (id: string) => {
  const sb = await getSupabase();
  if (!sb) return null;
  const { error } = await sb.from('inventory').delete().eq('vin', id);

  if (error) throw error;
  return true;
};
