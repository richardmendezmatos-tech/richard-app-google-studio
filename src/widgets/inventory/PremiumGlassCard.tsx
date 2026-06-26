'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { Car } from '@/entities/inventory';
import { Heart, GitCompare, Sparkles, Activity, Zap } from 'lucide-react';
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
import { calculatePredictiveDTS } from '@/entities/inventory';

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
  const navigate = useNavigate();
  const { addCarToCompare, removeCarFromCompare } = useComparison();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComparing) removeCarFromCompare(car.id);
    else addCarToCompare(car);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const suggestedPronto = calculateSuggestedPronto(car.price || 0);
  const estimatedMonthly = calculateMonthlyPayment(car.price || 0, suggestedPronto);
  const isScarce = calculatePredictiveDTS(car).advantageScore > 70;

  const { data: stats } = useVehicleStats(car.id);
  const dailyViews = stats?.dailyViews ?? ((car.id?.charCodeAt(0) || 0) % 3) + 1;

  const carImages = getCarImages(car, 3);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const isHovering = useRef(false);

  useEffect(() => {
    if (carImages.length < 2) return;
    const interval = setInterval(() => {
      if (!isHovering.current) {
        setActiveImageIndex((prev) => (prev + 1) % carImages.length);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [carImages.length]);

  const currentSrc = carImages.length > 1 ? carImages[activeImageIndex] : getCarImage(car);
  const isNew = car.condition === 'new';

  // Real specs from car data — fallback to generic only when truly unknown
  const specChips: { label: string; icon: string }[] = [
    { label: car.year ? String(car.year) : '', icon: '📅' },
    {
      label: car.mileage != null
        ? car.mileage === 0
          ? '0 millas'
          : `${car.mileage.toLocaleString()} mi`
        : '',
      icon: '🛣',
    },
    {
      label: (car.transmission || car.fuel || car.fuelType || '').replace(/automática/i, 'Auto').replace(/manual/i, 'Manual') || '',
      icon: '⚙',
    },
  ].filter((s) => s.label);

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
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${car.name}`}
      className="glass-premium group relative flex h-full cursor-pointer flex-col overflow-hidden text-left active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      {/* ── Image Section ── */}
      <div
        className="relative w-full overflow-hidden flex items-center justify-center rounded-t-3xl bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 border-b border-white/5 h-card-image hud-brackets"
        onMouseEnter={() => { isHovering.current = true; }}
        onMouseLeave={() => { isHovering.current = false; }}
      >
        <div className="scanline-overlay opacity-10" />

        {/* Gradient overlay bottom for legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-950/80 to-transparent z-10" />

        {/* Shine on hover */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* ── Badges: max 2 visible ── */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
          {/* Condition — always shown */}
          {isNew ? (
            <span className="font-tech flex items-center gap-1.5 rounded-full border border-cyan-400/50 bg-linear-to-r from-cyan-500/80 to-blue-600/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_16px_rgba(34,211,238,0.4)] backdrop-blur-xl">
              <Sparkles size={10} className="animate-pulse" /> NUEVO
            </span>
          ) : (
            <span className="font-tech flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-800/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 backdrop-blur-md">
              USADO
            </span>
          )}

          {/* Urgency — only one, highest priority */}
          {isRecommended ? (
            <span className="font-tech animate-pulse rounded-full border border-amber-400/40 bg-linear-to-r from-amber-400 to-orange-500 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-slate-900 shadow-[0_0_12px_rgba(251,191,36,0.35)]">
              ★ Para ti
            </span>
          ) : (isHighInterest || isScarce) ? (
            <span className="font-tech flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-rose-400 backdrop-blur-xl">
              <Zap size={9} fill="currentColor" /> Alta demanda
            </span>
          ) : null}
        </div>

        {/* ── Action buttons ── */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(e); }}
            aria-label={isSaved ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-md transition-all duration-200 backdrop-blur-md hover:scale-110 active:scale-95 ${isSaved ? 'border-rose-500 bg-rose-500 text-white' : 'border-white/10 bg-slate-900/50 text-white/60 hover:text-rose-400 hover:border-rose-500/40'}`}
          >
            <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleCompareToggle}
            aria-label={isComparing ? 'Quitar de comparación' : 'Añadir a comparación'}
            className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-md transition-all duration-200 backdrop-blur-md hover:scale-110 active:scale-95 ${isComparing ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400' : 'border-white/10 bg-slate-900/50 text-white/60 hover:text-cyan-400 hover:border-cyan-400/40'}`}
          >
            <GitCompare size={16} />
          </button>
        </div>

        {/* Social proof chip — bottom left over gradient */}
        <div className="absolute bottom-3 left-4 z-20">
          <span className="font-tech flex items-center gap-1 text-[9px] uppercase tracking-wider text-orange-300/90">
            <Activity size={10} className="animate-pulse" />
            {dailyViews} cotizaron hoy
          </span>
        </div>

        {/* Car image */}
        <OptimizedImage
          src={currentSrc}
          alt={`${car.year} ${car.make} ${car.model} en venta Puerto Rico - Richard Automotive`}
          priority={priority}
          fetchPriority="low"
          width={500}
          height={300}
          className="w-full h-full object-contain transition-all duration-700 z-10 group-hover:scale-110 group-hover:-rotate-2 drop-shadow-[0_20px_50px_rgba(34,211,238,0.2)]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Image dots */}
        {carImages.length > 1 && (
          <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
            {carImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImageIndex ? 'w-4 bg-white shadow-md' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Schema.org ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: car.name || `${car.make} ${car.model} ${car.year}`.trim(),
            image: car.images?.[0] || car.image || '',
            description: `Compra este ${car.name || 'vehículo'} en Richard Automotive. Financiamiento disponible y garantía local en Puerto Rico.`,
            brand: { '@type': 'Brand', name: car.make || 'Ford' },
            offers: {
              '@type': 'Offer',
              url: `https://www.richard-automotive.com/inventario/${car.id}`,
              priceCurrency: 'USD',
              price: car.price || 0,
              availability: 'https://schema.org/InStock',
              itemCondition: isNew
                ? 'https://schema.org/NewCondition'
                : 'https://schema.org/UsedCondition',
            },
          }),
        }}
      />

      {/* ── Content ── */}
      <div className="p-6 flex-1 flex flex-col relative z-20">

        {/* Name */}
        <div className="mb-5">
          <span className="font-tech text-[9px] uppercase tracking-[0.25em] text-slate-500">
            {car.make}
          </span>
          <h3
            id={`car-title-${car.id}`}
            className="font-cinematic text-[1.75rem] leading-none tracking-[0.04em] text-white transition-colors group-hover:text-cyan-300 line-clamp-1 mt-0.5"
          >
            {car.model} {car.trim || ''}
          </h3>
        </div>

        {/* Real specs chips */}
        {specChips.length > 0 && (
          <div className="flex gap-2 mb-5 flex-wrap">
            {specChips.map((chip) => (
              <span key={chip.label} className="hud-tag text-[10px]">
                {chip.icon} {chip.label}
              </span>
            ))}
          </div>
        )}

        {/* ── Pricing: monthly first ── */}
        <div className="mt-auto border-t border-white/10 pt-5">
          <div className="flex items-end justify-between gap-2 mb-1">
            <div>
              <p className="font-tech text-[9px] uppercase tracking-[0.2em] text-slate-500 mb-0.5">
                Desde
              </p>
              <p className="font-cinematic text-4xl tracking-tight text-white leading-none">
                <AnimatedCounter value={estimatedMonthly} format="currency" duration={1200} />
                <span className="font-tech text-base text-slate-400 tracking-wider">/mes</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-tech text-[9px] uppercase tracking-[0.15em] text-slate-500 mb-0.5">
                Precio
              </p>
              <p className="font-tech text-lg font-bold text-slate-300">
                ${(car.price || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="font-tech text-[8px] text-slate-600 mb-5">
            Con pronto de ${suggestedPronto.toLocaleString()} · 72 meses · 8.5% APR · Sujeto a crédito
          </p>

          {/* WhatsApp CTA — primary */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openWhatsAppWithCapture(car, estimatedMonthly, suggestedPronto);
            }}
            className="w-full py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-widest rounded-full shadow-[0_0_24px_rgba(37,211,102,0.45)] transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Cotizar por WhatsApp
          </button>

          {/* Pre-qualify — secondary, text link style */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/precualificacion', { state: { dealContext: { vehicle: car } } });
            }}
            className="mt-3 w-full py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors duration-200 text-center"
          >
            Pre-cualifícate gratis →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumGlassCard;
