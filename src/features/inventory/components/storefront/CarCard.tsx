import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '@/types/types';
import { ShieldCheck, Heart, GitCompare, ChevronRight } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import OptimizedImage from '@/components/common/OptimizedImage';

interface CarCardProps {
    car: Car;
    onSelect?: () => void; // Optional now, or remove if unused elsewhere
    onCompare: (e: React.MouseEvent) => void;
    isComparing: boolean;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, isSaved, onToggleSave }) => {
    const navigate = useNavigate();
    const { addCarToCompare, removeCarFromCompare, isInComparison } = useComparison();

    // Check if this specific car is in comparison
    const isComparing = isInComparison(car.id);

    const handleCompareToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isComparing) {
            removeCarFromCompare(car.id);
        } else {
            addCarToCompare(car);
        }
    };

    const estimatedMonthly = Math.round(car.price / 72); // Rough 72 month calculation

    return (
        <button
            onClick={() => navigate(`/vehicle/${car.id}`)}
            className="group bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-[#00aed9]/30 dark:hover:border-[#00aed9]/30 hover:shadow-2xl hover:shadow-cyan-900/10 transition-all duration-500 cursor-pointer text-left flex flex-col relative h-full"
        >
            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden p-8 flex items-center justify-center">

                {/* Badges Container */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 items-start">
                    {car.badge && (
                        <span className="px-3 py-1.5 bg-[#00aed9] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            {car.badge}
                        </span>
                    )}
                    <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
                        <ShieldCheck size={12} className="text-emerald-500" /> Richard Certified
                    </span>
                </div>

                {/* Action Buttons Top Right */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                    {/* Heart / Save Button */}
                    <div
                        onClick={onToggleSave}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 border ${isSaved ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-rose-500'}`}
                        title={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </div>

                    {/* Compare Button */}
                    <div
                        onClick={handleCompareToggle}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 border ${isComparing ? 'bg-[#00aed9] text-white border-[#00aed9]' : 'bg-white/80 dark:bg-slate-700/80 text-slate-400 border-slate-200 dark:border-slate-600 hover:text-[#00aed9]'}`}
                        title={isComparing ? "Quitar de comparar" : "Agregar a comparar"}
                    >
                        <GitCompare size={18} />
                    </div>
                </div>

                <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden lg:block">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-[#00aed9] shadow-md">
                        <ChevronRight size={20} />
                    </div>
                </div>

                <OptimizedImage
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-contain transition-all duration-700 drop-shadow-2xl z-10 group-hover:scale-110 group-hover:-rotate-2"
                    aspectRatio="aspect-[4/3]"
                />
            </div>

            <div className="p-8 flex-1 flex flex-col">
                <div className="mb-4">
                    <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.2em]">{car.type}</span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter mt-1 group-hover:text-[#00aed9] transition-colors line-clamp-1">{car.name}</h3>
                </div>

                {/* Key Features Mockup (CarMax style) */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">Auto</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">Gasolina</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">4 Puertas</span>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                    <div>
                        <p className="text-2xl font-black text-slate-700 dark:text-slate-200">${car.price.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-[#00aed9] mt-1">Est. ${estimatedMonthly}/mes</p>
                    </div>
                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 group-hover:bg-[#00aed9] group-hover:text-white transition-colors">
                        Ver Detalles
                    </div>
                </div>
            </div>
        </button>
    );
};

export default CarCard;
