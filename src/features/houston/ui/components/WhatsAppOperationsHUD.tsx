'use client';

import React from 'react';
import { MessageCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface WhatsAppStats {
  sent: number;
  scheduled: number;
  failed: number;
}

interface Props {
  stats?: WhatsAppStats;
}

export const WhatsAppOperationsHUD: React.FC<Props> = ({ stats }) => {
  const defaultStats = { sent: 0, scheduled: 0, failed: 0 };
  const s = stats || defaultStats;

  const total = s.sent + s.scheduled + s.failed;
  const successRate = total > 0 ? Math.round((s.sent / total) * 100) : 100;

  return (
    <div className="glass-premium p-6 border border-emerald-500/10 group hover:border-emerald-500/20 transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <MessageCircle className="text-emerald-400" size={20} />
          </div>
          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Omnichannel Hub</h4>
        </div>
        <div className="text-[10px] font-black text-white italic">{successRate}% Health</div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
          <CheckCircle2 size={14} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-lg font-black text-white">{s.sent}</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Enviados</p>
        </div>
        <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
          <Clock size={14} className="text-cyan-500 mx-auto mb-2" />
          <p className="text-lg font-black text-white">{s.scheduled}</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Program.</p>
        </div>
        <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/5 text-center">
          <AlertCircle size={14} className="text-amber-500 mx-auto mb-2" />
          <p className="text-lg font-black text-white">{s.failed}</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Fallidos</p>
        </div>
      </div>

      <div className="mt-6 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000"
          style={{ width: `${successRate}%` }}
        />
      </div>
    </div>
  );
};
