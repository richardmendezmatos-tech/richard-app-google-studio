import { Car } from '../entities';

export interface InventoryRepository {
    getById(id: string): Promise<Car | null>;
    updateEmbedding(id: string, embedding: number[]): Promise<void>;
}
