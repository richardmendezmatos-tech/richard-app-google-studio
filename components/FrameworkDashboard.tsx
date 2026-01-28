import React, { useState, useEffect, useRef, useMemo } from 'react';
import { frameworkService, FrameworkState } from '../services/frameworkService';
import { Cpu, RotateCcw, Activity, Zap, Server, Shield, Terminal, Share2, Layers } from 'lucide-react';

const FrameworkDashboard: React.FC = () => {
    const [state, setState] = useState<FrameworkState>(frameworkService.getCurrentState());
    const [logs, setLogs] = useState<string[]>([]);
    const [metrics, setMetrics] = useState({ latency: 0, memory: 0, throughput: 0 });
    const logEndRef = useRef<HTMLDivElement>(null);

    // Subscribe to Framework Service
    useEffect(() => {
        const sub = frameworkService.getState().subscribe(newState => {
            setState(newState);
            // Add to logs with timestamp
            const time = new Date().toLocaleTimeString();
            setLogs(prev => [`[${time}] ${newState.source.toUpperCase()}: ${newState.lastAction}`, ...prev].slice(0, 50));
        });
        return () => sub.unsubscribe();
    }, []);

    // Simulate High-Frequency Metrics
    useEffect(() => {
        const interval = setInterval(() => {
            setMetrics({
                latency: Math.floor(10 + Math.random() * 20), // 10-30ms
                memory: Math.floor(40 + Math.random() * 15), // 40-55% heap
                throughput: Math.floor(100 + Math.random() * 500) // fake ops/sec
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen p-4 md:p-10 space-y-8 animate-in fade-in duration-700 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-mono">

            {/* HERITAGE HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-cyan-900/30 pb-6 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black tracking-[0.3em] text-cyan-400 uppercase">System Online</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <Cpu className="text-cyan-500 hidden md:block" size={48} strokeWidth={1} />
                        Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Nexus</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 max-w-xl">
                        Orquestador de alta frecuencia v10.0. Gestionando estado unificado y telemetría en tiempo real.
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Uptime</div>
                        <div className="text-xl font-bold text-emerald-500 font-mono">99.99%</div>
                    </div>
                    <button
                        onClick={() => frameworkService.reset('System')}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg uppercase font-bold text-xs tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Reset Core
                    </button>
                </div>
            </div>

            {/* REAL-TIME METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Global Events"
                    value={state.globalCount.toLocaleString()}
                    icon={Activity}
                    color="text-cyan-400"
                    chartColor="bg-cyan-500"
                    detail="+12% vs avg"
                />
                <MetricCard
                    label="Core Latency"
                    value={`${metrics.latency}ms`}
                    icon={Zap}
                    color="text-amber-400"
                    chartColor="bg-amber-500"
                    detail="Optimal Range"
                />
                <MetricCard
                    label="Heap Usage"
                    value={`${metrics.memory}%`}
                    icon={Server}
                    color="text-emerald-400"
                    chartColor="bg-emerald-500"
                    detail="Stable"
                />
                <MetricCard
                    label="Active Nodes"
                    value="1"
                    icon={Share2}
                    color="text-purple-400"
                    chartColor="bg-purple-500"
                    detail="Single Runtime"
                />
            </div>

            {/* MAIN DASHBOARD LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">

                {/* LEFT: ACTIVE ARCHITECTURE */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-[1px] bg-gradient-to-br from-white/10 to-transparent rounded-3xl overflow-hidden">
                        <div className="bg-slate-950/80 backdrop-blur-xl p-8 h-full rounded-3xl relative overflow-hidden group">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,174,217,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,174,217,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase flex items-center gap-3">
                                        <Layers className="text-cyan-500" /> Active Architecture
                                    </h3>
                                    <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Visualizing Module Interconnects</p>
                                </div>
                                <div className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] font-bold uppercase border border-cyan-500/20 animate-pulse">
                                    Live Processing
                                </div>
                            </div>

                            {/* Architecture Diagram Visualization */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                                <ModuleCard title="React Core" status="Active" ping={metrics.latency} />
                                <ModuleCard title="State Bus" status="Active" ping={2} />
                                <ModuleCard title="Auth Gate" status="Idle" ping={0} />
                                <ModuleCard title="Data Layer" status="Active" ping={metrics.latency + 5} />
                                <ModuleCard title="AI Engine" status="Standby" ping={0} />
                                <ModuleCard title="Telemetry" status="Active" ping={metrics.latency} />
                            </div>
                        </div>
                    </div>

                    {/* LAST ACTION BANNER */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/5 flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Last System Action</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono truncate max-w-md">{state.lastAction}</div>
                        </div>
                        <div className="px-4 py-2 bg-slate-800 rounded text-xs font-bold text-slate-400 font-mono uppercase">
                            Source: {state.source}
                        </div>
                    </div>
                </div>

                {/* RIGHT: TERMINAL & CONTROL */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* TERMINAL */}
                    <div className="flex-1 bg-black rounded-3xl border border-white/10 p-6 font-mono text-xs overflow-hidden flex flex-col shadow-2xl shadow-black">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                            <Terminal size={14} className="text-emerald-500" />
                            <span className="text-emerald-500 font-bold uppercase tracking-widest">System Log</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 opacity-80" ref={logEndRef}>
                            {logs.map((log, i) => (
                                <div key={i} className="text-slate-300 border-l-2 border-slate-800 pl-3 leading-relaxed hover:bg-white/5 transition-colors p-1">
                                    {log}
                                </div>
                            ))}
                            {logs.length === 0 && <div className="text-slate-600 italic">Waiting for events...</div>}
                        </div>
                    </div>

                    {/* SMALL SYSTEM VITALS */}
                    <div className="p-6 rounded-3xl bg-slate-900 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase font-bold text-slate-500">Security Shield</span>
                            <Shield size={16} className="text-emerald-500" />
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-full animate-pulse"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Encryption: AES-256</span>
                            <span className="text-emerald-500">SECURE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUBCOMPONENTS ---

const MetricCard = ({ label, value, icon: Icon, color, chartColor, detail }: any) => (
    <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group cursor-default backdrop-blur-sm">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
                <Icon size={20} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${color} bg-white/5 px-2 py-1 rounded`}>{detail}</span>
        </div>
        <div className="text-3xl font-black text-white tracking-tighter mb-1">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>

        {/* Fake Mini Chart */}
        <div className="flex gap-1 mt-4 h-1 items-end opacity-50 group-hover:opacity-100 transition-opacity">
            {[...Array(10)].map((_, i) => (
                <div
                    key={i}
                    className={`flex-1 rounded-full ${chartColor}`}
                    style={{ height: `${Math.random() * 100}%` }}
                />
            ))}
        </div>
    </div>
);

const ModuleCard = ({ title, status, ping }: any) => (
    <div className="p-4 bg-slate-900 border border-white/5 rounded-xl flex flex-col gap-2 hover:border-cyan-500/30 transition-all cursor-crosshair">
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase">{title}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
        </div>
        <div className="flex justify-between items-end mt-auto">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{status}</span>
            {status === 'Active' && <span className="text-[10px] text-cyan-500 font-mono">{ping}ms</span>}
        </div>
    </div>
);

export default FrameworkDashboard;
