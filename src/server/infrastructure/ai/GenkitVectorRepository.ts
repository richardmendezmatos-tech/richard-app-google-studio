import { VectorRepository } from '../../domain/repositories/VectorRepository';
import { Car } from '../../domain/entities';

/**
 * GenkitVectorRepository - Stub for semantic search integration.
 * Awaiting Supabase pgvector configuration in Phase 2.
 */
export class GenkitVectorRepository implements VectorRepository {
    async generateEmbedding(text: string): Promise<number[]> {
        console.log(`[GenkitVectorRepository] Generating embedding for text: "${text.substring(0, 30)}..."`);
        // Return dummy embedding
        return Array(1536).fill(0.01);
    }

    async semanticSearch(vector: number[], limit: number = 3): Promise<Car[]> {
        console.log(`[GenkitVectorRepository] Semantic search called with limit ${limit}`);
        // Return empty results for now
        return [];
    }

    async updateEmbedding(id: string, vector: number[]): Promise<void> {
        console.log(`[GenkitVectorRepository] Updating embedding for id ${id}`);
    }
}
