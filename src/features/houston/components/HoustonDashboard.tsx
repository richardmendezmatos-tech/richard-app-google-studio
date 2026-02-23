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
    Radio
} from 'lucide-react';
import { container } from '@/infra/di/container';
import { HoustonTelemetry } from '@/domain/entities';
import { useMouseGlow } from '@/hooks/useMouseGlow';

/**
 * Houston Dashboard - Nivel 13 "Master Control Center"
 * Advanced telemetry UI with real-time AI performance monitoring.
 */
const HoustonDashboard: React.FC = () => {
    const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
    const { containerRef } = useMouseGlow();
    const getHoustonTelemetry = useMemo(() => container.getGetHoustonTelemetryUseCase(), []);

    useEffect(() => {
        const unsubscribe = getHoustonTelemetry.subscribe((data) => {
            setTelemetry(data);
        });
        return () => unsubscribe();
    }, [getHoustonTelemetry]);

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
                        <TerminalIcon className="text-cyan-500" /> Houston <span className="text-cyan-500 text-base font-mono tracking-[0.3em] ml-2">v2.0-SENTINEL</span>
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
                            </div>
                        </div>
                    ))}
                </div>

                {/* Central Visualizer */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="glass-premium h-[400px] border border-white/5 p-8 relative flex flex-col justify-center items-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,174,217,0.05)_0%,_transparent_70%)]" />

                        {/* Simulation of Waveform/Data Visualizer */}
                        <div className="flex items-end gap-1 h-32 w-full max-w-md">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-cyan-500/30 w-full rounded-t-sm animate-pulse"
                                    style={{
                                        height: `var(--h, ${20 + (i % 5) * 15 + Math.sin(i * 0.5) * 10}%)`,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                />
                            ))}
                        </div>
                        <p className="mt-8 text-xs text-cyan-500 uppercase tracking-[0.5em] font-black animate-pulse">Neural Thread Processing...</p>
                    </div>

                    {/* Mission Log / Terminal */}
                    <div className="glass-premium border border-white/5 p-6 h-[250px] overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <TerminalIcon size={14} className="text-cyan-500" />
                            <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Mission Control Feed</span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {telemetry.recentEvents.map(event => (
                                <div key={event.id} className="text-[11px] font-mono flex gap-4 hover:bg-white/5 p-1 transition-colors">
                                    <span className="text-slate-600">[{new Date(event.timestamp).toLocaleTimeString()}]</span>
                                    <span className={`uppercase font-bold ${event.type === 'error' ? 'text-red-500' : event.type === 'warning' ? 'text-amber-500' : 'text-cyan-500'
                                        }`}>
                                        {event.type}
                                    </span>
                                    <span className="text-slate-400">[{event.source}]</span>
                                    <span className="text-white">{event.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel / System Insights */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="glass-sentinel p-8 border border-white/5 h-full">
                        <AlertCircle className="text-amber-500 mb-6" size={32} />
                        <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">System Insights</h3>
                        <ul className="space-y-6 text-xs text-slate-400">
                            <li className="flex gap-3">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full mt-1.5 shrink-0" />
                                <p><span className="text-white font-bold">Inference Optimizer</span> activo. Latencia reducida en un 12% tras la última purga de caché.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                <p><span className="text-white font-bold">Autonomy Threshold</span> alcanzado. VitalOS ha completado 12 retracciones sin intervención humana.</p>
                            </li>
                            <li className="flex gap-3">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full mt-1.5 shrink-0" />
                                <p><span className="text-white font-bold">NotebookLM Sync</span> detectado. Nueva base de conocimiento de inventario procesada.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HoustonDashboard;
