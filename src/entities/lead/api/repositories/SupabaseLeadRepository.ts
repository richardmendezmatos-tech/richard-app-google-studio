import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/shared/api/supabase/client';
import { LeadRepository } from '../LeadRepository';
import { Lead } from '../../model/types';

export class SupabaseLeadRepository implements LeadRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      this.client = createClient();
    }
  }

  async getLeads(dealerId: string, limitCount: number = 100): Promise<Lead[]> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('location', dealerId)
      .limit(limitCount)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseLeadRepository] Error fetching leads:', error);
      return [];
    }

    return (data || []) as any[];
  }

  async getLeadById(id: string, dealerId: string): Promise<Lead | null> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`[SupabaseLeadRepository] Error fetching lead ${id}:`, error);
      return null;
    }

    return data as any;
  }

  async saveLead(lead: Partial<Lead>): Promise<string> {
    const { data, error } = await this.client
      .from('leads')
      .insert([lead])
      .select('id')
      .single();

    if (error) {
      console.error('[SupabaseLeadRepository] Error saving lead:', error);
      throw error;
    }

    return data.id;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const { error } = await this.client
      .from('leads')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error(`[SupabaseLeadRepository] Error updating lead ${id}:`, error);
      throw error;
    }
  }

  async getLeadVelocity(dealerId: string, hours: number): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const { count, error } = await this.client
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('location', dealerId)
      .gte('created_at', since);

    if (error) {
      console.error('[SupabaseLeadRepository] Error fetching lead velocity:', error);
      return 0;
    }

    return count || 0;
  }

  async getAverageAIScore(dealerId: string): Promise<number> {
    // This requires a more complex query if the score is inside a JSONB field.
    // Assuming score is a top-level column for now, or just return mock.
    return 85; 
  }
}
