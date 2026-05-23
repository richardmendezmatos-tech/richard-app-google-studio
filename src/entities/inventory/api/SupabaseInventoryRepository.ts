// src/features/inventory-sync/infrastructure/database/SupabaseInventoryRepository.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { InventoryRepository } from './InventoryRepository';
import { Vehicle } from '../model/sync/Vehicle';

export class SupabaseInventoryRepository implements InventoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  // --- FRONTEND METHODS STUBS ---
  async getInventory(
    dealerId: string,
    limitCount: number = 100,
  ): Promise<import('@/entities/inventory').Car[]> {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('vin, make, model, year, price, mileage, images, status, condition')
      .limit(limitCount);

    if (error) {
      console.error('[SupabaseInventoryRepository] getInventory error:', error);
      return [];
    }

    return (data || []).map((row) => this.mapRowToCar(row));
  }

  async getCarById(id: string): Promise<import('@/entities/inventory').Car | null> {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('vin, make, model, year, price, mileage, images, status, condition')
      .eq('vin', id)
      .single();

    if (error || !data) return null;
    return this.mapRowToCar(data);
  }

  async getInventoryTurnover(dealerId: string): Promise<number> {
    // Turnover = (Sold / Total Portfolio) * 100
    const { data, error } = await this.supabase.from('inventory').select('status', { count: 'estimated', head: false });

    if (error || !data) return 0;
    const total = data.length;
    if (total === 0) return 0;

    const sold = data.filter((c) => c.status === 'SOLD').length;
    return parseFloat(((sold / total) * 100).toFixed(2));
  }

  private mapRowToCar(row: any): import('@/entities/inventory').Car {
    return {
      id: row.vin,
      vin: row.vin,
      make: row.make,
      model: row.model,
      year: row.year,
      price: row.price || 0,
      mileage: row.mileage || 0,
      image: row.images?.[0] || '/images/placeholders/car.webp',
      images: row.images || [],
      status: (row.status?.toLowerCase() as any) || 'available',
      condition: (row.condition?.toLowerCase() as any) || 'used',
      type: 'suv', // placeholder
      color: 'N/A',
      name: `${row.make} ${row.model} ${row.year}`,
    };
  }

  async getActiveInventory(): Promise<Vehicle[]> {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('vin, make, model, year, price, mileage, images, status, condition, last_scraped_at')
      .in('status', ['AVAILABLE', 'PENDING']);

    if (error) throw new Error(`Error en DB: ${error.message}`);

    return (data || []).map((row) =>
      Vehicle.create(row.vin, {
        make: row.make,
        model: row.model,
        year: row.year,
        price: row.price,
        mileage: row.mileage,
        images: row.images || [],
        status: row.status,
        condition: row.condition || 'USED',
        lastScrapedAt: new Date(row.last_scraped_at),
      }),
    );
  }

  async insertBatch(vehicles: Vehicle[]): Promise<void> {
    if (!vehicles.length) return;

    console.log(`[SupabaseInventoryRepository] Insertando ${vehicles.length} unidades nuevas...`);
    const payload = vehicles.map((v) => ({
      vin: v.vin,
      make: v.props.make,
      model: v.props.model,
      year: v.props.year,
      price: v.price,
      mileage: v.props.mileage,
      images: v.props.images,
      status: v.status,
      condition: v.props.condition,
      trim: v.props.trim,
      body_style: v.props.bodyStyle,
      transmission: v.props.transmission,
      engine: v.props.engine,
      drive_train: v.props.driveTrain,
      exterior_color: v.props.exteriorColor,
      interior_color: v.props.interiorColor,
      last_scraped_at: new Date().toISOString(),
    }));

    const { error } = await this.supabase.from('inventory').insert(payload);
    if (error) {
      console.error(`[SupabaseInventoryRepository] Error en insertBatch: ${error.message}`);
      throw new Error(`Insert Falló: ${error.message}`);
    }
    console.log('[SupabaseInventoryRepository] Inserción completada con éxito.');
  }

  async updateBatch(vehicles: Vehicle[]): Promise<void> {
    if (!vehicles.length) return;

    console.log(
      `[SupabaseInventoryRepository] Actualizando ${vehicles.length} unidades existentes...`,
    );

    const now = new Date().toISOString();
    const cases = vehicles.map((v) => ({
      vin: v.vin,
      price: v.price,
      status: v.status,
      mileage: v.props.mileage,
      images: v.props.images,
      trim: v.props.trim,
      body_style: v.props.bodyStyle,
      transmission: v.props.transmission,
      engine: v.props.engine,
      drive_train: v.props.driveTrain,
      exterior_color: v.props.exteriorColor,
      interior_color: v.props.interiorColor,
      last_scraped_at: now,
    }));

    const { error } = await this.supabase.rpc('batch_upsert_inventory', { vehicles_data: cases });

    if (error) {
      console.error(`[SupabaseInventoryRepository] Error en updateBatch: ${error.message}`);
      throw new Error(`Update Falló: ${error.message}`);
    }
  }

  async markAsSoldBatch(vins: string[]): Promise<void> {
    if (!vins.length) return;

    console.log(`[SupabaseInventoryRepository] Marcando ${vins.length} unidades como SOLD...`);
    const { error } = await this.supabase
      .from('inventory')
      .update({
        status: 'SOLD',
        // sold_at: new Date().toISOString() // Columna faltante en esquema actual, deshabilitado por seguridad
      })
      .in('vin', vins);

    if (error) {
      console.error(`[SupabaseInventoryRepository] Error en markAsSoldBatch: ${error.message}`);
      throw new Error(`MarkAsSold Falló: ${error.message}`);
    }
  }
}
