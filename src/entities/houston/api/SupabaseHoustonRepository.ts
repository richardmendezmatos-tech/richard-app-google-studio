import { createClient } from '@/shared/api/supabase/client';
import { HoustonRepository } from './HoustonRepository';
import { HoustonTelemetry, PurchaseOrder } from '../model/types';

export class SupabaseHoustonRepository implements HoustonRepository {
  async getTelemetry(): Promise<HoustonTelemetry> {
    // Note: Telemetry might still live in Firestore or be a hybrid.
    // For now, we'll focus on the Sourcing Intelligence part of this repo.
    throw new Error('Telemetry retrieval from Supabase not fully implemented. Use hybrid approach.');
  }

  async pushTelemetry(telemetry: Partial<HoustonTelemetry>): Promise<void> {
    // Implementation for Supabase telemetry if needed
  }

  subscribeToTelemetry(callback: (telemetry: HoustonTelemetry) => void): () => void {
    // Implementation for Supabase Realtime if needed
    return () => {};
  }

  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const supabase = createClient();
    if (!supabase) {
      console.warn('[SupabaseHoustonRepository] Supabase client not initialized. Returning empty PO list.');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST204' || error.code === '42P01') {
          console.warn('[SupabaseHoustonRepository] Table purchase_orders not found. Returning empty list.');
          return [];
        }
        console.error('[SupabaseHoustonRepository] Error fetching POs:', error);
        return [];
      }
      
      return (data || []) as PurchaseOrder[];
    } catch (e) {
      console.warn('[SupabaseHoustonRepository] Failed to fetch POs (Non-blocking):', e);
      return [];
    }
  }

  async updatePurchaseOrderStatus(id: string, status: 'confirmed' | 'archived'): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
      console.error('[SupabaseHoustonRepository] Cannot update PO: Supabase client not initialized.');
      return;
    }

    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('[SupabaseHoustonRepository] Error updating PO status:', error);
        throw error;
      }
    } catch (e) {
      console.error('[SupabaseHoustonRepository] Exception updating PO status:', e);
      throw e;
    }
  }
}
