import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '../../types';
import { ShieldCheck, Heart, GitCompare, ChevronRight } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { OptimizedImage } from '../common/OptimizedImage';

interface PremiumGlassCardProps {
    car: Car;
    onSelect?: () => void;
    onCompare: (e: React.MouseEvent) => void;
    isComparing: boolean;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
}

const PremiumGlassCard: React.FC<PremiumGlassCardProps> = ({ car, isSaved, onToggleSave }) => {
    const navigate = useNavigate();
    const { addCarToCompare, removeCarFromCompare, isInComparison } = useComparison();
    const cardRef = useRef<HTMLButtonElement>(null);

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

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const estimatedMonthly = Math.round(car.price / 72);

    return (
        <button
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onClick={() => navigate(`/vehicle/${car.id}`)}
            className="glass-premium group relative overflow-hidden text-left flex flex-col h-full active:scale-[0.98] transition-all duration-300"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden p-8 flex items-center justify-center rounded-t-[24px]">

                {/* Dynamic Shine Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 items-start">
                    {car.badge && (
                        <span className="px-3 py-1.5 bg-[#00aed9]/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/10">
                            {car.badge}
                        </span>
                    )}
                    <span className="px-3 py-1.5 bg-slate-900/60 text-slate-200 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 backdrop-blur-md border border-white/10">
                        <ShieldCheck size={12} className="text-[#00aed9]" /> Richard Certified
                    </span>
                </div>

                {/* Actions */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                    <div
                        onClick={onToggleSave}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg border backdrop-blur-md ${isSaved ? 'bg-rose-500 border-rose-500 text-white' : 'bg-slate-900/40 border-white/10 text-white hover:text-rose-400'}`}
                    >
                        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </div>
                    <div
                        onClick={handleCompareToggle}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg border backdrop-blur-md ${isComparing ? 'bg-[#00aed9] text-white border-[#00aed9]' : 'bg-slate-900/40 border-white/10 text-white hover:text-[#00aed9]'}`}
                    >
                        <GitCompare size={18} />
                    </div>
                </div>

                {/* Image */}
                <OptimizedImage
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-contain transition-all duration-700 drop-shadow-2xl z-10 group-hover:scale-110 group-hover:-rotate-1"
                />
            </div>

            {/* Content Section */}
            <div className="p-8 flex-1 flex flex-col relative z-20">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.2em]">{car.type}</span>
                        <div className="h-px w-8 bg-[#00aed9]/50"></div>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-[#00aed9] transition-colors line-clamp-1 drop-shadow-md text-glow">{car.name}</h3>
                </div>

                {/* Specs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300 font-bold backdrop-blur-sm">Auto</span>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300 font-bold backdrop-blur-sm">Gasolina</span>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300 font-bold backdrop-blur-sm">4 Puertas</span>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-6">
                    <div>
                        <p className="text-3xl font-black text-white tracking-tight text-glow">${car.price.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-[#00aed9] mt-1 flex items-center gap-1">
                            Est. ${estimatedMonthly}/mo
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#00aed9] text-white flex items-center justify-center shadow-[0_0_15px_rgba(0,174,217,0.5)] group-hover:scale-110 transition-transform">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </button>
    );
};

export default PremiumGlassCard;
