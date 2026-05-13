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
  private tableName = 'system_logs';

  private getClient() {
    return typeof window === 'undefined' ? createServerSupabaseClient() : supabase;
  }

  async log(type: AuditEvent['type'], message: string, metadata?: Record<string, any>, source: string = 'SYSTEM'): Promise<void> {
    try {
      const client = this.getClient();
      if (!client) return;

      // Sentinel N25: Operationalizing telemetry insertion
      await client.from(this.tableName).insert({
        level: type,
        message: message,
        category: source,
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      });
      
      console.log(`[Audit] ${type.toUpperCase()}: ${message} (${source})`);
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
      type: log.level as AuditEvent['type'],
      message: log.message,
      source: log.category || log.source || 'SYS',
      timestamp: log.timestamp,
      metadata: log.metadata
    }));
  }
}

// Singleton helper for easy access in agents and features
let auditInstance: AuditRepository | null = null;
export const getAuditRepository = async () => {
  if (!auditInstance) {
    auditInstance = new AuditRepository();
  }
  return auditInstance;
};

