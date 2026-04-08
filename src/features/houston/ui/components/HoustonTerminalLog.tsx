import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

interface TerminalEvent {
  id: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
}

interface Props {
  events?: TerminalEvent[];
}

export const HoustonTerminalLog: React.FC<Props> = ({ events }) => {
  const bootLogs = [
    '[SYSTEM] RA OS v4.5_N14 initialized.',
    '[INTEL] Structural Observability sync complete.',
    '[NETWORK] Sentinel AP-01 online.',
    '[SECURITY] Level 14 protocols active.',
  ];
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derive current logs from props + boot logs
  const allLogs = [
    ...bootLogs,
    ...(events || []).map(e => `[${new Date(e.timestamp).toLocaleTimeString()}] [${e.type.toUpperCase()}] ${e.message}`)
  ].slice(-20);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allLogs]);

  const getLogColor = (log: string) => {
    if (log.includes('[ERROR]') || log.includes('[CRITICAL]')) return 'text-rose-500';
    if (log.includes('[WARNING]')) return 'text-amber-500';
    if (log.includes('[CONVERSION]')) return 'text-emerald-400 font-bold';
    if (log.includes('[SYSTEM]') || log.includes('[INTEL]')) return 'text-cyan-400';
    return 'text-slate-400';
  };

  return (
    <div className="bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[10px] h-[180px] overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5 text-cyan-500/50 uppercase tracking-[0.2em] font-black">
        <TerminalIcon size={12} /> Live RA Terminal • N14
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 no-scrollbar scroll-smooth">
        {allLogs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <ChevronRight size={10} className="text-primary flex-shrink-0 mt-0.5 shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]" />
            <span className={getLogColor(log)}>
              {log}
            </span>
          </div>
        ))}
        <div className="animate-pulse text-primary font-black">_</div>
      </div>
    </div>
  );
};
