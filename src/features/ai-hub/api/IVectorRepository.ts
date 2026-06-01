import { Car } from '@/entities/lead/model/LeadEntity';

export interface VectorRepository {
  generateEmbedding(text: string): Promise<number[]>;
  semanticSearch(vector: number[], limit?: number): Promise<Car[]>;
  updateEmbedding(id: string, vector: number[]): Promise<void>;
}
