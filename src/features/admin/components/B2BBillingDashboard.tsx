import React, { useState, useEffect } from 'react';
import { db } from '@/services/firebaseService';
import { collection, query, orderBy, getDocs } from 'firebase/firestore/lite';
import { CreditCard, TrendingUp, AlertTriangle, Download, DollarSign, Cpu, Activity, Clock } from 'lucide-react';

interface UsageLog {
    dealerId?: string;
    eventType?: string;
    count?: number;
    costEstimate?: number;
}

const B2BBillingDashboard = () => {
    const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
    const [stats, setStats] = useState({
        totalCost: 0,
        totalEvents: 0,
        mrr: 1000 // Mock for Prestige Auto
    });

    useEffect(() => {
        let cancelled = false;
        const loadUsageLogs = async () => {
            try {
                const q = query(collection(db, 'usage_logs'), orderBy('timestamp', 'desc'));
                const snapshot = await getDocs(q);
                if (cancelled) return;
                const logs = snapshot.docs.map(doc => doc.data() as UsageLog);
                setUsageLogs(logs);

                const cost = logs.reduce((sum, log) => sum + (log.costEstimate || 0), 0);
                setStats(prev => ({
                    ...prev,
                    totalCost: cost,
                    totalEvents: logs.length
                }));
            } catch (error) {
                console.error('B2B usage polling error:', error);
            }
        };

        loadUsageLogs();
        const intervalId = setInterval(loadUsageLogs, 15000);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Real-time Header */}
            <div className="flex justify-between items-center px-2">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">B2B Core Performance</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Revenue & Inference Analytics</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">En Vivo</span>
                </div>
            </div>

            {/* KPI Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-premium p-8 rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500 route-fade-in">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                    <TrendingUp className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">MRR B2B (Current)</div>
                    <div className="text-5xl font-black text-white tracking-tighter">${stats.mrr.toLocaleString()}</div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[9px] font-black rounded-full uppercase">Target Reached</span>
                        <div className="text-[10px] text-emerald-500 font-bold">↑ 100%</div>
                    </div>
                </div>

                <div className="glass-premium p-8 rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 route-fade-in">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
                    <Cpu className="text-amber-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Coste IA (Est.)</div>
                    <div className="text-5xl font-black text-white tracking-tighter">${stats.totalCost.toFixed(4)}</div>
                    <div className="mt-4 flex items-center gap-2">
                        <Activity size={12} className="text-amber-500 animate-pulse" />
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stats.totalEvents} Llamadas</div>
                    </div>
                </div>

                <div className="glass-premium p-8 rounded-[2.5rem] border border-[#00aed9]/20 bg-gradient-to-br from-[#00aed9]/10 to-transparent relative overflow-hidden group hover:border-[#00aed9]/40 transition-all duration-500 route-fade-in">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#00aed9]/10 rounded-full blur-3xl group-hover:bg-[#00aed9]/20 transition-all" />
                    <DollarSign className="text-[#00aed9] mb-6 group-hover:scale-110 transition-transform" size={40} />
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Margen Operativo</div>
                    <div className="text-5xl font-black text-white tracking-tighter">{((1 - (stats.totalCost / (stats.mrr || 1))) * 100).toFixed(1)}%</div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                style={{ width: `${(1 - (stats.totalCost / (stats.mrr || 1))) * 100}%` }}
                                className="h-full bg-emerald-500 transition-all duration-500"
                            />
                        </div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Óptimo</span>
                    </div>
                </div>
            </div>

            {/* Detailed Usage Table */}
            <div className="glass-premium rounded-[2.5rem] border border-white/10 overflow-hidden bg-slate-900/40 backdrop-blur-3xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <CreditCard size={20} className="text-[#00aed9]" /> Historial de Consumo SaaS
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Transacciones Auditadas por IA</p>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-[#00aed9]/20 hover:text-[#00aed9] rounded-2xl text-slate-400 transition-all border border-transparent hover:border-[#00aed9]/30 shadow-lg">
                        <Download size={18} />
                    </button>
                </div>

                <div className="max-h-[500px] overflow-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/80 sticky top-0 backdrop-blur-xl z-10">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Dealer ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Evento & Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Consumo</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Coste (USD)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {usageLogs.map((log, i) => (
                                    <tr
                                        key={i}
                                        style={{ animationDelay: `${Math.min(i * 40, 200)}ms` }}
                                        className="hover:bg-[#00aed9]/5 transition-all group route-fade-in"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-[#00aed9] border border-white/5">
                                                    {log.dealerId?.substring(0, 2).toUpperCase() || 'PA'}
                                                </div>
                                                <span className="font-bold text-slate-300 text-sm tracking-tight">{log.dealerId}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <span className="px-3 py-1 bg-[#00aed9]/10 rounded-full text-[9px] font-black text-[#00aed9] uppercase tracking-widest border border-[#00aed9]/20">
                                                    {log.eventType}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Clock size={10} />
                                                    <span className="text-[9px] font-bold uppercase tracking-tight">Recién Procesado</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span className="text-xs text-slate-300 font-mono">{log.count?.toFixed(0) || 0} <span className="text-slate-600">units</span></span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-mono text-sm text-amber-500 font-bold">
                                            -${(log.costEstimate || 0).toFixed(5)}
                                        </td>
                                    </tr>
                                ))}
                            {usageLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Activity size={48} className="text-slate-500" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Auditando Consumo en Tiempo Real...</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Alert Box */}
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-center gap-6 shadow-xl route-fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-amber-500" size={24} />
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">COO Alert: Umbral de Margen</h4>
                    <p className="text-xs text-amber-200/60 leading-relaxed font-medium">
                        Los costos son estimaciones basadas en Gemini 2.0 Flash. Si un dealer supera los <span className="text-amber-500 font-bold">$5.00 USD/mes</span>, se recomienda escalar la cuenta a Tier Enterprise.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default B2BBillingDashboard;
