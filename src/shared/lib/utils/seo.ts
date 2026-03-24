import { Car } from '@/entities/shared';

/**
 * Convierte un texto en un slug amigable para SEO.
 * @param text - Texto original ("2023 Honda Civic Sport")
 * @returns Slug limpio ("2023-honda-civic-sport")
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Separa acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // Elimina caracteres raros
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Elimina guiones múltiples
}

/**
 * Genera el slug optimizado directamente para un vehículo del inventario.
 * @param car - Entidad Carro completa
 * @param includeModifiers - Opcional para inyectar long-tail keywords
 * @returns Slug final ej: "2023-honda-civic-pre-aprobado"
 */
export function generateVehicleSlug(car: Pick<Car, 'name'>, includeModifiers: boolean = true): string {
  const baseSlug = slugify(car.name);
  
  if (includeModifiers) {
    // Ejemplo de long-tail para SEO Transaccional local
    return `${baseSlug}-puerto-rico`;
  }
  
  return baseSlug;
}
