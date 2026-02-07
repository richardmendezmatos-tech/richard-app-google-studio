
import React, { useEffect, useRef } from 'react';
// @ts-expect-error: Vanilla HyperList is not typed for 2026 vite standard
import { createHyperList } from '@/components/layout/vanilla/HyperList';
import { Activity, Zap, Cpu, Code2 } from 'lucide-react';
const SandboxEnvironment = React.lazy(() => import('./SandboxEnvironment'));

const AILabView: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'performance' | 'sandbox'>('performance');
  const hyperListRef = useRef<{ updateBatchStatus: (ids: number[], status: string) => void } | null>(null);

  useEffect(() => {
    if (activeTab !== 'performance') return;

    // Mount the Vanilla High-Perf component
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      hyperListRef.current = createHyperList('vanilla-hyper-list', 10000);
    }, 100);

    // Simulation: Batch update every 2 seconds
    const interval = setInterval(() => {
      const randomIds = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10000));
      hyperListRef.current?.updateBatchStatus(randomIds, 'active');

      // Set timeout to clear
      setTimeout(() => {
        hyperListRef.current?.updateBatchStatus(randomIds, 'idle');
      }, 1000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [activeTab]);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-700 min-h-screen">
      {/* Lab Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest mb-2 flex items-center gap-2">
            <Cpu size={12} /> Strategic Platform Engineering
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">AI Performance Lab</h1>
          <p className="text-slate-500 font-medium max-w-xl mt-2 text-sm italic">
            "Testing the limits of DOM throughput with Vanilla JS and providing a live execution environment for AI-generated React components."
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            DOM Stress Test
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'sandbox' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            <Code2 size={14} />
            Live Sandbox
          </button>
        </div>
      </div>

      {activeTab === 'performance' ? (
        /* Main Visualizer Container */
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
      ) : (
        /* Sandbox View */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
            <div className="bg-black/50 p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3 px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
                <span className="text-xs font-mono text-slate-500 ml-2">sandbox-env-v1.tsx</span>
              </div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                Live Execution Ready
              </div>
            </div>
            <div className="p-1">
              <React.Suspense fallback={<div className="h-[600px] flex items-center justify-center text-slate-500">Loading Sandbox Engine...</div>}>
                <SandboxEnvironment />
              </React.Suspense>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
              <h3 className="text-white font-bold mb-2">Prototipado Rápido</h3>
              <p className="text-sm text-slate-400">Prueba componentes de leads, inventario o UI elements aislados del resto de la app.</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
              <h3 className="text-white font-bold mb-2">Tailwind Nativo</h3>
              <p className="text-sm text-slate-400">El entorno tiene Tailwind CSS pre-configurado para que copies y pegues código directamente.</p>
            </div>
            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
              <h3 className="text-white font-bold mb-2">Seguridad</h3>
              <p className="text-sm text-slate-400">El código se ejecuta en un iframe aislado, protegiendo la aplicación principal de errores fatales.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AILabView;
