"use client";

import React, { useRef } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { Car } from '@/entities/inventory';
import { ShieldCheck, Heart, GitCompare, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { useComparison } from '@/features/comparison';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { AnimatedCounter } from '@/shared/ui/common/AnimatedCounter';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

import { calculateMonthlyPayment, calculateSuggestedPronto, generateWhatsAppQuoteUrl } from '@/shared/lib/utils/financing';

interface PremiumGlassCardProps {
  car: Car;
  onSelect?: () => void;
  onCompare: (e: React.MouseEvent) => void;
  isComparing: boolean;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  isRecommended?: boolean;
  priority?: boolean;
  isHighInterest?: boolean;
}

const PremiumGlassCard: React.FC<PremiumGlassCardProps> = ({
  car,
  onSelect,
  isSaved,
  onToggleSave,
  isRecommended,
  priority = false,
  isHighInterest,
}) => {
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

  // F&I Logic (Expert Decision: real amortization > simple division)
  const suggestedPronto = calculateSuggestedPronto(car.price);
  const estimatedMonthly = calculateMonthlyPayment(car.price, suggestedPronto);
  const whatsappUrl = generateWhatsAppQuoteUrl(car.name, car.price, estimatedMonthly, suggestedPronto);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={() => (onSelect ? onSelect() : navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (onSelect) onSelect();
          else navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`);
        }
      }}
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
          {car.type === 'suv' && (
            <span className="font-tech flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-900/40 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md">
              <Sparkles size={10} className="animate-spin-slow" /> Richard's Pick: Confort Familiar
            </span>
          )}
          {car.badge && (
            <span className="font-tech rounded-full border border-white/10 bg-primary/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md">
              {car.badge}
            </span>
          )}
          {car.condition === 'new' && (
            <span className="font-tech flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-500/80 to-blue-600/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] backdrop-blur-xl animate-in zoom-in-95 duration-500">
              <Sparkles size={12} className="animate-pulse" />
              NUEVO
            </span>
          )}
          {car.condition === 'used' && (
            <span className="font-tech flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-800/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md">
              USADO
            </span>
          )}
          <span className="font-tech flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-200 shadow-sm backdrop-blur-md">
            <ShieldCheck size={12} className="text-primary" /> Richard Certified
          </span>
          
          {/* Nivel 13: Neuro-Badge Predictive Social Proof */}
          {isHighInterest && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-700">
              <span className="font-tech flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] backdrop-blur-xl">
                <Activity size={10} className="animate-pulse" />
                Pulso de Mercado: Alta Demanda
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
          <div
            onClick={onToggleSave}
            className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md ${isSaved ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/10 bg-slate-900/40 text-white hover:text-rose-400'}`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </div>
          <div
            onClick={handleCompareToggle}
            className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md ${isComparing ? 'border-primary bg-primary text-white' : 'border-white/10 bg-slate-900/40 text-white hover:text-primary'}`}
          >
            <GitCompare size={18} />
          </div>
        </div>

        {/* Image */}
        <OptimizedImage
          src={car.img || '/placeholder-car.webp'}
          alt={car.name}
          priority={priority}
          className="w-full h-full object-contain transition-all duration-700 drop-shadow-2xl z-10 group-hover:scale-110 group-hover:-rotate-1"
        />
      </div>

      {/* Content Section */}
      <div className="p-8 flex-1 flex flex-col relative z-20">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-primary">
              {car.type}
            </span>
            <div className="h-px w-8 bg-primary/50"></div>
          </div>
          <h3
            id={`car-title-${car.id}`}
            className="font-cinematic text-[2rem] tracking-[0.04em] text-white transition-colors group-hover:text-primary line-clamp-1 drop-shadow-md text-glow"
          >
            {car.name}
          </h3>
        </div>

        {/* Specs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="font-tech rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">
            Auto
          </span>
          <span className="font-tech rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">
            Gasolina
          </span>
          <span className="font-tech rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300 backdrop-blur-sm">
            4 Puertas
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-6">
          <div>
            <p className="font-cinematic text-4xl tracking-[0.03em] text-white text-glow">
              <AnimatedCounter value={car.price || 0} format="currency" />
            </p>
            <div className="mt-1">
              <p className="font-tech flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                Desde <AnimatedCounter value={estimatedMonthly} format="currency" duration={1500} />
                /mes *
              </p>
              <p className="font-tech text-[8px] uppercase tracking-[0.1em] text-slate-500 mt-0.5">
                Con pronto de ${suggestedPronto.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_15px_rgba(37,211,102,0.4)] transition-all hover:scale-105 hover:bg-[#20ba59] active:scale-95"
            >
               Cotizar
            </a>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_15px_rgba(0,174,217,0.5)] transition-transform group-hover:scale-110">
              <ChevronRight size={22} />
            </div>
          </div>
        </div>
        <p className="text-[7px] text-slate-500 mt-4 leading-tight">
          * Mensualidad estimada a 72 meses con 8.5% APR. Sujeto a aprobación de crédito.
        </p>
      </div>
    </div>
  );
};

export default PremiumGlassCard;
