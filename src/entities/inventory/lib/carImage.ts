export const PLACEHOLDER_IMAGE = '/placeholder-car.webp';

export function getCarImage(car: {
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
}): string {
  return car.image || car.img || car.images?.[0] || PLACEHOLDER_IMAGE;
}

export function getCarImages(car: {
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
}, limit: number = 3): string[] {
  const all = [car.image, car.img, ...(car.images || [])].filter(
    (url): url is string => !!url && url !== PLACEHOLDER_IMAGE,
  );
  const unique = [...new Set(all)];
  return unique.slice(0, limit);
}

export function hasImage(car: {
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
}): boolean {
  return !!(car.image || car.img || car.images?.length);
}
