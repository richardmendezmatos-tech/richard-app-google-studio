import React from 'react';
import { Car as CarType } from '@/entities/shared';
import { Edit3, Trash2, Sparkles, Leaf, TrendingUp, Clock, Tag, Gauge } from 'lucide-react';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';
import { calculatePredictiveDTS } from '@/entities/car';
import { AnimatedCounter } from '@/shared/ui/common/AnimatedCounter';

interface CommandCenterCarCardProps {
  car: CarType;
  onEdit: (car: CarType) => void;
  onDelete: (id: string) => void;
  onPlanContent: () => void;
  leadCount?: number;
}

export const CommandCenterCarCard: React.FC<CommandCenterCarCardProps> = ({
  car,
  onEdit,
  onDelete,
  onPlanContent,
  leadCount = 0,
}) => {
  const prediction = calculatePredictiveDTS(car, leadCount);
  const isEco =
    car.name.toLowerCase().includes('electric') ||
    car.name.toLowerCase().includes('tesla') ||
    car.type === 'luxury';

  return (
    <div className="group relative glass-premium overflow-hidden shadow-xl hover-kinetic flex flex-col h-full route-fade-in">
      {/* Image Section */}
      <div className="relative h-72 overflow-hidden">
        <img
          src={optimizeImage(car.img, 800)}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050c14] via-transparent to-slate-950/40" />

        {/* Status Badges */}
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/5 backdrop-blur-xl rounded-lg text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
            {car.type}
          </span>
          {car.badge && (
            <span className="px-3 py-1 bg-primary/20 backdrop-blur-xl rounded-lg text-[9px] font-black text-primary uppercase tracking-[0.2em] border border-primary/30">
              {car.badge}
            </span>
          )}
        </div>

        {isEco && (
          <div className="absolute top-6 right-6 h-9 w-9 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 shadow-lg">
            <Leaf size={16} fill="currentColor" className="opacity-80" />
          </div>
        )}

        {/* Price Display */}
        <div className="absolute bottom-6 left-8">
          <div className="text-[9px] font-black text-primary/70 uppercase tracking-[0.3em] mb-1">
            Asset Valuation
          </div>
          <div className="text-4xl font-black text-white tracking-tightest leading-none text-glow">
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
            <Gauge size={12} /> {car.type === 'luxury' ? 'Premium Trim' : 'Standard Trim'} •{' '}
            {car.badge || 'No special badge'}
          </div>
        </div>

        {/* Predictive Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider">Advantage</span>
            </div>
            <div
              className={`text-xl font-black ${prediction.advantageScore > 75 ? 'text-emerald-500' : 'text-amber-500'}`}
            >
              <AnimatedCounter value={prediction.advantageScore} format="percent" />
            </div>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock size={14} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-wider">Exp. Sales</span>
            </div>
            <div className="text-xl font-black text-white">
              <AnimatedCounter value={prediction.daysToSale} />{' '}
              <span className="text-[10px] opacity-40 uppercase tracking-widest">Días</span>
            </div>
          </div>
        </div>

        {/* Features Tags */}
        {car.features && car.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {car.features.slice(0, 2).map((f, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white/5 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"
              >
                <Tag size={10} className="text-slate-600" /> {f}
              </span>
            ))}
          </div>
        )}

        {/* Professional Actions */}
        <div className="flex gap-4 pt-4 mt-auto relative z-10">
          <button
            onClick={onPlanContent}
            className="flex-1 h-12 bg-primary/5 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 group/btn shadow-lg hover:shadow-primary/20"
          >
            <Sparkles size={16} className="group-hover/btn:rotate-12 transition-transform duration-500" />
            Strategy Lab
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(car)}
              className="w-12 h-12 bg-white/5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl flex items-center justify-center transition-all border border-white/10 group/edit"
              title="Editar Unidad"
            >
              <Edit3 size={18} className="group-hover/edit:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => onDelete(car.id)}
              className="w-12 h-12 bg-rose-500/5 text-rose-500/60 hover:text-white hover:bg-rose-600 rounded-xl flex items-center justify-center transition-all border border-rose-500/10 group/del"
              title="Eliminar Unidad"
            >
              <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
