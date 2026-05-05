import { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export class SupabaseSaleRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || createServerSupabaseClient();
  }

  async executeSecureSale(carId: string, leadData: any, dealerId: string) {
    try {
      // Supabase transaction simulation (sequential with error rollback logic if needed, 
      // but here we use a single RPC if we wanted true atomicity).
      // For simplicity in this migration, we'll do sequential calls.
      
      // 1. Check availability
      const { data: car, error: carError } = await this.client
        .from('inventory')
        .select('status')
        .eq('vin', carId)
        .single();

      if (carError || !car) throw new Error('Vehículo no existe');
      if (car.status === 'SOLD' || car.status === 'PENDING') {
        throw new Error('El vehículo ya no está disponible');
      }

      // 2. Update inventory status
      const { error: updateError } = await this.client
        .from('inventory')
        .update({
          status: 'PENDING',
          updated_at: new Date().toISOString()
        })
        .eq('vin', carId);

      if (updateError) throw updateError;

      // 3. Create Lead/Application
      const { data: lead, error: leadError } = await this.client
        .from('leads')
        .insert([{
          ...leadData,
          vehicle_id: carId,
          location: dealerId,
          status: 'new',
          created_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (leadError) throw leadError;

      return { success: true, appId: lead.id };
    } catch (error: any) {
      console.error('❌ [SupabaseSaleRepository] Fallo en transacción de venta:', error);
      throw error;
    }
  }
}
