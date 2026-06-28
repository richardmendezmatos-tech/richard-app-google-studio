/**
 * Car Image Enrichment Utility
 *
 * Uses imagin.studio's public API to fetch professional marketing-quality
 * car images by year/make/model. No API key required for common vehicles.
 *
 * URL format: https://cdn.imagin.studio/getImage?customer=img&make=ford&modelFamily=mustang&modelYear=2023
 */

const IMAGIN_BASE = 'https://cdn.imagin.studio/getImage';
const IMAGIN_CUSTOMER = process.env.IMAGIN_STUDIO_CUSTOMER || 'img';

// Normalize make names to imagin.studio format
const MAKE_MAP: Record<string, string> = {
  ford: 'ford',
  toyota: 'toyota',
  honda: 'honda',
  chevrolet: 'chevrolet',
  chevy: 'chevrolet',
  nissan: 'nissan',
  hyundai: 'hyundai',
  kia: 'kia',
  jeep: 'jeep',
  ram: 'ram',
  dodge: 'dodge',
  gmc: 'gmc',
  volkswagen: 'volkswagen',
  vw: 'volkswagen',
  bmw: 'bmw',
  mercedes: 'mercedes-benz',
  'mercedes-benz': 'mercedes-benz',
  audi: 'audi',
  lexus: 'lexus',
  acura: 'acura',
  infiniti: 'infiniti',
  subaru: 'subaru',
  mazda: 'mazda',
  mitsubishi: 'mitsubishi',
  volvo: 'volvo',
  lincoln: 'lincoln',
  cadillac: 'cadillac',
  buick: 'buick',
  chrysler: 'chrysler',
};

function normalizeMake(make: string): string {
  return MAKE_MAP[make.toLowerCase().trim()] || make.toLowerCase().replace(/\s+/g, '-');
}

function normalizeModel(model: string): string {
  return model.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Returns a high-quality marketing image URL for the given vehicle.
 * Falls back to null if the make is not supported.
 */
export function getEnrichedImageUrl(
  year: number,
  make: string,
  model: string,
  angle: '29' | '13' | '1' = '29',
): string | null {
  if (!make || !model || !year) return null;

  const normalizedMake = normalizeMake(make);
  const normalizedModel = normalizeModel(model);

  const params = new URLSearchParams({
    customer: IMAGIN_CUSTOMER,
    make: normalizedMake,
    modelFamily: normalizedModel,
    modelYear: String(year),
    zoomType: 'fullscreen',
    angle,
  });

  return `${IMAGIN_BASE}?${params.toString()}`;
}

/**
 * Checks if a given URL is likely valid (not a placeholder or empty).
 */
export function isRealImage(url: string | null | undefined): boolean {
  if (!url) return false;
  if (url.includes('placeholder')) return false;
  if (url === '/placeholder-car.webp') return false;
  return true;
}

/**
 * Returns the best available image URL for a vehicle, enriching with
 * imagin.studio if no real image exists.
 */
export function getBestImageUrl(car: {
  year?: number;
  make?: string;
  model?: string;
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
}): string {
  const stored = car.image || car.img || car.images?.[0];
  if (isRealImage(stored)) return stored!;

  const enriched = getEnrichedImageUrl(
    car.year || 2024,
    car.make || '',
    car.model || '',
  );

  return enriched || '/placeholder-car.webp';
}
