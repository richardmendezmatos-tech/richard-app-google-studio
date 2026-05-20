import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export class SupabaseCRMRepository {
  private tableName = 'leads';

  async getById(id: string) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async update(id: string, updates: any) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from(this.tableName).update(updates).eq('id', id);
    if (error) throw error;
  }

  // Add other necessary methods to match the interface used by LeadLifecycleManager
  async save(lead: any) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from(this.tableName).upsert(lead);
    if (error) throw error;
  }
}
