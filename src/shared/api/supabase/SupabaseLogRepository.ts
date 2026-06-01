import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { LogRepository } from '@/shared/api/repositories/ILogRepository';

export class SupabaseLogRepository implements LogRepository {
  private tableName = 'audit_logs';

  async deleteLogsOlderThan(days: number): Promise<number> {
    const supabase = createServerSupabaseClient();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from(this.tableName)
      .delete({ count: 'exact' })
      .lt('created_at', cutoff);

    if (error) throw error;
    return count || 0;
  }

  async recordAction(action: string, metadata: any): Promise<void> {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from(this.tableName).insert({
      action,
      metadata,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}
