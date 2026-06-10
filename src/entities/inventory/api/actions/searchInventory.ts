'use server';

import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

const mapRowToVehicle = (item: any) => {
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

export async function searchInventory(
  pageSize: number,
  offset: number | null,
  filterType: string,
  sortOrder: 'asc' | 'desc' | null = null,
  searchTerm?: string,
  sortBy: 'price' | 'year' | 'mileage' | 'created_at' = 'price',
) {
  const sb = createServerSupabaseClient();
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
    query = query
      .order('condition', { ascending: true })
      .order('make', { ascending: true })
      .order('price', { ascending: false });
  }

  const start = offset || 0;
  const { data, error, count } = await query.range(start, start + pageSize - 1);

  if (error) {
    console.error('[searchInventory] Error:', error);
    return { cars: [], nextOffset: null };
  }

  const cars = (data || []).map(mapRowToVehicle);
  const nextOffset = count && start + pageSize < count ? start + pageSize : null;
  return { cars, nextOffset };
}
