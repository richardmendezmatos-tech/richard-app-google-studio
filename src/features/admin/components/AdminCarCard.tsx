
import React from 'react';
import { Car as CarType } from '@/types/types';
import { Edit3, Trash2, Sparkles, Leaf, TrendingUp, Clock, Tag, Gauge } from 'lucide-react';
import { optimizeImage } from '@/services/firebaseShared';
import { calculatePredictiveDTS } from '@/services/predictionService';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

interface AdminCarCardProps {
    car: CarType;
    onEdit: (car: CarType) => void;
    onDelete: (id: string) => void;
    onPlanContent: () => void;
    leadCount?: number;
}

export const AdminCarCard: React.FC<AdminCarCardProps> = ({
    car,
    onEdit,
    onDelete,
    onPlanContent,
    leadCount = 0
}) => {
    const prediction = calculatePredictiveDTS(car, leadCount);
    const isEco = car.name.toLowerCase().includes('electric') ||
        car.name.toLowerCase().includes('tesla') ||
        car.type === 'luxury';

    return (
        <div className="group relative glass-premium overflow-hidden shadow-xl hover-kinetic flex flex-col h-full route-fade-in">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
                <img
                    src={optimizeImage(car.img, 600)}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                        {car.type}
                    </span>
                    {car.badge && (
                        <span className="px-3 py-1 bg-[#00aed9] rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#00aed9]/30">
                            {car.badge}
                        </span>
                    )}
                </div>

                {isEco && (
                    <div className="absolute top-4 right-4 h-8 w-8 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500">
                        <Leaf size={14} fill="currentColor" />
                    </div>
                )}

                {/* Price Display */}
                <div className="absolute bottom-4 left-6">
                    <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest mb-0.5">Precio de Venta</div>
                    <div className="text-3xl font-black text-white tracking-tighter text-glow">
                        <AnimatedCounter value={car.price || 0} format="currency" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight truncate mb-1">
                        {car.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Gauge size={12} /> {car.type === 'luxury' ? 'Premium Trim' : 'Standard Trim'} • {car.badge || 'No special badge'}
                    </div>
                </div>

                {/* Predictive Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp size={14} className="text-[#00aed9]" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Advantage</span>
                        </div>
                        <div className={`text-xl font-black ${prediction.advantageScore > 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <AnimatedCounter value={prediction.advantageScore} format="percent" />
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Exp. Sales</span>
                        </div>
                        <div className="text-xl font-black text-white">
                            <AnimatedCounter value={prediction.daysToSale} /> <span className="text-[10px] opacity-40 uppercase tracking-widest">Días</span>
                        </div>
                    </div>
                </div>

                {/* Features Tags */}
                {car.features && car.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {car.features.slice(0, 2).map((f, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Tag size={10} className="text-slate-600" /> {f}
                            </span>
                        ))}
                    </div>
                )}

                {/* Professional Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={onPlanContent}
                        className="flex-1 h-12 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <Sparkles size={16} className="group-hover/btn:rotate-12 transition-transform" />
                        Marketing
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(car)}
                            className="w-12 h-12 bg-white/5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-2xl flex items-center justify-center transition-all border border-white/5"
                            title="Editar Unidad"
                        >
                            <Edit3 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(car.id)}
                            className="w-12 h-12 bg-rose-500/5 text-rose-500/60 hover:text-white hover:bg-rose-500 rounded-2xl flex items-center justify-center transition-all border border-rose-500/10"
                            title="Eliminar Unidad"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
