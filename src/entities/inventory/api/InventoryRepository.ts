import { Car } from '@/entities/inventory';

export interface InventoryRepository {
  getInventory(dealerId: string, limit: number): Promise<Car[]>;
  getCarById(id: string): Promise<Car | null>;
}
