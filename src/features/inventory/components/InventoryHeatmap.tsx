import React from 'react';
import { Car } from '@/types/types';
import { Flame, Skull, Ghost, Eye, MessageSquare, TrendingUp, AlertTriangle, Lock, ShieldCheck, Sparkles, ScanLine, BrainCircuit } from 'lucide-react';

interface Props {
    inventory: Car[];
}

export const InventoryHeatmap: React.FC<Props> = ({ inventory }) => {
    // Analytics Mock: Normally this would come from interaction heatmaps
    const getHeatLevel = (car: Car) => {
        const views = (car as any).views || 0;
        const saves = (car as any).saves || 0;
        const score = views + (saves * 5);

        if (score > 100) return {
            color: 'from-orange-500 via-red-500 to-rose-600',
            label: 'Extremely Hot',
            icon: <Flame className="w-4 h-4 text-orange-200 animate-pulse" />,
            glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]',
            badge: 'Combo Explosivo'
        };
        if (score > 50) return {
            color: 'from-blue-500 via-indigo-500 to-purple-600',
            label: 'Trending',
            icon: <TrendingUp className="w-4 h-4 text-blue-200" />,
            glow: 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
            badge: 'Popular'
        };
        return {
            color: 'from-slate-700 to-slate-800',
            label: 'Cold Storage',
            icon: <Ghost className="w-4 h-4 text-slate-400" />,
            glow: 'shadow-none',
            badge: 'New Arrival'
        };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <ScanLine className="text-[#00aed9]" /> Inventory <span className="text-[#00aed9]">Heatmap</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time engagement telemetry</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-full border border-white/5">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-300">LIVE SESSIONS: 24</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map(car => {
                    const heat = getHeatLevel(car);
                    return (
                        <div
                            key={car.id}
                            className={`group relative h-32 rounded-3xl overflow-hidden border border-white/10 transition-all duration-500 hover:scale-[1.02] ${heat.glow}`}
                        >
                            {/* Background Heat Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-700 ${heat.color}`}></div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] group-hover:bg-slate-900/10 transition-colors"></div>

                            <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{car.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">ID: {car.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                                        {heat.icon}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Views</span>
                                            <span className="text-xs font-black text-white">{(car as any).views || 0}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Saves</span>
                                            <span className="text-xs font-black text-white">{(car as any).saves || 0}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Inquiries</span>
                                            <span className="text-xs font-black text-white">{(car as any).leads || 0}</span>
                                        </div>
                                    </div>

                                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur rounded-xl border border-white/10 flex items-center gap-2">
                                        <div className="relative">
                                            <Sparkles className="w-3 h-3 text-orange-400 absolute animate-ping" />
                                            <Sparkles className="w-3 h-3 text-orange-400" />
                                        </div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">HEAT: {heat.badge}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative Grid Pattern */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                        </div>
                    );
                })}
            </div>

            {/* Strategic Insights Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-[32px] p-6 border border-white/5 mt-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 text-[#00aed9] group-hover:scale-110 transition-transform duration-700">
                    <BrainCircuit size={120} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/20">
                        <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            Neural <span className="text-[#00aed9]">Marketing Insight</span>
                        </h4>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl">
                            Our AI detected a <span className="text-orange-400 font-bold">14% increase</span> in high-intent signals for SUVs in the last 6 hours. Recommendation: Increase programmatic bidding on "Digital Twin" previews for top inventory.
                        </p>
                    </div>
                    <button className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#00aed9] hover:text-white transition-all shadow-xl active:scale-95 whitespace-nowrap">
                        Apply AI Strategy
                    </button>
                </div>
            </div>
        </div>
    );
};
