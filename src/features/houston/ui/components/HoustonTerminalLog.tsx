import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronRight } from 'lucide-react';

export const HoustonTerminalLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] RA OS v3.2 initialized.",
    "[INTEL] Neural sync with Richard AI complete.",
    "[NETWORK] Sentinel nodes 04/04 online.",
    "[SECURITY] Firewall at 100% efficiency."
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      "Optimizing inventory metadata...",
      "Syncing with Google Studio Brain...",
      "Analyzing market trends in Houston...",
      "Predictive model: Toyota Tacoma demand +15%",
      "Sentinel status: Monitoring dealer traffic...",
      "RA Intelligence: Strategy Lab active."
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${randomMsg}`]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/40 rounded-2xl border border-white/5 p-4 font-mono text-[10px] h-[180px] overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5 text-cyan-500/50 uppercase tracking-[0.2em] font-black">
        <TerminalIcon size={12} /> Live RA Terminal
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 no-scrollbar scroll-smooth">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <ChevronRight size={10} className="text-primary flex-shrink-0 mt-0.5" />
            <span className={log.includes('[SYSTEM]') ? 'text-cyan-400' : 'text-slate-400'}>
              {log}
            </span>
          </div>
        ))}
        <div className="animate-pulse text-primary font-black">_</div>
      </div>
    </div>
  );
};
