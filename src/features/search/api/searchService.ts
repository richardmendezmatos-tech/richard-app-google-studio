import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';
import { getPaginatedCars } from '@/entities/inventory/api/adapters/inventoryService';
import { Car } from '@/shared/types/types';

/**
 * Buscador "Ghost Failover"
 * Prioriza búsqueda semántica (IA) en Supabase.
 */
export const smartVehicleSearch = async (
  queryText: string,
  queryEmbedding?: number[],
): Promise<Car[]> => {
  try {
    if (queryEmbedding) {
      console.log('Intentando búsqueda semántica en Supabase...');
      const semanticMatches = await searchSemanticInventory(queryEmbedding);

      if (semanticMatches && semanticMatches.length > 0) {
        return semanticMatches as any;
      }
    }
  } catch (error) {
    console.warn('Supabase no disponible, activando búsqueda local:', error);
  }

  // Fallback: Búsqueda básica local (Basado en inventario cargado)
  const { cars } = await getPaginatedCars(10, null, 'all');

  return cars.filter(
    (car: any) =>
      car.name?.toLowerCase().includes(queryText.toLowerCase()) ||
      car.description?.toLowerCase().includes(queryText.toLowerCase()),
  );
};
