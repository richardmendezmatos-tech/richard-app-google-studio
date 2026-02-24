import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from '@/types/types';
import { ShieldCheck, Heart, GitCompare, ChevronRight } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';
import OptimizedImage from '@/components/common/OptimizedImage';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

interface PremiumGlassCardProps {
    car: Car;
    onSelect?: () => void;
    onCompare: (e: React.MouseEvent) => void;
    isComparing: boolean;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
    isRecommended?: boolean;
}

const PremiumGlassCard: React.FC<PremiumGlassCardProps> = ({ car, isSaved, onToggleSave, isRecommended }) => {
    const navigate = useNavigate();
    const { addCarToCompare, removeCarFromCompare, isInComparison } = useComparison();
    const cardRef = useRef<HTMLDivElement>(null);

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
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onClick={() => navigate(`/vehicle/${car.id}`)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/vehicle/${car.id}`);
                }
            }}
            role="button"
            tabIndex={0}
            className="glass-premium group relative flex h-full cursor-pointer flex-col overflow-hidden text-left active:scale-[0.98] transition-all duration-300"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden p-8 flex items-center justify-center rounded-t-[24px]">

                {/* Dynamic Shine Overlay */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Badges */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 items-start">
                    {isRecommended && (
                        <span className="font-tech animate-pulse rounded-full border border-white/20 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                            Recomendado para ti
                        </span>
                    )}
                    {car.badge && (
                        <span className="font-tech rounded-full border border-white/10 bg-[#00aed9]/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md">
                            {car.badge}
                        </span>
                    )}
                    <span className="font-tech flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-200 shadow-sm backdrop-blur-md">
                        <ShieldCheck size={12} className="text-[#00aed9]" /> Richard Certified
                    </span>
                </div>

                {/* Actions */}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                    <div
                        onClick={onToggleSave}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md ${isSaved ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/10 bg-slate-900/40 text-white hover:text-rose-400'}`}
                    >
                        <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                    </div>
                    <div
                        onClick={handleCompareToggle}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md ${isComparing ? 'border-[#00aed9] bg-[#00aed9] text-white' : 'border-white/10 bg-slate-900/40 text-white hover:text-[#00aed9]'}`}
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
                        <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-[#00aed9]">{car.type}</span>
                        <div className="h-px w-8 bg-[#00aed9]/50"></div>
                    </div>
                    <h3 id={`car-title-${car.id}`} className="font-cinematic text-[2rem] tracking-[0.04em] text-white transition-colors group-hover:text-[#00aed9] line-clamp-1 drop-shadow-md text-glow">{car.name}</h3>
                </div>

                {/* Specs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    <span className="font-tech rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">Auto</span>
                    <span className="font-tech rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">Gasolina</span>
                    <span className="font-tech rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">4 Puertas</span>
                </div>

                <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-6">
                    <div>
                        <p className="font-cinematic text-4xl tracking-[0.03em] text-white text-glow">
                            <AnimatedCounter value={car.price || 0} format="currency" />
                        </p>
                        <p className="font-tech mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#00aed9]">
                            Est. <AnimatedCounter value={estimatedMonthly} format="currency" duration={1500} />/mo
                        </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00aed9] text-white shadow-[0_0_15px_rgba(0,174,217,0.5)] transition-transform group-hover:scale-110">
                        <ChevronRight size={20} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumGlassCard;
