import { VectorRepository } from '../../domain/repositories/VectorRepository';
import { Car } from '../../domain/entities';

/**
 * Use Case: Inventory Searcher
 * Orchestrates semantic indexing and searching of inventory.
 */
export class InventorySearcher {
    constructor(private vectorRepo: VectorRepository) { }

    async search(query: string, limit: number = 3): Promise<Car[]> {
        const queryVector = await this.vectorRepo.generateEmbedding(query);
        return this.vectorRepo.semanticSearch(queryVector, limit);
    }

    async indexCar(id: string, car: Car): Promise<void> {
        const text = `${car.name} ${car.type} ${car.description || ''} ${car.features?.join(' ') || ''}`;
        const vector = await this.vectorRepo.generateEmbedding(text);
        await this.vectorRepo.updateEmbedding(id, vector);
    }
}
