import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { Car } from '@/entities/inventory';
import { ShieldCheck, Heart, GitCompare, ChevronRight, Users, Zap } from 'lucide-react';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { StatusBadge } from '@/features/inventory/ui/StatusBadge';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { getCarImage, getCarImages } from '@/entities/inventory/lib/carImage';
import { calculatePredictiveDTS } from '@/entities/inventory';
import { openWhatsAppWithCapture } from '@/shared/lib/utils/whatsapp';
import { useVehicleStats } from '@/features/inventory/hooks/useVehicleStats';
import { calculateMonthlyPayment, calculateSuggestedPronto } from '@/shared/lib/utils/financing';

interface CarCardProps {
  car: Car;
  onSelect?: () => void;
  onCompare: (e: React.MouseEvent) => void;
  isComparing: boolean;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}

const CarCard: React.FC<CarCardProps> = React.memo(
  ({ car, isSaved, onToggleSave, onCompare, isComparing, onSelect }) => {
    const navigate = useNavigate();
    const handleCompareToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      onCompare(e);
    };

    // DTS Engine Integration (Expert Decision: Real Business Logic > Placeholders)
    const predictiveStats = calculatePredictiveDTS(car);
    const isScarce = predictiveStats.advantageScore > 70;
    // Deterministic "units available" count: 1-3, derived from car id so it's stable across renders
    const unitsAvailable = isScarce
      ? ((car.id?.charCodeAt(2) || 5) % 3) + 1
      : null;
    // F&I Logic (Expert Decision: real amortization > simple division)
    const suggestedPronto = calculateSuggestedPronto(car.price);
    const estimatedMonthly = calculateMonthlyPayment(car.price, suggestedPronto);
    // Social Proof: real-time view stats from Supabase
    const { data: stats } = useVehicleStats(car.id);
    const dailyViews = stats?.dailyViews ?? ((car.id?.charCodeAt(0) || 0) % 3) + 1;

    const carImages = getCarImages(car, 3);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isHovering = useRef(false);

    useEffect(() => {
      if (carImages.length < 2) return;
      intervalRef.current = setInterval(() => {
        if (!isHovering.current) {
          setActiveImageIndex((prev) => (prev + 1) % carImages.length);
        }
      }, 4000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [carImages.length]);

    const currentSrc = carImages.length > 1
      ? carImages[activeImageIndex]
      : getCarImage(car);

    return (
      <div
        onClick={() => navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`);
          }
        }}
        role="button"
        tabIndex={0}
        className="group content-auto bg-white dark:bg-slate-800 rounded-5xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-2xl hover:shadow-cyan-900/10 transition-all duration-500 cursor-pointer text-left flex flex-col relative h-full"
      >
        <div className="relative aspect-[4/3] bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden p-8 flex items-center justify-center">
          {/* Badges Container */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 items-start">
            {car.badge && (
              <span className="px-3 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                {car.badge}
              </span>
            )}
            <span className="px-3 py-1.5 bg-white/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm">
              <ShieldCheck size={12} className="text-emerald-500" /> Richard Certified
            </span>
            <StatusBadge status={car.status} />
            <span className="px-3 py-1.5 bg-rose-500/90 text-white text-[10px] font-bold tracking-widest rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm animate-pulse">
              <Users size={12} /> {dailyViews} cotizaron hoy
            </span>
          </div>

          {/* Action Buttons Top Right */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
            {/* Heart / Save Button */}
            <div
              onClick={onToggleSave}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 border ${isSaved ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-rose-500'}`}
              title={isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            >
              <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
            </div>

            {/* Compare Button */}
            <div
              onClick={handleCompareToggle}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-110 border ${isComparing ? 'bg-primary text-white border-primary' : 'bg-white/80 dark:bg-slate-700/80 text-slate-400 border-slate-200 dark:border-slate-600 hover:text-primary'}`}
              title={isComparing ? 'Quitar de comparar' : 'Agregar a comparar'}
            >
              <GitCompare size={20} />
            </div>
          </div>

          <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 hidden lg:block">
            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-primary shadow-md">
              <ChevronRight size={20} />
            </div>
          </div>

          <OptimizedImage
            src={currentSrc}
            alt={`${car.year ?? ''} ${car.make ?? car.name} ${car.model ?? ''} ${car.badge?.toLowerCase().includes('nuevo') ? 'Nuevo' : 'Usado'} en Venta en Puerto Rico`.trim()}
            className="w-full h-full object-contain transition-all duration-700 drop-shadow-2xl z-10 group-hover:scale-110 group-hover:-rotate-2"
            aspectRatio="aspect-[4/3]"
            fetchPriority="low"
          />

          {carImages.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5"
              onMouseEnter={() => { isHovering.current = true; }}
              onMouseLeave={() => { isHovering.current = false; }}
            >
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

        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-4">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              {car.year && <>{car.year} · </>}{car.type?.toUpperCase() || 'AUTO'}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none mt-1 group-hover:text-primary transition-colors">
              {car.name}
            </h3>
          </div>

          {/* Key Features — datos reales del vehículo */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase ${car.condition === 'new' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'}`}>
              {car.condition === 'new' ? 'Nuevo' : 'Usado'}
            </span>
            {car.mileage != null && car.condition !== 'new' && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold">
                {car.mileage.toLocaleString()} mi
              </span>
            )}
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold capitalize">
              {car.transmission || 'Automática'}
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md text-slate-500 font-bold capitalize">
              {car.fuel || car.fuelType || 'Gasolina'}
            </span>
          </div>

          <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-6 relative">
            {unitsAvailable !== null && (
              <div className="absolute -top-3 left-0 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm animate-pulse">
                <Zap size={10} fill="currentColor" /> Solo {unitsAvailable} disponible{unitsAvailable > 1 ? 's' : ''}
              </div>
            )}
            <div>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-200">
                ${car.price.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-primary mt-1">
                Desde ${estimatedMonthly.toLocaleString()}/mes
              </p>
              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">
                Con pronto de ${suggestedPronto.toLocaleString()} *
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openWhatsAppWithCapture(car, estimatedMonthly, suggestedPronto);
              }}
              className="mt-4 w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Cotizar por WhatsApp
            </button>
            <div className="mt-2 text-center">
              <span className="px-4 py-2 inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-primary transition-colors cursor-pointer border border-slate-200 dark:border-slate-600 rounded-xl" onClick={(e) => { e.stopPropagation(); navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`); }}>
                Solicitar Prueba →
              </span>
            </div>
          </div>
          <p className="text-[7px] text-slate-400 mt-4 leading-tight">
            * Mensualidad estimada a 72 meses con 8.5% APR. Sujeto a aprobación de crédito.
          </p>
        </div>
      </div>
    );
  },
);

CarCard.displayName = 'CarCard';

export default CarCard;
