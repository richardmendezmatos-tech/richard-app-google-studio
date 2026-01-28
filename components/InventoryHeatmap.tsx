import React from 'react';
import { Car } from '../types';
import { Flame, Skull, Ghost, Eye, MessageSquare, TrendingUp, AlertTriangle, Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
    inventory: Car[];
}

const InventoryHeatmap: React.FC<Props> = ({ inventory }) => {
    // 1. Hot List: Top 5 by Views
    const hotList = [...inventory]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    // 2. Zombie List: High Views (>5) but 0 Leads
    const zombieList = inventory.filter(c => (c.views || 0) > 5 && (!c.leads_count || c.leads_count === 0));

    // 3. Ghost List: 0 Views (Bottom 5)
    const ghostList = inventory.filter(c => !c.views || c.views === 0).slice(0, 5);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                    <TrendingUp size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Inteligencia de Inventario</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Análisis en tiempo real del comportamiento de clientes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 🔥 HOT LIST */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 p-6 rounded-[35px] border border-orange-100 dark:border-orange-500/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-orange-600 dark:text-orange-400">
                        <Flame size={20} fill="currentColor" />
                        <h3 className="font-black uppercase tracking-widest text-xs">Hot List (Más Vistos)</h3>
                    </div>
                    <div className="space-y-4">
                        {hotList.map((car, idx) => (
                            <AnalyticsCard key={car.id} car={car} rank={idx + 1} type="hot" />
                        ))}
                    </div>
                </div>

                {/* 🧟 ZOMBIE LIST */}
                <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-900/50 p-6 rounded-[35px] border border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-slate-600 dark:text-slate-400">
                        <Skull size={20} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Zombies (Vistos sin Acción)</h3>
                    </div>
                    <div className="space-y-4">
                        {zombieList.length === 0 ? (
                            <div className="text-center py-10 opacity-50 text-xs uppercase font-bold">¡Inventario Saludable!</div>
                        ) : zombieList.slice(0, 5).map((car) => (
                            <AnalyticsCard key={car.id} car={car} type="zombie" />
                        ))}
                    </div>
                </div>

                {/* 👻 GHOST LIST */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-6 rounded-[35px] border border-blue-100 dark:border-blue-500/20 shadow-lg">
                    <div className="flex items-center gap-2 mb-6 text-blue-500 dark:text-blue-400">
                        <Ghost size={20} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Fantasmas (Invisibles)</h3>
                    </div>
                    <div className="space-y-4">
                        {ghostList.map((car) => (
                            <AnalyticsCard key={car.id} car={car} type="ghost" />
                        ))}
                        {ghostList.length === 0 && (
                            <div className="text-center py-10 opacity-50 text-xs uppercase font-bold">Todo se ha visto al menos una vez.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Strategic: Premium Monetization Layer */}
            <div className="relative group">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] z-20 flex flex-col items-center justify-center border border-white/10 group-hover:bg-slate-900/30 transition-all duration-500">
                    <div className="w-16 h-16 bg-[#00aed9]/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,174,217,0.3)] group-hover:scale-110 transition-transform">
                        <Lock className="text-[#00aed9]" size={32} />
                    </div>
                    <div className="text-center px-8 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-white font-black text-xl uppercase tracking-tighter">
                            <Sparkles className="text-amber-500" size={24} /> Market Gap Analytics Pro
                        </div>
                        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                            Accede a datos granulares sobre la competencia en tiempo real, predicciones de subasta y sugerencias de compra automáticas.
                        </p>
                        <button className="mt-8 px-10 py-4 bg-gradient-to-r from-[#00aed9] to-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#00aed9]/30 hover:scale-[1.05] active:scale-95 transition-all">
                            Mejorar a Plan Corporativo
                        </button>
                    </div>
                </div>

                <div className="opacity-20 blur-sm pointer-events-none select-none">
                    <div className="grid grid-cols-2 gap-8 p-10">
                        <div className="h-40 bg-slate-800 rounded-3xl animate-pulse" />
                        <div className="h-40 bg-slate-800 rounded-3xl animate-pulse" />
                        <div className="h-40 bg-slate-800 rounded-3xl animate-pulse" />
                        <div className="h-40 bg-slate-800 rounded-3xl animate-pulse" />
                    </div>
                </div>

                {/* Security Badge for CEO Trust */}
                <div className="absolute top-6 right-8 z-30 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-lg">
                    <ShieldCheck className="text-emerald-500" size={14} />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Zero Trust Audit Compliant</span>
                </div>
            </div>
        </div>
    );
};

const AnalyticsCard = ({ car, rank, type }: { car: Car, rank?: number, type: 'hot' | 'zombie' | 'ghost' }) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-800 relative group hover:scale-[1.02] transition-transform duration-300">
            {rank && (
                <div className="absolute -left-2 -top-2 w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                    #{rank}
                </div>
            )}
            <img src={car.img} className="w-12 h-12 object-contain" alt={car.name} />
            <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">{car.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">${(car.price || 0).toLocaleString()}</div>
            </div>

            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    <Eye size={10} /> {car.views || 0}
                </div>
                {type !== 'ghost' && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${(car.leads_count || 0) > 0
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                        }`}>
                        <MessageSquare size={10} /> {car.leads_count || 0}
                    </div>
                )}

                {/* ACTIONABLE INSIGHTS */}
                {type === 'zombie' && (
                    <button className="mt-2 text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1">
                        <AlertTriangle size={10} /> Optimizar
                    </button>
                )}
            </div>
        </div>
    );
};

export default InventoryHeatmap;
