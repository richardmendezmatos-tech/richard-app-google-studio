import React, { useState, useEffect } from 'react';
import { createClient } from '@/shared/api/supabase/client';
import { CheckCircle2, XCircle, Bell, Zap, MessageSquare } from 'lucide-react';

interface ApprovalRequest {
  id: string;
  message: string;
  metadata: any;
  status: string;
  created_at: string;
}

export const SentinelInbox: React.FC = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const fetchRequests = async () => {
      const { data } = await supabase
        .from('agent_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setRequests(data || []);
      setLoading(false);
    };

    fetchRequests();

    // Real-time subscription
    const subscription = supabase
      .channel('agent_approvals_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_approvals' },
        (payload: any) => {
          setRequests((prev) => [payload.new as ApprovalRequest, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const supabase = createClient();
    if (!supabase) return;

    const { error } = await supabase.from('agent_approvals').update({ status }).eq('id', id);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  if (requests.length === 0 && !loading) return null;

  return (
    <div className="fixed bottom-24 right-6 w-80 z-50 animate-in slide-in-from-right-10 duration-700">
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl shadow-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell size={18} className="text-primary animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              Sentinel Inbox
            </h3>
          </div>
          <span className="text-[10px] font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {requests.length} PENDIENTES
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-300 leading-relaxed">
                    {req.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1 opacity-50">
                    <Zap size={10} className="text-purple-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      IA Proposal
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleAction(req.id, 'rejected')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <XCircle size={14} /> Rechazar
                </button>
                <button
                  onClick={() => handleAction(req.id, 'approved')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/20"
                >
                  <CheckCircle2 size={14} /> Aprobar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
