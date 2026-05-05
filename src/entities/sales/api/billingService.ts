import { supabase } from '@/shared/api/supabase/supabaseClient';

export type MonetizableEvent = 'ai_call' | 'lead_capture' | 'doc_processed' | 'onboarding';

export interface UsageLog {
  dealerId: string;
  eventType: MonetizableEvent;
  count: number;
  metadata?: Record<string, unknown>;
  costEstimate?: number; // Estimated internal cost in USD
  timestamp?: string;
}

export const logUsageEvent = async (event: UsageLog) => {
  try {
    if (!supabase) return;
    await supabase.from('usage_logs').insert({
      dealer_id: event.dealerId,
      event_type: event.eventType,
      count: event.count,
      metadata: event.metadata || {},
      cost_estimate: event.costEstimate || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Billing Log Error:', err);
  }
};

export const getUsageLogs = async (
  dealerId: string,
  limitCount: number = 50,
): Promise<UsageLog[]> => {
  try {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('dealer_id', dealerId)
      .order('timestamp', { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    return (data || []).map(log => ({
      dealerId: log.dealer_id,
      eventType: log.event_type,
      count: log.count,
      metadata: log.metadata,
      costEstimate: log.cost_estimate,
      timestamp: log.timestamp
    }));
  } catch (err) {
    console.error('Fetch Usage Logs Error:', err);
    return [];
  }
};

// Estimación de costos simplificada (COO level)
export const calculateAICost = (tokens: number): number => {
  // Aprox $0.002 per 1k tokens for Gemini Pro (simplified)
  return (tokens / 1000) * 0.002;
};

