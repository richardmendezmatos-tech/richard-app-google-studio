import { VectorRepository } from '../../../domain/repositories';
import { Car } from '../../../domain/entities';

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
        // Enriched search text for better semantic retrieval
        const text = `
            Vehículo: ${car.year} ${car.make} ${car.model} (${car.name})
            Categoría: ${car.category}
            Condición: ${car.condition}
            Características: ${car.features?.join(', ') || 'N/A'}
            Descripción: ${car.description || ''}
        `.trim();

        const vector = await this.vectorRepo.generateEmbedding(text);
        await this.vectorRepo.updateEmbedding(id, vector);
    }
}
