import { createClient } from '@/shared/api/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type DashboardEventType = 'lead' | 'hot_lead' | 'message_queue' | 'sentinel_metric';

export interface DashboardUpdate {
  type: DashboardEventType;
  data: unknown;
}

export function subscribeDashboard(
  onChange: () => void,
): () => void {
  const supabase = createClient();
  if (!supabase) return () => {};

  const channel: RealtimeChannel = supabase.channel('panel-dashboard');

  channel
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'hot_leads' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'message_queue' },
      () => onChange(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
