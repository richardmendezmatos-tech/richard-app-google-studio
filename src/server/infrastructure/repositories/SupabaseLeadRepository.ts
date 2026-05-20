import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { LeadRepository } from '../../domain/repositories/ILeadRepository';
import { Lead } from '../../domain/entities';

export class SupabaseLeadRepository implements LeadRepository {
  private tableName = 'leads';

  async getById(id: string): Promise<Lead | null> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (error) return null;
    return data as Lead;
  }

  async getHotLeads(limit: number): Promise<Lead[]> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_hot', true)
      .limit(limit);
    if (error) return [];
    return data as Lead[];
  }

  async getStaleLeads(days: number, limitCount: number): Promise<Lead[]> {
    const supabase = createServerSupabaseClient();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .lt('updated_at', cutoff)
      .limit(limitCount);
    if (error) return [];
    return data as Lead[];
  }

  async getLeadsByVehicleId(vehicleId: string): Promise<Lead[]> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('vehicle_id', vehicleId);
    if (error) return [];
    return data as Lead[];
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from(this.tableName).update(data).eq('id', id);
    if (error) throw error;
  }

  async create(data: Lead): Promise<string> {
    const supabase = createServerSupabaseClient();
    const { data: inserted, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select('id')
      .single();
    if (error) throw error;
    return inserted.id;
  }

  async getLeadsByEmailSequenceStatus(
    field: string,
    value: any,
    operator: '<=' | '==' | '!=' | '>=',
    limitCount: number,
  ): Promise<Lead[]> {
    const supabase = createServerSupabaseClient();
    let query = supabase.from(this.tableName).select('*');

    // Map operators
    const opMap = {
      '==': 'eq',
      '!=': 'neq',
      '<=': 'lte',
      '>=': 'gte',
    };

    const method = opMap[operator] || 'eq';
    query = (query as any)[method](field, value);

    const { data, error } = await query.limit(limitCount);
    if (error) return [];
    return data as Lead[];
  }

  async getGarageByUserId(userId: string): Promise<any[]> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('garage').select('*').eq('user_id', userId);
    if (error) return [];
    return data;
  }
}
