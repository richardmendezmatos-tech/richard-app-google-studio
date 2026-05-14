"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Link2 } from 'lucide-react';

export const WhatsAppStatusWidget = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Simulation of status check based on env variables (in a real app, this would be an API call)
  useEffect(() => {
    const timer = setTimeout(() => {
      // In production, we'd check if WHATSAPP_ACCESS_TOKEN exists and is valid
      const isConfigured = false; // Mocking as false initially to guide the user
      setStatus(isConfigured ? 'connected' : 'disconnected');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-4 hover:border-emerald-500/20 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${status === 'connected' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <MessageSquare size={20} className={status === 'connected' ? 'text-emerald-400' : 'text-rose-400'} />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">WhatsApp Business</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Meta Cloud API • v21.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
          {status === 'checking' ? (
            <Loader2 size={10} className="text-slate-400 animate-spin" />
          ) : status === 'connected' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">
            {status === 'checking' ? 'Validando...' : status === 'connected' ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Templates</p>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={12} className="text-emerald-500" />
             <span className="text-[10px] font-black text-white">3 Activos</span>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1">Webhook</p>
          <div className="flex items-center gap-1.5">
             <Link2 size={12} className="text-cyan-400" />
             <span className="text-[10px] font-black text-white italic">Ready</span>
          </div>
        </div>
      </div>

      {status === 'disconnected' && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Credenciales Faltantes</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Para activar la IA en WhatsApp, vincula tu <span className="text-white font-bold">Access Token</span> en la configuración.
          </p>
          <button className="w-full py-2 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Vincular Ahora
          </button>
        </div>
      )}

      {status === 'connected' && (
        <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
           <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Neural Link Secure</span>
           </div>
           <span className="text-[10px] font-mono text-emerald-500/50">#RA-WS-787</span>
        </div>
      )}
    </div>
  );
};
