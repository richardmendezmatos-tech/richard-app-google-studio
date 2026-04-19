import { listCars, getCar, ListCarsVariables } from '@dataconnect/generated';
import { InventoryRepository } from '../InventoryRepository';
import { Car } from '../../model/types';

export class DataConnectInventoryRepository implements InventoryRepository {
  async getInventory(dealerId: string, limit: number): Promise<Car[]> {
    try {
      const vars: ListCarsVariables = {
        limit,
        dealerId,
        offset: 0,
      };
      const response = await listCars(vars);
      return response.data.cars.map((c) => ({
        ...c,
        name: `${c.make} ${c.model} ${c.year}`, // Mapping basic SQL fields to domain name
        status: (c.status as 'available' | 'reserved' | 'sold') || 'available',
      })) as unknown as Car[];
    } catch (error) {
      console.error('[DataConnectInventoryRepository] Error fetching inventory:', error);
      return [];
    }
  }

  async getCarById(id: string): Promise<Car | null> {
    try {
      const response = await getCar({ id });
      if (!response.data.car) return null;
      
      const c = response.data.car;
      return {
        ...c,
        name: `${c.make} ${c.model} ${c.year}`,
        status: (c.status as 'available' | 'reserved' | 'sold') || 'available',
      } as unknown as Car;
    } catch (error) {
      console.error('[DataConnectInventoryRepository] Error fetching car:', error);
      return null;
    }
  }

  async getInventoryTurnover(dealerId: string): Promise<number> {
    // TODO: Implement turnover calculation logic for SQL
    // For now returning a placeholder as it's a derived metric
    return 15.5; 
  }

  // --- SYNC ENGINE STUBS ---
  async getActiveInventory(): Promise<import('../../model/sync/Vehicle').Vehicle[]> {
    throw new Error('Method not implemented for DataConnect adapter.');
  }

  async insertBatch(vehicles: import('../../model/sync/Vehicle').Vehicle[]): Promise<void> {
    throw new Error('Method not implemented for DataConnect adapter.');
  }

  async updateBatch(vehicles: import('../../model/sync/Vehicle').Vehicle[]): Promise<void> {
    throw new Error('Method not implemented for DataConnect adapter.');
  }

  async markAsSoldBatch(vins: string[]): Promise<void> {
    throw new Error('Method not implemented for DataConnect adapter.');
  }
}
