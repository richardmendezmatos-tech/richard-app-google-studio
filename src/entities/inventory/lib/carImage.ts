import { getBestImageUrl, isRealImage } from '@/shared/lib/utils/carImageEnricher';

export const PLACEHOLDER_IMAGE = '/placeholder-car.webp';

type CarImageInput = {
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
  year?: number;
  make?: string;
  model?: string;
};

export function getCarImage(car: CarImageInput): string {
  return getBestImageUrl(car);
}

export function getCarImages(car: CarImageInput, limit: number = 3): string[] {
  const all = [car.image, car.img, ...(car.images || [])].filter(
    (url): url is string => isRealImage(url),
  );
  const unique = [...new Set(all)];

  if (unique.length === 0) {
    const enriched = getBestImageUrl(car);
    if (enriched && enriched !== PLACEHOLDER_IMAGE) return [enriched];
    return [];
  }

  return unique.slice(0, limit);
}

export function hasImage(car: CarImageInput): boolean {
  return isRealImage(car.image || car.img || car.images?.[0]);
}
