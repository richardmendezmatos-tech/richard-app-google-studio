import React from 'react';
import { Car, Lead } from '@/types/types';
import { Sparkles, Edit3, Trash2, Clock } from 'lucide-react';
import { optimizeImage } from '@/services/firebaseShared';
import { calculatePredictiveDTS } from '@/services/predictionService';

interface InventoryRowProps {
  car: Car;
  leadCount: number;
  onEdit: (car: Car) => void;
  onDelete: (id: string) => void;
  onPlanContent: (car: Car) => void;
  style?: React.CSSProperties;
}

const InventoryRow: React.FC<InventoryRowProps> = React.memo(
  ({ car, leadCount, onEdit, onDelete, onPlanContent, style }) => {
    const predictiveStats = calculatePredictiveDTS(car, leadCount);

    return (
      <div
        style={style}
        className={`flex items-center border-b border-white/5 hover:bg-[#00aed9]/5 hover:border-[#00aed9]/20 hover:shadow-[inset_0_0_30px_rgba(0,174,217,0.03)] transition-all duration-300 group px-6 h-24 ${style ? 'dnd-sortable' : ''}`}
      >
        {/* Unidad */}
        <div className="flex-1 flex items-center gap-4 min-w-board-column-lg">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0">
            <img
              src={optimizeImage(car.img, 100)}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white uppercase tracking-tight truncate max-w-[200px]">
              {car.name}
            </span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              {car.id.slice(0, 8)}
            </span>
          </div>
        </div>

        {/* Tipo / Badge */}
        <div className="w-board-column-md flex flex-col justify-center">
          <span className="text-xs font-black uppercase text-slate-400">{car.type}</span>
          <span className="text-[10px] text-[#00aed9] font-bold uppercase tracking-widest">
            {car.badge || 'No Badge'}
          </span>
        </div>

        {/* Precio */}
        <div className="w-board-column-sm font-black text-white text-glow flex items-center text-lg">
          ${car.price?.toLocaleString()}
        </div>

        {/* Advantage */}
        <div className="w-board-column-sm flex items-center">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${predictiveStats.advantageScore > 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' : 'bg-[#00aed9]/10 text-[#00aed9] border-[#00aed9]/20 shadow-[#00aed9]/10'}`}>
            +{predictiveStats.advantageScore.toFixed(0)}%
          </span>
        </div>

        {/* Sales Velocity */}
        <div className="w-board-column-sm flex items-center gap-2">
          <Clock size={14} className="text-amber-500" />
          <div className="flex flex-col">
            <span className="text-sm font-black text-white">{predictiveStats.daysToSale}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Días</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex-1 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onPlanContent(car)}
            className="px-3 md:px-4 py-2 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border border-[#00aed9]/20 hover:shadow-[0_0_15px_rgba(0,174,217,0.4)]"
            title="Marketing"
          >
            <Sparkles size={14} /> <span className="hidden xl:inline">Marketing</span>
          </button>
          <button
            onClick={() => onEdit(car)}
            className="w-10 h-10 flex items-center justify-center bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-white/10 hover:border-white/30"
            title="Editar"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(car.id)}
            className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-500/70 hover:text-white hover:bg-rose-500 rounded-xl transition-all border border-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  },
);

InventoryRow.displayName = 'InventoryRow';

export default InventoryRow;
