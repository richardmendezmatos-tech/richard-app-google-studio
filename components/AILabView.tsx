
import React, { useEffect, useRef } from 'react';
// @ts-expect-error: Vanilla HyperList is not typed for 2026 vite standard
import { createHyperList } from './vanilla/HyperList';
import { Activity, Zap, Cpu, Code2 } from 'lucide-react';

const AILabView: React.FC = () => {
  const hyperListRef = useRef<{ updateBatchStatus: (ids: number[], status: string) => void } | null>(null);

  useEffect(() => {
    // Mount the Vanilla High-Perf component
    hyperListRef.current = createHyperList('vanilla-hyper-list', 10000);

    // Simulation: Batch update every 2 seconds
    const interval = setInterval(() => {
      const randomIds = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10000));
      hyperListRef.current?.updateBatchStatus(randomIds, 'active');

      // Set timeout to clear
      setTimeout(() => {
        hyperListRef.current?.updateBatchStatus(randomIds, 'idle');
      }, 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Lab Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest mb-2 flex items-center gap-2">
            <Cpu size={12} /> Strategic Platform Engineering
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">AI Performance Lab</h1>
          <p className="text-slate-500 font-medium max-w-xl mt-2 text-sm italic">
            "Testing the limits of DOM throughput with Vanilla JS, DocumentFragments, and Reactive Signals (Vite 2026 Standard)."
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">DOM State</div>
            <div className="text-lg font-black text-white tracking-tight">Stable</div>
          </div>
          <div className="bg-[#00aed9]/10 border border-[#00aed9]/20 px-4 py-2 rounded-xl">
            <div className="text-[8px] font-black text-[#00aed9] uppercase tracking-widest">Reactive Core</div>
            <div className="text-lg font-black text-white tracking-tight">Signals</div>
          </div>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* HyperList Viewport */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/80">
            <div className="flex items-center gap-3">
              <Activity className="text-rose-500 animate-pulse" size={18} />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Hyper-List Viewport [10,000 Nodes]</span>
            </div>
            <div className="text-[9px] font-mono text-slate-500 px-3 py-1 bg-black rounded-lg border border-white/10 uppercase tracking-widest">
              No Virtualization Required
            </div>
          </div>

          {/* The Pure Vanilla Target */}
          <div id="vanilla-hyper-list" className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {/* Vanilla JS will inject 10,000 items here */}
          </div>
        </div>

        {/* Tech Specs Panel */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-amber-500" size={20} />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Vite 2026 Engine</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Reacting Primitive</div>
                <code className="text-[11px] block bg-black p-3 rounded-xl border border-white/10 text-emerald-400 font-mono">
                  import {'{'} signal {'}'} from './signals';
                </code>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">DOM Injection</div>
                <code className="text-[11px] block bg-black p-3 rounded-xl border border-white/10 text-[#00aed9] font-mono">
                  document.createDocumentFragment();
                </code>
              </div>

              <div className="pt-4 border-t border-white/5">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <Code2 size={14} className="text-slate-600" /> Layout Thrashing Prevention
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <Code2 size={14} className="text-slate-600" /> Atomic Batch Writes
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                    <Code2 size={14} className="text-slate-600" /> Microtask-based Notifications
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#00aed9]/20 to-purple-600/20 border border-[#00aed9]/20 p-8 rounded-[2rem] shadow-xl">
            <div className="text-xs font-black text-white uppercase tracking-widest mb-2">Strategic Insight</div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              En 2026, la clave no es añadir más frameworks, sino optimizar el acceso directo al DOM. El escalado de 10,000 elementos sin lag demuestra la eficiencia de las Señales (Signals) nativas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILabView;
