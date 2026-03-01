import { Unidad } from '../domain/Unidad';

export interface InventoryRepository {
  save(unidad: Unidad): Promise<void>;
  findById(id: string): Promise<Unidad | null>;
  findAll(): Promise<Unidad[]>;
  updateStatus(id: string, estado: string): Promise<void>;
}
