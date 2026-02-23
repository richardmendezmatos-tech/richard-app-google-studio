import { InventoryRepository } from '../../domain/repositories/InventoryRepository';

export class ReindexInventory {
    constructor(private inventoryRepo: InventoryRepository) { }

    /**
     * Reindexes the entire inventory by fetching all cars and re-calculating embeddings.
     * Note: The actual embedding calculation logic is delegated to vectorService in index.ts for now,
     * but this use case orchestrates the batch process.
     */
    async execute(updateEmbeddingCallback: (id: string, data: any) => Promise<void>): Promise<number> {
        const cars = await this.inventoryRepo.getAll();
        let count = 0;

        for (const car of cars) {
            if (car.id) {
                await updateEmbeddingCallback(car.id, car);
                count++;
            }
        }

        return count;
    }
}
