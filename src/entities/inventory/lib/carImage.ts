export const PLACEHOLDER_IMAGE = '/placeholder-car.webp';

export function getCarImage(car: {
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
}): string {
  return car.image || car.img || car.images?.[0] || PLACEHOLDER_IMAGE;
}

export function hasImage(car: {
  image?: string | null;
  img?: string | null;
  images?: (string | null)[] | null;
}): boolean {
  return !!(car.image || car.img || car.images?.length);
}
