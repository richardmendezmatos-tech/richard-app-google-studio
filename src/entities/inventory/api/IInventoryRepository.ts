import { Car } from '@/entities/inventory/model/CarEntity';

export interface InventoryRepository {
  getById(id: string): Promise<Car | null>;
  getAll(): Promise<Car[]>;
  updateEmbedding(id: string, embedding: number[]): Promise<void>;
}
