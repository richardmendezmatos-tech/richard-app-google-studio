import React, { useEffect, useState, useMemo } from 'react';
import {
    Activity,
    Zap,
    Shield,
    Cpu,
    Terminal as TerminalIcon,
    ArrowUpRight,
    AlertCircle,
    Server,
    Radio,
    CheckCircle2
} from 'lucide-react';
import { container } from '@/infra/di/container';
import { HoustonTelemetry, OutreachOpportunity } from '@/domain/entities';
import { useMouseGlow } from '@/hooks/useMouseGlow';

/**
 * Houston Dashboard - Nivel 13 "Master Control Center"
 * Advanced telemetry UI with real-time AI performance monitoring.
 */
const HoustonDashboard: React.FC = () => {
    const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
    const [opportunities, setOpportunities] = useState<OutreachOpportunity[]>([]);
    const [jitter, setJitter] = useState<Record<string, number>>({});
    const terminalRef = React.useRef<HTMLDivElement>(null);
    const { containerRef } = useMouseGlow();

    const heatmapData = React.useMemo(() => {
        // Use a stable seed for mock data if possible, or just generate once
        return [...Array(50)].map((_, i) => ({
            age: (i * 7) % 120, // Deterministic mock age
            id: `unit-${i}-${Math.abs(Math.sin(i)).toString(36).substring(7)}`
        }));
    }, []);
    const getHoustonTelemetry = useMemo(() => container.getGetHoustonTelemetryUseCase(), []);
    const identifyOutreachOpportunities = useMemo(() => container.getIdentifyOutreachOpportunitiesUseCase(), []);

    useEffect(() => {
        const unsubscribe = getHoustonTelemetry.subscribe((data) => {
            setTelemetry(data);
        });

        // Initialize opportunities
        identifyOutreachOpportunities.execute(80).then(setOpportunities);

        // Metrics Jitter Simulation
        const jitterInterval = setInterval(() => {
            setJitter({
                inferenceLatency: (Math.random() - 0.5) * 4,
                tokenUsage: Math.floor((Math.random() - 0.5) * 50),
                apiStability: (Math.random() - 0.5) * 0.02
            });
        }, 800);

        return () => {
            unsubscribe();
            clearInterval(jitterInterval);
        };
    }, [getHoustonTelemetry, identifyOutreachOpportunities]);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [telemetry?.recentEvents]);

    if (!telemetry) return (
        <div className="h-screen bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <Radio className="text-cyan-500 animate-pulse mb-4" size={48} />
                <p className="text-cyan-500 font-mono tracking-widest uppercase text-xs">Uplink: Establishing Terminal...</p>
            </div>
        </div>
    );

    return (
        <div ref={containerRef as any} className="min-h-screen bg-black text-slate-300 font-mono p-4 md:p-8 relative overflow-hidden bg-noise">
            {/* HUD Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
                        <TerminalIcon className="text-cyan-500" /> Houston <span className="text-cyan-500 text-base font-mono tracking-[0.3em] ml-2">RA-SENTINEL v2.0</span>
                    </h1>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        <span className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${telemetry.systemHealth === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} /> Status: {telemetry.systemHealth}</span>
                        <span>Uptime: 99.999%</span>
                        <span>Location: RA-HQ-HOUSTON</span>
                    </div>
                </div>
                <div className="glass-premium px-6 py-3 flex items-center gap-4 border border-white/5">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-black">AI Autonomy Score</p>
                        <p className="text-2xl font-black text-cyan-400">{telemetry.metrics.autonomyRate.value}%</p>
                    </div>
                    <Activity className="text-cyan-500 animate-pulse" />
                </div>
            </header>

            <main className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
                {/* Metrics Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                    {Object.entries(telemetry.metrics).map(([key, metric]) => (
                        <div key={key} className="glass-premium p-6 border border-white/5 hover:border-cyan-500/30 transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                {key === 'inferenceLatency' && <Zap size={80} />}
                                {key === 'tokenUsage' && <Cpu size={80} />}
                                {key === 'autonomyRate' && <Shield size={80} />}
                                {key === 'apiStability' && <Server size={80} />}
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{metric.label}</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-white tracking-tighter">{metric.value}</span>
                                <span className="text-xs text-slate-500 mb-1 font-bold">{metric.unit}</span>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${metric.status === 'healthy' ? 'border-emerald-500/30 text-emerald-500' : 'border-amber-500/30 text-amber-500'
                                    }`}>
                                    {metric.status.toUpperCase()}
                                </span>
                                {metric.trend === 'up' && <ArrowUpRight className="text-emerald-500" size={16} />}
                                <div className="text-[8px] font-mono text-cyan-500/50 flex items-center gap-1">
                                    <div className="w-1 h-1 bg-cyan-500/50 rounded-full animate-ping" />
                                    <span>LIVE</span>
                                </div>
                            </div>
                            {jitter[key] !== undefined && (
                                <div className="absolute bottom-2 right-6 text-[8px] font-mono text-cyan-500/30">
                                    MOD: {jitter[key] > 0 ? '+' : ''}{jitter[key].toFixed(key === 'apiStability' ? 3 : 1)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Central Visualizer */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass-premium h-[400px] border border-white/5 p-8 relative flex flex-col justify-start overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,174,217,0.05)_0%,_transparent_70%)]" />

                        <div className="relative z-10 w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Unit Stock Age Heatmap
                                </h3>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Richard IA Scanning...</span>
                            </div>

                            {/* Heatmap Grid Simulation */}
                            <div className="grid grid-cols-10 gap-2">
                                {heatmapData.map((item, i) => {
                                    const { age } = item;
                                    const color = age > 90 ? 'bg-rose-500' : age > 60 ? 'bg-orange-500' : age > 30 ? 'bg-amber-500' : 'bg-emerald-500';
                                    const opacity = age > 90 ? 'opacity-100 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : age > 60 ? 'opacity-80' : age > 30 ? 'opacity-60' : 'opacity-40';
                                    return (
                                        <div
                                            key={item.id}
                                            className={`${color} ${opacity} aspect-square rounded-[2px] border border-white/5 relative group/item cursor-help transition-all duration-300 hover:scale-125 hover:z-20 hover:border-white/20`}
                                            title={`Unit RA-${1000 + i}: ${age} days`}
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                            {age > 90 && (
                                                <div className="absolute inset-0 bg-white/20 animate-ping rounded-sm" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 grid grid-cols-4 gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Avg Age</p>
                                    <p className="text-xl font-black text-white">42d</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Critical Units</p>
                                    <p className="text-xl font-black text-rose-500">8</p>
                                </div>
                                <div className="lg:col-span-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <div>
                                        <p className="text-[8px] text-emerald-500 uppercase font-black">Inventory Efficiency</p>
                                        <p className="text-[10px] text-white font-bold whitespace-nowrap">Optimizando rotación RA...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Log / Terminal */}
                    <div className="glass-premium border border-white/5 p-6 h-[250px] overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <TerminalIcon size={14} className="text-cyan-500" />
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Mission Control Feed</span>
                            <div className="ml-auto flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                                <span className="text-[8px] text-cyan-500 uppercase font-black tracking-tighter">Scanning Edge...</span>
                            </div>
                        </div>
                        <div
                            ref={terminalRef}
                            className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-2 scroll-smooth"
                        >
                            {telemetry.recentEvents.map(event => (
                                <div key={event.id} className="text-[10px] font-mono flex gap-4 hover:bg-white/5 p-1.5 rounded transition-all group/log">
                                    <span className="text-slate-600 shrink-0 select-none">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                                    <span className={`uppercase font-black min-w-[60px] ${event.type === 'error' ? 'text-red-500' : event.type === 'warning' ? 'text-amber-500' : 'text-cyan-400'
                                        }`}>
                                        {event.type}
                                    </span>
                                    <span className="text-slate-500 group-hover/log:text-slate-400 transition-colors shrink-0">[{event.source}]</span>
                                    <span className="text-slate-200 group-hover/log:text-white transition-colors flex-1">{event.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel / System Insights */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="glass-sentinel p-8 border border-white/5 h-fit mb-6">
                        <AlertCircle className="text-amber-500 mb-6" size={32} />
                        <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">System Insights</h3>
                        <ul className="space-y-6 text-xs text-slate-400">
                            <li className="flex gap-3">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full mt-1.5 shrink-0" />
                                <p><span className="text-white font-bold">Inference Optimizer</span> activo. Latencia reducida en un 12% tras la última purga de caché.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                <p><span className="text-white font-bold">Autonomy Threshold</span> alcanzado. Richard IA ha completado 12 retracciones sin intervención humana.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Nivel 14: Predictive Projections */}
                    <div className="glass-premium p-8 border border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <Zap size={16} className="text-cyan-500 animate-pulse" />
                        </div>
                        <h3 className="text-sm font-black text-cyan-400 uppercase mb-6 tracking-widest flex items-center gap-2">
                            <Activity size={14} /> Holo-Forecast
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Probabilidad de Cierre (Mes)</span>
                                    <span className="text-lg font-black text-white">78%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 w-[78%] shadow-[0_0_10px_#00aed9]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Leads Hot (Proj)</p>
                                    <p className="text-xl font-black text-emerald-500">+12</p>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">ROI Est (IA)</p>
                                    <p className="text-xl font-black text-cyan-500">2.4x</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            {opportunities.length > 0 ? (
                                opportunities.map((opp, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 border border-cyan-500/10 rounded-xl bg-cyan-500/5 animate-in fade-in slide-in-from-right duration-500 telemetry-bar delay-var group/opp relative"
                                        style={{ '--d': `${idx * 150}ms` } as React.CSSProperties}
                                    >
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-cyan-500 opacity-0 group-hover/opp:opacity-100 transition-opacity animate-pulse shadow-[0_0_8px_#00aed9]" />
                                        <p className="text-[9px] text-slate-400 italic font-medium leading-relaxed">
                                            <span className="text-cyan-500 font-bold mr-1">🦅 Outreach Opportunity:</span>
                                            {opp.reason}
                                        </p>
                                        <div className="mt-2 flex justify-between items-center">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Action: {opp.suggestedAction}</span>
                                            <span className="text-[8px] font-black text-cyan-500 uppercase tracking-tighter">Est ROI: {opp.potentialRoi}x</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 border border-cyan-500/10 rounded-xl bg-cyan-500/5">
                                    <p className="text-[9px] text-slate-400 italic font-medium leading-relaxed">
                                        <span className="text-cyan-500 font-bold mr-1">🦅 Nudge Suggestion:</span>
                                        Escaneando oportunidades de prospección soberana...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoustonDashboard;
