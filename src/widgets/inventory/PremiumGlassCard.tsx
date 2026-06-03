'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { Car } from '@/entities/inventory';
import { ShieldCheck, Heart, GitCompare, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { useComparison } from '@/features/comparison';
import { getCarImage, getCarImages } from '@/entities/inventory/lib/carImage';
import { OptimizedImage } from '@/shared/ui/common/OptimizedImage';
import { AnimatedCounter } from '@/shared/ui/common/AnimatedCounter';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

import { openWhatsAppWithCapture } from '@/shared/lib/utils/whatsapp';
import { useVehicleStats } from '@/features/inventory/hooks/useVehicleStats';
import {
  calculateMonthlyPayment,
  calculateSuggestedPronto,
} from '@/shared/lib/utils/financing';

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
  onCompare,
  isComparing,
  isRecommended,
  priority,
  isHighInterest,
}) => {
  console.log('PremiumGlassCard render for car:', car.id, 'img:', car.img);
  const navigate = useNavigate();
  const { addCarToCompare, removeCarFromCompare, isInComparison } = useComparison();
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if this specific car is in comparison (removed to fix compilation error)

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
  const suggestedPronto = calculateSuggestedPronto(car.price || 0);
  const estimatedMonthly = calculateMonthlyPayment(car.price || 0, suggestedPronto);

  // Social Proof: real-time view/lead stats from Supabase
  const { data: stats } = useVehicleStats(car.id);

  const carImages = getCarImages(car, 3);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (carImages.length < 2) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % carImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carImages.length]);

  const currentSrc = carImages.length > 1
    ? carImages[activeImageIndex]
    : getCarImage(car);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={() =>
        onSelect ? onSelect() : navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`)
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (onSelect) onSelect();
          else navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`);
        }
      }}
      className="glass-premium group relative flex h-full cursor-pointer flex-col overflow-hidden text-left active:scale-[0.98] transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative w-full overflow-hidden flex items-center justify-center rounded-t-3xl bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-4 border-b border-white/5 h-card-image hud-brackets">
        <div className="scanline-overlay opacity-10" />
        {/* Dynamic Shine Overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 items-start scale-90 origin-top-left">
          {isRecommended && (
            <span className="font-tech animate-pulse rounded-full border border-white/20 bg-linear-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
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
            <span className="font-tech flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-linear-to-r from-cyan-500/80 to-blue-600/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] backdrop-blur-xl animate-in zoom-in-95 duration-500">
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
          <span className="font-tech flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl">
            🎁 BONO DE $300 WEB
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
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-3 scale-90 origin-top-right">
          <button
            onClick={onToggleSave}
            aria-label={isSaved ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md ${isSaved ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/10 bg-slate-900/40 text-white hover:text-rose-400'}`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleCompareToggle}
            aria-label={isComparing ? 'Quitar de comparación' : 'Añadir a comparación'}
            className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-lg transition-all backdrop-blur-md ${isComparing ? 'border-primary bg-primary text-white' : 'border-white/10 bg-slate-900/40 text-white hover:text-primary'}`}
          >
            <GitCompare size={18} />
          </button>
        </div>

        {/* Image */}
        <OptimizedImage
          src={currentSrc}
          alt={`${car.year} ${car.make} ${car.model} en venta Puerto Rico - Richard Automotive`}
          priority={priority}
          fetchPriority="low"
          width={500}
          height={300}
          className="w-full h-full object-contain transition-all duration-700 z-10 group-hover:scale-110 group-hover:-rotate-2 drop-shadow-[0_20px_50px_rgba(34,211,238,0.25)]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {carImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {carImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeImageIndex
                    ? 'bg-white w-4 shadow-md'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* SEO Schema.org: Rich Results Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: car.name || `${car.make || 'Ford'} ${car.model || 'Auto'} ${car.year || ''}`.trim(),
            image: (car.images && car.images[0]) || car.image || car.img || '',
            description: `Compra este ${car.name || 'vehículo'} en Richard Automotive. Financiamiento disponible y garantía local en Puerto Rico.`,
            brand: {
              '@type': 'Brand',
              name: car.make || 'Ford',
            },
            offers: {
              '@type': 'Offer',
              url: `https://www.richard-automotive.com/inventario/${car.id}`,
              priceCurrency: 'USD',
              price: car.price || 0,
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/UsedCondition',
            },
          }),
        }}
      />

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col relative z-20">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-primary">
              {car.type}
            </span>
            <div className="h-px w-8 bg-primary/50"></div>
          </div>
          <h3
            id={`car-title-${car.id}`}
            className="font-cinematic text-[2rem] tracking-[0.04em] text-white transition-colors group-hover:text-primary line-clamp-1 drop-shadow-md text-glow glitch-hover"
          >
            {car.name}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[9px] text-orange-400 font-tech uppercase tracking-wider animate-pulse">
              <Activity size={12} />
              <span>🔥 {stats?.dailyViews ?? ((car.id?.charCodeAt(0) || 0) % 3) + 1} cotizaron hoy</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <div className="text-[9px] text-cyan-400 font-tech uppercase tracking-widest">
              Vista {stats?.views ?? ((car.id?.charCodeAt(1) || 0) % 20) + 5} veces
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="hud-tag">Auto</span>
          <span className="hud-tag">Gasolina</span>
          <span className="hud-tag">4 Puertas</span>
        </div>

        <div className="mt-auto border-t border-white/10 pt-6">
          <div>
            <p className="font-cinematic text-4xl tracking-[0.03em] text-white text-glow">
              <AnimatedCounter value={car.price || 0} format="currency" />
            </p>
            <div className="mt-1">
              <p className="font-tech flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                Desde{' '}
                <AnimatedCounter value={estimatedMonthly} format="currency" duration={1500} />
                /mes *
              </p>
              <p className="font-tech text-[8px] uppercase tracking-[0.1em] text-slate-500 mt-0.5">
                Con pronto de ${suggestedPronto.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openWhatsAppWithCapture(car, estimatedMonthly, suggestedPronto);
            }}
            className="mt-4 w-full py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-[0_0_25px_rgba(37,211,102,0.5)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Cotizar por WhatsApp
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/precualificacion', { state: { dealContext: { vehicle: car } } });
            }}
            className="w-full mt-3 py-3 border border-white/20 hover:border-cyan-500/50 text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-full text-center transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1"
          >
            <Sparkles size={12} /> Pre-cualifícate Express
          </button>
        </div>
        <p className="text-[7px] text-slate-500 mt-2 leading-tight">
          * Mensualidad estimada a 72 meses con 8.5% APR. Sujeto a aprobación de crédito.
        </p>
      </div>
    </div>
  );
};

export default PremiumGlassCard;
