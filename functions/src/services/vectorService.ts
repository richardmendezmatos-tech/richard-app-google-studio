import { GenkitVectorRepository } from '../infrastructure/vector/GenkitVectorRepository';
import { InventorySearcher } from '../application/use-cases/InventorySearcher';
import { Car } from '../domain/entities';

const vectorRepo = new GenkitVectorRepository();
const searcher = new InventorySearcher(vectorRepo);

/**
 * Generates an embedding for a car object.
 * Legacy wrapper for backward compatibility.
 */
export async function generateCarEmbedding(car: any): Promise<number[]> {
    const text = `${car.name} ${car.type} ${car.description || ''} ${car.features?.join(' ') || ''}`;
    return vectorRepo.generateEmbedding(text);
}

/**
 * Updates a car document with its semantic embedding.
 */
export async function updateCarEmbedding(carId: string, carData: any) {
    return searcher.indexCar(carId, carData as Car);
}

/**
 * Performs a semantic search using cosine similarity.
 */
export async function semanticSearch(queryText: string, limit: number = 3) {
    return searcher.search(queryText, limit);
}
