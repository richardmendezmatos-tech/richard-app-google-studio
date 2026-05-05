import { z } from 'zod';
import { ReindexInventory } from '../../use-cases';
import { SupabaseInventoryRepository } from '../../../infrastructure/repositories/SupabaseInventoryRepository';

const inventoryRepository = new SupabaseInventoryRepository();

export const semanticCarSearchFlow = async (input: { query: string }) => {
  const { semanticSearch } = await import('../../../infrastructure/ai/VectorAdapter');
  return await semanticSearch(input.query);
};

export const reindexInventoryFlow = async () => {
  const { updateCarEmbedding } = await import('../../../infrastructure/ai/VectorAdapter');
  const useCase = new ReindexInventory(inventoryRepository);
  const result = await useCase.execute(async (id, data) => {
    await updateCarEmbedding(id, data);
  });

  if (result.isFailure()) {
    throw new Error(result.error.message);
  }

  return `Re-indexed ${result.value} cars.`;
};
