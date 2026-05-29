import { Car } from '@/entities/inventory/model/types';

let _supabase: any = null;
async function getSupabase() {
  if (!_supabase) {
    const m = await import('@/shared/api/supabase/supabaseClient');
    _supabase = await m.getSupabase();
  }
  return _supabase;
}

const mapRowToVehicle = (item: any): Car => {
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
    status: (item.status || 'available').toLowerCase() as Car['status'],
    condition: condition as Car['condition'],
    type: (item.body_style || item.type || 'suv').toLowerCase() as Car['type'],
    color: item.exterior_color || item.color || 'N/A',
    name,
    transmission: item.transmission,
    fuel: item.fuel || item.fuelType,
    fuelType: item.fuelType,
    engine: item.engine,
    hp: item.hp,
    description: item.description,
    features: item.features || [],
    specs: item.specs || [],
    dealerId: item.dealer_id || 'central-ford',
    badge: item.badge,
    ...item,
  };
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

export async function getDistinctFordModels(): Promise<FordModelSummary[]> {
  const sb = await getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from('inventory')
    .select('make, model, year, price, images, body_style, type, name, image, condition')
    .eq('make', 'Ford')
    .neq('status', 'sold');

  if (error) {
    console.error('[FordModelService] Error fetching models:', error);
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
    const img = row.images?.[0] || row.image || '';
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
}

export async function getFordModelCars(model: string): Promise<Car[]> {
  const sb = await getSupabase();
  if (!sb) return [];

  const slug = model.toLowerCase();

  const { data, error } = await sb
    .from('inventory')
    .select('*')
    .eq('make', 'Ford')
    .ilike('model', slug)
    .neq('status', 'sold');

  if (error) {
    console.error('[FordModelService] Error fetching model cars:', error);
    return [];
  }

  return (data || []).map(mapRowToVehicle);
}
