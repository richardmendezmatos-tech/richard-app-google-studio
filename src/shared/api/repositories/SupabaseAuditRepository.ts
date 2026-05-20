import { supabase } from '../supabase/supabaseClient';

export interface AuditLog {
  id: string;
  email: string;
  ip: string;
  device: string;
  method: string;
  success: boolean;
  timestamp: any;
}

export const getAuditLogs = async (limit: number = 50): Promise<AuditLog[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data.map((log) => ({
    ...log,
    timestamp: log.timestamp ? { toDate: () => new Date(log.timestamp) } : null,
  })) as AuditLog[];
};
