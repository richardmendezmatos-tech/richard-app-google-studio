import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { Car } from '@/entities/inventory/model/types';

const mapRowToVehicle = (item: any): Car => {
  const make = item.make || 'Ford';
  const year = item.year || 2025;
  const condition = (item.condition || 'used').toLowerCase();

  // Clean model: Central Ford sync stores full title "2025 Ford Explorer XLT" in model column
  const rawModel = item.model || '';
  const model = rawModel
    .replace(/^\d{4}\s+/, '')   // strip leading year
    .replace(/^ford\s+/i, '')   // strip leading "Ford"
    .trim() || rawModel;

  const name = item.name || `${year} ${make} ${model}`.trim();

  return {
    ...item,   // spread first so explicit fields override
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
  };
};

export const getPaginatedCars = async (
  pageSize: number,
  offset: number | null,
  filterType: string,
  sortOrder: 'asc' | 'desc' | null = null,
  searchTerm?: string,
  sortBy: 'price' | 'year' | 'mileage' | 'created_at' = 'price',
) => {
  const sb = createServerSupabaseClient();
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
    query = query
      .order('condition', { ascending: true })
      .order('make', { ascending: true })
      .order('price', { ascending: false });
  }

  const start = offset || 0;
  const { data, error, count } = await query.range(start, start + pageSize - 1);

  if (error) {
    console.error('[serverInventoryService] Error fetching paginated cars:', error);
    return { cars: [], nextOffset: null };
  }

  const cars = (data || []).map(mapRowToVehicle);
  const nextOffset = count && start + pageSize < count ? start + pageSize : null;
  return { cars, nextOffset };
};

export interface FordModelSummary {
  model: string;
  image: string;
  minPrice: number;
  maxPrice: number;
  count: number;
  years: number[];
  bodyStyles: string[];
}

export const getDistinctFordModels = async (): Promise<FordModelSummary[]> => {
  const sb = createServerSupabaseClient();
  if (!sb) return [];
  const { data, error } = await sb
    .from('inventory')
    .select('make, model, year, price, images, body_style, type, name, condition')
    .eq('make', 'Ford')
    .neq('status', 'sold');

  if (error) {
    console.error('[serverInventoryService] Error fetching Ford models:', error);
    return [];
  }

  const modelMap = new Map<string, {
    models: Set<string>;
    prices: number[];
    images: string[];
    years: Set<number>;
    bodyStyles: Set<string>;
    count: number;
  }>();

  for (const row of (data || [])) {
    const model = (row.model || 'Desconocido').toLowerCase();
    if (!modelMap.has(model)) {
      modelMap.set(model, {
        models: new Set(),
        prices: [],
        images: [],
        years: new Set(),
        bodyStyles: new Set(),
        count: 0,
      });
    }
    const entry = modelMap.get(model)!;
    entry.models.add(model);
    if (row.price) entry.prices.push(row.price);
    const img = row.images?.[0] || '';
    if (img) entry.images.push(img);
    if (row.year) entry.years.add(row.year);
    const style = row.body_style || row.type || '';
    if (style) entry.bodyStyles.add(style);
    entry.count++;
  }

  const summaries: FordModelSummary[] = [];
  for (const [modelSlug, entry] of modelMap) {
    summaries.push({
      model: modelSlug.charAt(0).toUpperCase() + modelSlug.slice(1),
      image: entry.images[0] || '/placeholder-car.webp',
      minPrice: Math.min(...entry.prices),
      maxPrice: Math.max(...entry.prices),
      count: entry.count,
      years: Array.from(entry.years).sort((a, b) => b - a),
      bodyStyles: Array.from(entry.bodyStyles),
    });
  }

  return summaries.sort((a, b) => b.count - a.count);
};
