import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { supabase } from '@/shared/api/supabase/supabase';

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

  /**
   * PII Scrubbing: Sanitizes sensitive data patterns before logging.
   */
  private sanitize(text: string): string {
    if (!text) return text;

    // Pattern for phone numbers (PR/US)
    const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    // Pattern for emails
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    return text
      .replace(phonePattern, (match, p1, p2, p3, p4) => `${p1 || ''}(${p2}) ***-****`)
      .replace(emailPattern, (match) => {
        const [user, domain] = match.split('@');
        return `${user[0]}***@${domain}`;
      });
  }

  /**
   * Sentinel Alert System: Triggers notifications for critical events.
   */
  private async triggerAlert(event: AuditEvent) {
    if (event.type !== 'critical' && event.type !== 'error') return;

    try {
      // In a production environment, this would call an Edge Function or
      // an external service like Resend/Twilio.
      // For now, we simulate the hook for Richard Automotive Command Center.
      const payload = {
        alert: `🚨 SENTINEL ALERT: ${event.type.toUpperCase()}`,
        message: event.message,
        source: event.source,
        timestamp: event.timestamp,
        metadata: event.metadata,
      };

      if (typeof window === 'undefined') {
        // Server-side: Trigger internal alert sequence
        console.warn('⚡ [Sentinel Watchdog] Critical event detected. Alerting admin...');

        // Example: Call the WhatsApp notification API if available
        // await fetch(`${process.env.SITE_URL}/api/notifications/critical`, {
        //   method: 'POST',
        //   body: JSON.stringify(payload)
        // });
      }
    } catch (error) {
      console.error('❌ [AuditRepository] Failed to trigger alert:', error);
    }
  }

  async log(
    type: AuditEvent['type'],
    message: string,
    metadata?: Record<string, any>,
    source: string = 'SYSTEM',
  ): Promise<void> {
    try {
      const client = this.getClient();
      if (!client) return;

      const sanitizedMessage = this.sanitize(message);
      const timestamp = new Date().toISOString();

      // Sentinel N25: Operationalizing telemetry insertion with PII protection
      const { data: logEntry, error } = await client
        .from(this.tableName)
        .insert({
          level: type,
          message: sanitizedMessage,
          category: source,
          metadata: metadata || {},
          timestamp,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`[Audit] ${type.toUpperCase()}: ${sanitizedMessage} (${source})`);

      // Trigger proactive alerts if needed
      if (type === 'critical' || type === 'error') {
        if (typeof window === 'undefined') {
          const { ObservabilityService } = await import('@/server/services/observabilityService');
          await ObservabilityService.triggerCriticalAlert(
            `System Log: ${type.toUpperCase()}`,
            sanitizedMessage,
            source,
          );
        }
      }
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

    return data.map((log) => ({
      id: log.id,
      type: log.level as AuditEvent['type'],
      message: log.message,
      source: log.category || log.source || 'SYS',
      timestamp: log.timestamp,
      metadata: log.metadata,
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
