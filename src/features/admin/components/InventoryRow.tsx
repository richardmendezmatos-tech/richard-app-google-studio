
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

const InventoryRow: React.FC<InventoryRowProps> = React.memo(({
    car,
    leadCount,
    onEdit,
    onDelete,
    onPlanContent,
    style
}) => {
    const predictiveStats = calculatePredictiveDTS(car, leadCount);

    return (
        <div
            style={style}
            className={`flex items-center border-b border-white/5 hover:bg-white/5 transition-colors group px-6 h-20 ${style ? 'dnd-sortable' : ''}`}
        >
            {/* Unidad */}
            <div className="flex-1 flex items-center gap-4 min-w-board-column-lg">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0">
                    <img src={optimizeImage(car.img, 100)} alt={car.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-white uppercase tracking-tight truncate max-w-[200px]">{car.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{car.id.slice(0, 8)}</span>
                </div>
            </div>

            {/* Tipo / Badge */}
            <div className="w-board-column-md flex flex-col justify-center">
                <span className="text-xs font-black uppercase text-slate-400">{car.type}</span>
                <span className="text-[10px] text-[#00aed9] font-bold uppercase tracking-widest">{car.badge || 'No Badge'}</span>
            </div>

            {/* Precio */}
            <div className="w-board-column-sm font-black text-white text-glow flex items-center">
                ${car.price?.toLocaleString()}
            </div>

            {/* Advantage */}
            <div className="w-board-column-sm flex items-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-[#00aed9]/10 text-[#00aed9] uppercase tracking-widest border border-[#00aed9]/20">
                    +{predictiveStats.advantageScore.toFixed(0)}%
                </span>
            </div>

            {/* Sales Velocity */}
            <div className="w-board-column-sm flex items-center gap-2">
                <Clock size={12} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-400">14 Días</span>
            </div>

            {/* Acciones */}
            <div className="flex-1 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onPlanContent(car)}
                    className="p-2 hover:bg-[#00aed9]/10 text-slate-400 hover:text-[#00aed9] rounded-lg transition-all"
                    title="Marketing"
                    aria-label="Marketing"
                >
                    <Sparkles size={16} />
                </button>
                <button
                    onClick={() => onEdit(car)}
                    className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                    title="Editar"
                    aria-label="Editar"
                >
                    <Edit3 size={16} />
                </button>
                <button
                    onClick={() => onDelete(car.id)}
                    className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                    title="Eliminar"
                    aria-label="Eliminar"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
});

InventoryRow.displayName = 'InventoryRow';

export default InventoryRow;
