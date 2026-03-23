import { searchSemanticInventory } from '@/shared/api/supabase/supabaseClient';
import { getPaginatedCars } from '@/shared/api/adapters/inventory/inventoryService';
import { Car } from '@/shared/types/types';

/**
 * Buscador "Ghost Failover"
 * Prioriza búsqueda semántica (IA) en Supabase.
 * Si Supabase está pausado o falla, activa búsqueda básica en Firestore.
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
        // Mapear IDs si es necesario o retornar resultados
        // (Para simplificar, asumimos que devuelve objetos Car o IDs válidos)
        return semanticMatches as any;
      }
    }
  } catch (error) {
    console.warn('Supabase no disponible, activando failover a Firestore:', error);
  }

  // Fallback: Búsqueda básica en Firestore
  // Implementamos un filtro simple por texto en el inventario paginado
  console.log('Ejecutando fallback en Firestore...');
  const { cars } = await getPaginatedCars(10, null, 'all');

  // Filtro simple de cliente para el fallback (Simulando búsqueda de texto)
  return cars.filter(
    (car) =>
      car.name?.toLowerCase().includes(queryText.toLowerCase()) ||
      car.description?.toLowerCase().includes(queryText.toLowerCase()),
  );
};
