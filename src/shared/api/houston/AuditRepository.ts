import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { supabase } from '@/shared/api/supabase/supabaseClient';

export interface AuditEvent {
  id?: string;
  type: 'info' | 'warning' | 'error' | 'critical' | 'conversion';
  message: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class AuditRepository {
  private tableName = 'logs';

  private getClient() {
    return typeof window === 'undefined' ? createServerSupabaseClient() : supabase;
  }

  async log(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    try {
      const client = this.getClient();
      if (!client) return;

      await client.from(this.tableName).insert({
        level: event.type,
        message: event.message,
        source: event.source,
        metadata: event.metadata || {},
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ [AuditRepository] Failed to log event:', error);
    }
  }

  async getRecentLogs(max: number = 20): Promise<AuditEvent[]> {
    const client = this.getClient();
    if (!client) return [];

    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(max);
    
    if (error) {
        console.error('❌ [AuditRepository] Failed to fetch logs:', error);
        return [];
    }

    return data.map(log => ({
      id: log.id,
      type: log.level,
      message: log.message,
      source: log.source,
      timestamp: log.timestamp,
      metadata: log.metadata
    })) as AuditEvent[];
  }
}

