import { InventoryRepository } from '../../../domain/repositories';
import { Result, success, failure } from '../../../domain/types';

/**
 * Use Case: Reindex Inventory
 * Orchestrates the batch process of re-calculating embeddings for the entire inventory.
 */
export class ReindexInventory {
    constructor(private inventoryRepo: InventoryRepository) { }

    /**
     * Reindexes the entire inventory by fetching all cars and re-calculating embeddings.
     */
    async execute(updateEmbeddingCallback: (id: string, data: any) => Promise<void>): Promise<Result<number>> {
        try {
            const cars = await this.inventoryRepo.getAll();
            let count = 0;

            for (const car of cars) {
                if (car.id) {
                    await updateEmbeddingCallback(car.id, car);
                    count++;
                }
            }

            return success(count);
        } catch (error) {
            console.error("[ReindexInventory] Error during inventory reindexing:", error);
            return failure(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
