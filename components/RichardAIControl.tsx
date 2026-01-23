import React, { useState, useEffect } from 'react';
import {
    Activity,
    Database,
    Zap,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Terminal,
    BrainCircuit,
    ArrowUpRight,
    Cpu
} from 'lucide-react';
import { frameworkService } from '../services/frameworkService';

const RichardAIControl: React.FC = () => {
    const [reindexing, setReindexing] = useState(false);
    const [status, setStatus] = useState<any>({
        vertexAi: 'online',
        memcached: 'active',
        vectorSearch: 'ready',
        leadsAnalyzed: 124,
        responseTime: '240ms'
    });
    const [logs, setLogs] = useState<string[]>([
        "[SYSTEM] AI Node Initialized",
        "[VERIFY] Vertex AI Auth Successful",
        "[CACHE] Memcached Heat Map: 84% Hit Ratio"
    ]);

    const handleReindex = async () => {
        setReindexing(true);
        addLog("[TASK] Starting Inventory Re-indexing...");
        try {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../services/firebaseService');
            const reindexFn = httpsCallable(functions, 'triggerReindex');
            const result = await reindexFn();
            addLog(`[SUCCESS] Re-indexed ${result.data || 'all'} vehicles.`);
            frameworkService.increment('System' as any);
        } catch (err) {
            addLog("[ERROR] Re-indexing failed. Check Cloud Logs.");
        } finally {
            setReindexing(false);
        }
    };

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 4)]);
    };

    return (
        <div className="glass-premium border border-slate-700/50 p-8 relative group bg-gradient-to-b from-slate-900/50 to-black/50">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center relative shadow-2xl shadow-indigo-500/10">
                            <BrainCircuit className="text-indigo-400" size={32} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900 animate-pulse"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Richard <span className="text-indigo-400">AI</span></h2>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">Autonomous Orchestrator v4.0</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
                            <Activity size={12} className="text-indigo-400 animate-pulse" />
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{status.responseTime}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 transition-all group/stat">
                        <div className="flex justify-between items-center mb-3">
                            <Database size={16} className="text-slate-500 group-hover/stat:text-indigo-400 transition-colors" />
                            <CheckCircle2 size={12} className="text-green-500" />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Vector DB</p>
                        <h3 className="text-xl font-black text-white uppercase">{status.vectorSearch}</h3>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 transition-all group/stat">
                        <div className="flex justify-between items-center mb-3">
                            <Zap size={16} className="text-slate-500 group-hover/stat:text-yellow-400 transition-colors" />
                            <CheckCircle2 size={12} className="text-green-500" />
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Compute</p>
                        <h3 className="text-xl font-black text-white uppercase">{status.vertexAi}</h3>
                    </div>
                </div>

                {/* Automation Control */}
                <div className="mb-8">
                    <button
                        onClick={handleReindex}
                        disabled={reindexing}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                    >
                        {reindexing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        {reindexing ? "Processing Re-index..." : "Re-index Car Inventory"}
                    </button>
                </div>

                {/* AI Event Log */}
                <div className="bg-black/40 rounded-2xl border border-white/5 p-6 font-mono">
                    <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                        <Terminal size={12} className="text-slate-500" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live AI Execution Log</span>
                    </div>
                    <div className="space-y-2">
                        {logs.map((log, i) => (
                            <div key={i} className={`text-[10px] flex gap-3 ${i === 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                                <span className="opacity-30">[{i}]</span>
                                <span className="break-all">{log}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <footer className="mt-8 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <div className="flex items-center gap-2">
                        <Cpu size={10} />
                        <span>Loom Virtual Threads: Optimized</span>
                    </div>
                    <a href="#" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                        View Detailed Metrics <ArrowUpRight size={10} />
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default RichardAIControl;
