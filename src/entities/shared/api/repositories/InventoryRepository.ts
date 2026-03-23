import { Car } from '../../model/entities';

export interface InventoryRepository {
  getInventory(dealerId: string, limit: number): Promise<Car[]>;
  getCarById(id: string): Promise<Car | null>;
}
