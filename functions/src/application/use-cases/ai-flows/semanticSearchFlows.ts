import { z } from 'genkit';
import { ai } from '../../../services/aiManager';
import { ReindexInventory } from '../../use-cases';
import { FirestoreInventoryRepository } from '../../../infrastructure/persistence/firestore/FirestoreInventoryRepository';

const inventoryRepository = new FirestoreInventoryRepository();

export const semanticCarSearchFlow = ai.defineFlow(
  {
    name: 'semanticCarSearch',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    const { semanticSearch } = await import('../../../infrastructure/ai/VectorAdapter');
    return await semanticSearch(input.query);
  },
);

export const reindexInventoryFlow = ai.defineFlow(
  { name: 'reindexInventory', inputSchema: z.void(), outputSchema: z.string() },
  async () => {
    const { updateCarEmbedding } = await import('../../../infrastructure/ai/VectorAdapter');
    const useCase = new ReindexInventory(inventoryRepository);
    const result = await useCase.execute(async (id, data) => {
      await updateCarEmbedding(id, data);
    });

    if (result.isFailure()) {
      throw new Error(result.error.message);
    }

    return `Re-indexed ${result.value} cars.`;
  },
);
