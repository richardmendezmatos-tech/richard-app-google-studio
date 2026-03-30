import React from 'react';
import { Car } from '@/entities/inventory';
import { Sparkles, Edit3, Trash2, Clock } from 'lucide-react';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';
import { calculatePredictiveDTS } from '@/entities/inventory';

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

    const rowRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (rowRef.current && style) {
        rowRef.current.style.setProperty('--translate', (style as any).transform || 'none');
        rowRef.current.style.setProperty('--transition', (style as any).transition || 'none');
        rowRef.current.style.setProperty('--drag-opacity', String((style as any).opacity || 1));
        rowRef.current.style.setProperty('--drag-z-index', String((style as any).zIndex || 0));
      }
    }, [style]);

    return (
      <div
        ref={rowRef}
        className={`flex items-center border-b border-white/5 hover:bg-white/5 transition-colors group px-6 h-20 ${style ? 'dnd-sortable' : ''}`}
      >
        {/* Unidad */}
        <div className="flex-1 flex items-center gap-4 min-w-board-column-lg">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/10 group-hover:scale-105 transition-transform shrink-0">
            <img
              src={optimizeImage(car.img, 100)}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white uppercase tracking-tight truncate max-w-board-column-md">
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
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
            {car.badge || 'No Badge'}
          </span>
        </div>

        {/* Precio */}
        <div className="w-board-column-sm font-black text-white text-glow flex items-center tracking-tighter">
          ${car.price?.toLocaleString()}
        </div>

        {/* Advantage */}
        <div className="w-board-column-sm flex items-center">
          <span className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] font-black bg-primary/5 text-primary uppercase tracking-[0.2em] border border-primary/20">
            +{predictiveStats.advantageScore.toFixed(0)}%
          </span>
        </div>

        {/* Sales Velocity */}
        <div className="w-board-column-sm flex items-center gap-2">
          <Clock size={12} className="text-slate-600" />
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            14 Días
          </span>
        </div>

        {/* Acciones */}
        <div className="flex-1 flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pr-2">
          <button
            onClick={() => onPlanContent(car)}
            className="p-2.5 hover:bg-primary/10 text-slate-500 hover:text-primary rounded-xl transition-all border border-transparent hover:border-primary/20"
            title="Strategy Lab"
            aria-label="Strategy Lab"
          >
            <Sparkles size={16} />
          </button>
          <button
            onClick={() => onEdit(car)}
            className="p-2.5 hover:bg-white/5 text-slate-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
            title="Editar"
            aria-label="Editar"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(car.id)}
            className="p-2.5 hover:bg-rose-500/5 text-slate-500 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/10"
            title="Eliminar"
            aria-label="Eliminar"
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
