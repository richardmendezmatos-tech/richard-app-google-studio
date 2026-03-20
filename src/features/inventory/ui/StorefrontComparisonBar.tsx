import React from 'react';
import { X } from 'lucide-react';
import { Car } from '@/domain/entities';
import OptimizedImage from '@/shared/brand-ui/common/OptimizedImage';

interface StorefrontComparisonBarProps {
  compareList: Car[];
  onClear: () => void;
  onStartComparison: () => void;
}

const StorefrontComparisonBar: React.FC<StorefrontComparisonBarProps> = ({
  compareList,
  onClear,
  onStartComparison,
}) => {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-cyan-300/30 bg-[rgba(7,17,27,0.92)] py-2 pl-2 pr-6 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 lg:bottom-12">
      <div className="flex -space-x-3">
        {compareList.map((c: Car) => (
          <div
            key={c.id}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#0b1c2a] bg-white"
          >
            <OptimizedImage
              src={c.img}
              alt={c.name}
              className="w-full h-full object-cover"
              width={40}
            />
          </div>
        ))}

        {compareList.length < 2 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-white/30 bg-white/10 text-xs font-bold">
            ?
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-sm leading-tight">Comparativa VS</span>
        <span className="text-[10px] text-cyan-300 font-medium">
          {compareList.length} de 2 Seleccionados
        </span>
      </div>
      {compareList.length === 2 && (
        <button
          onClick={onStartComparison}
          className="ml-2 rounded-full bg-[#00aed9] px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(0,174,217,0.5)] transition-all hover:bg-cyan-400"
        >
          Iniciar
        </button>
      )}
      <div className="w-px h-6 bg-white/20 mx-1"></div>
      <button
        onClick={onClear}
        aria-label="Limpiar comparativa"
        className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default StorefrontComparisonBar;
