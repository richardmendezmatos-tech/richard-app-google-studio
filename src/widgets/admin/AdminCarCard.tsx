import React from 'react';
import { Car as CarType } from '@/shared/types/types';
import { Edit3, Trash2, Sparkles, Leaf, TrendingUp, Clock, Tag, Gauge } from 'lucide-react';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';
import { calculatePredictiveDTS } from '@/entities/inventory';
import { AnimatedCounter } from '@/shared/ui/common/AnimatedCounter';

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
  leadCount = 0,
}) => {
  const prediction = calculatePredictiveDTS(car, leadCount);
  const isEco =
    car.name.toLowerCase().includes('electric') ||
    car.name.toLowerCase().includes('tesla') ||
    car.type === 'luxury';

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(0,174,217,0.15)] hover:border-white/10 transition-all duration-500 flex flex-col h-full route-fade-in hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={optimizeImage(car.img || '', 600)}
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
            <span className="px-3 py-1 bg-primary rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-primary/30">
              {car.badge}
            </span>
          )}
        </div>

        {isEco && (
          <div className="absolute top-4 right-4 h-8 w-8 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-500">
            <Leaf size={14} fill="currentColor" />
          </div>
        )}

        <div className="absolute bottom-5 left-6 z-20">
          <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1 drop-shadow-md">
            Precio de Venta
          </div>
          <div className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
            <AnimatedCounter value={car.price || 0} format="currency" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 md:p-8 space-y-6 flex-1 flex flex-col relative z-20 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight truncate mb-1">
            {car.name}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Gauge size={12} className="text-primary" />{' '}
            {car.type === 'luxury' ? 'Premium Trim' : 'Standard Trim'} •{' '}
            {car.badge || 'No special badge'}
          </div>
        </div>

        {/* Predictive Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-1 shadow-inner group-hover:border-primary/30 transition-colors duration-500">
            <div className="flex items-center gap-2 text-slate-500">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">Advantage</span>
            </div>
            <div
              className={`text-2xl font-black tracking-tighter ${prediction.advantageScore > 75 ? 'text-emerald-400 text-glow' : 'text-amber-400'}`}
            >
              <AnimatedCounter value={prediction.advantageScore} format="percent" />
            </div>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-1 shadow-inner group-hover:border-primary/30 transition-colors duration-500">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={14} className="text-amber-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Exp. Sales</span>
            </div>
            <div className="text-2xl font-black text-white tracking-tighter">
              <AnimatedCounter value={prediction.daysToSale} />{' '}
              <span className="text-[10px] opacity-50 uppercase tracking-widest font-bold">
                Días
              </span>
            </div>
          </div>
        </div>

        {/* Features Tags */}
        {car.features && car.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {car.features.slice(0, 2).map((f, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-widest border border-white/10 flex items-center gap-1.5"
              >
                <Tag size={10} className="text-primary" /> {f}
              </span>
            ))}
          </div>
        )}

        {/* Professional Actions */}
        <div className="flex gap-3 pt-4 mt-auto border-t border-white/5">
          <button
            onClick={onPlanContent}
            className="flex-1 h-12 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 group/btn border border-primary/20 hover:shadow-[0_0_20px_rgba(0,174,217,0.4)]"
          >
            <Sparkles size={16} className="group-hover/btn:rotate-12 transition-transform" />
            Marketing
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(car)}
              className="w-12 h-12 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl flex items-center justify-center transition-all border border-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              title="Editar Unidad"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => onDelete(car.id)}
              className="w-12 h-12 bg-rose-500/10 text-rose-500/70 hover:text-white hover:bg-rose-500 rounded-xl flex items-center justify-center transition-all border border-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
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
