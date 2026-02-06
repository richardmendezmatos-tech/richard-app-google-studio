
import React from 'react';
import { Car as CarType } from '@/types/types';
import { Edit3, Trash2, Sparkles, Leaf, TrendingUp, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { optimizeImage } from '@/services/firebaseService';
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
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
        >
            {/* Image Section */}
            <div className="relative h-72 overflow-hidden">
                <img
                    src={optimizeImage(car.img, 400)}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                        {car.type}
                    </span>
                    {car.badge && (
                        <span className="px-3 py-1 bg-[#00aed9] rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#00aed9]/30">
                            {car.badge}
                        </span>
                    )}
                    {isEco && (
                        <span className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                            <Leaf size={10} fill="currentColor" /> Eco
                        </span>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute bottom-4 left-4">
                    <div className="text-2xl font-black text-white tracking-tighter">
                        <AnimatedCounter value={car.price || 0} format="currency" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight truncate">
                        {car.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                        {car.description || 'Sin descripción detallada.'}
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <TrendingUp size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Advantage</span>
                        </div>
                        <div className={`text-sm font-black ${prediction.advantageScore > 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <AnimatedCounter value={prediction.advantageScore} format="percent" delay={200} />
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <Clock size={12} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Days to Sale</span>
                        </div>
                        <div className="text-sm font-black text-white">
                            <AnimatedCounter value={prediction.daysToSale} delay={400} /> <span className="text-[10px] opacity-50">Días</span>
                        </div>
                    </div>
                </div>

                {/* Tags Section */}
                {car.features && car.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {car.features.slice(0, 3).map((f, i) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                                <Tag size={8} /> {f}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={onPlanContent}
                        className="flex-1 h-10 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <Sparkles size={14} className="group-hover/btn:rotate-12 transition-transform" />
                        Marketing
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(car)}
                            className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl flex items-center justify-center transition-all"
                            title="Editar"
                        >
                            <Edit3 size={16} />
                        </button>
                        <button
                            onClick={() => onDelete(car.id)}
                            className="w-10 h-10 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
