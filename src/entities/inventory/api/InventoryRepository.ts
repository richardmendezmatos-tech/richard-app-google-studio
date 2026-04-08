import { Car } from '../model/types';

export interface InventoryRepository {
  getInventory(dealerId: string, limit: number): Promise<Car[]>;
  getCarById(id: string): Promise<Car | null>;
  getInventoryTurnover(dealerId: string): Promise<number>;
}
