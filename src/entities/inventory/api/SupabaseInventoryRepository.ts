// src/features/inventory-sync/infrastructure/database/SupabaseInventoryRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { InventoryRepository } from './InventoryRepository';
import { Vehicle } from '../model/sync/Vehicle';

export class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getActiveInventory(): Promise<Vehicle[]> {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('*')
      .in('status', ['AVAILABLE', 'PENDING']);

    if (error) throw new Error(`Error en DB: ${error.message}`);
    
    // Aquí implementamos el Mapper para no contaminar el dominio con detalles de la BD
    return (data || []).map(row => 
      Vehicle.create(row.vin, {
        make: row.make,
        model: row.model,
        year: row.year,
        price: row.price,
        mileage: row.mileage,
        images: row.images || [],
        status: row.status,
        lastScrapedAt: new Date(row.last_scraped_at)
      })
    );
  }

  async insertBatch(vehicles: Vehicle[]): Promise<void> {
    if (!vehicles.length) return;

    const payload = vehicles.map(v => ({
      vin: v.vin,
      make: v.props.make,
      model: v.props.model,
      year: v.props.year,
      price: v.price,
      mileage: v.props.mileage,
      images: v.props.images,
      status: v.status,
      last_scraped_at: new Date().toISOString()
    }));

    const { error } = await this.supabase.from('inventory').insert(payload);
    if (error) throw new Error(`Insert Falló: ${error.message}`);
  }

  async updateBatch(vehicles: Vehicle[]): Promise<void> {
    if (!vehicles.length) return;
    
    // Supabase JS no tiene un mass-update dinámico por defecto.
    // En PostgreSQL real (y vía Supabase RPC) se usaría un upsert rápido.
    // Usaremos upsert explícito asumiendo que el VIN es primary/unique key.
    const payload = vehicles.map(v => ({
      vin: v.vin,
      price: v.price,
      status: v.status,
      last_scraped_at: new Date().toISOString()
    }));

    const { error } = await this.supabase
      .from('inventory')
      .upsert(payload, { onConflict: 'vin', ignoreDuplicates: false });
      
    if (error) throw new Error(`Update Falló: ${error.message}`);
  }

  async markAsSoldBatch(vins: string[]): Promise<void> {
    if (!vins.length) return;

    const { error } = await this.supabase
      .from('inventory')
      .update({ status: 'SOLD', sold_at: new Date().toISOString() })
      .in('vin', vins);

    if (error) throw new Error(`MarkAsSold Falló: ${error.message}`);
  }
}
