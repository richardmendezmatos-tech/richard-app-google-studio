'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from '@/shared/lib/next-route-adapter';
import { Car } from '@/entities/inventory';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Share2,
  Sparkles,
  Loader2,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Wind,
  Gauge,
  Compass,
  Cpu,
  Coins,
  Flame,
  Crown,
  Activity,
  Key,
  Gift,
} from 'lucide-react';
import { generateVehicleDeepAnalysis } from '@/shared/api/ai/client';
import { useDealer } from '@/entities/dealer';
import { logIntentSignal } from '@/shared/api/tracking/moatTrackingService';
import { useInventoryAnalytics } from '@/features/inventory';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';
import dynamic from 'next/dynamic';

const ApprovalSimulatorWidget = dynamic(() =>
  import('@/features/loans/ui/ApprovalSimulatorWidget').then((m) => m.ApprovalSimulatorWidget), { ssr: false }
);
const Viewer360 = dynamic(() =>
  import('@/features/inventory').then((m) => m.Viewer360), { ssr: false }
);
const PreQualifyView = dynamic(() =>
  import('@/views/leads/ui/PreQualifyView'), { ssr: false }
);
import { getCarImage } from '@/entities/inventory/lib/carImage';
import SEO from '@/shared/ui/seo/SEO';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { useMetaPixel } from '@/shared/lib/analytics/useMetaPixel';
import { ProgressRing } from '@/shared/ui/common/ProgressRing';
import { ImageLightbox } from '@/shared/ui/common/ImageLightbox';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { StatusBadge } from '@/entities/inventory';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import { motion, AnimatePresence } from 'framer-motion';
import DiscoveryHub from './vehicle-detail/DiscoveryHub';
import VehicleStickyBar from './vehicle-detail/VehicleStickyBar';

interface Props {
  inventory: Car[];
  car?: Car;
}

const VehicleDetail: React.FC<Props> = ({ inventory, car: propCar }) => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const { currentDealer } = useDealer();
  const engagedTimeRef = useRef(0);
  const [isPreQualifyOpen, setIsPreQualifyOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSession, setLightboxSession] = useState(0);
  const { trackEvent } = useMetaPixel();
  const analytics = useInventoryAnalytics();

  // Dynamic urgency simulation (decay/rebound)
  const [viewersCount, setViewersCount] = React.useState(() => Math.floor(Math.random() * 6) + 4);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(2, Math.min(12, next));
      });
    }, Math.random() * 10000 + 15000);
    return () => clearInterval(interval);
  }, []);

  const car = propCar || inventory.find((c) => c.id === id);

  useEffect(() => {
    if (car) {
      // SEO Automatic Redirection (Canonical URL Enforcement)
      const correctSlug = generateVehicleSlug(car, false);
      if (!slug || slug !== correctSlug) {
        navigate(`/inventario/${correctSlug}/${car.id}`, { replace: true });
        return;
      }

      analytics.trackCarViewIncremental(car.id);
      // Growth: Track Meta ViewContent
      trackEvent('ViewContent', {
        content_ids: [car.id],
        content_type: 'vehicle',
        content_name: car.name,
        value: car.price,
        currency: 'USD',
      });
    }
  }, [car, slug, navigate, analytics, trackEvent]);

  // Moat: Track engaged time on vehicle
  useEffect(() => {
    if (!car) return;
    const timer = setInterval(() => {
      engagedTimeRef.current += 1;
    }, 5000);
    return () => {
      if (engagedTimeRef.current > 0) {
        logIntentSignal({
          carId: id || 'unknown',
          dealerId: currentDealer.id,
          eventType: 'engaged_time',
          value: engagedTimeRef.current,
          sessionId: sessionStorage.getItem('session_id') || 'anon',
        });
      }
      clearInterval(timer);
    };
  }, [car, id, currentDealer.id]);

  const handleGalleryOpen = () => {
    logIntentSignal({
      carId: id || 'unknown',
      dealerId: currentDealer.id,
      eventType: 'gallery_open',
      sessionId: sessionStorage.getItem('session_id') || 'anon',
    });
  };

  // Generate Deep AI Analysis on load
  const { data: deepAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['deepAnalysis', car?.id],
    queryFn: async () => {
      if (!car) throw new Error('No vehicle found');
      return await generateVehicleDeepAnalysis(car);
    },
    enabled: !!car && isAnalysisOpen,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Helper to parse vehicle details if structured data is missing
  const { year, make, model } = React.useMemo(() => {
    if (!car) return { year: 2026, make: 'Auto', model: 'Auto' };
    const parts = (car?.name || '').split(' ');
    const parsedYear = car?.year || parseInt(parts[0]) || 2026;
    const parsedMake = car?.make || parts[1] || 'Auto';
    const parsedModel = car?.model || parts.slice(2).join(' ') || 'Auto';
    return { year: parsedYear, make: parsedMake, model: parsedModel };
  }, [car]);
  const siteUrl = SITE_CONFIG.url;

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: car.name,
          text: `Mira este ${car.name} en Richard Automotive`,
          url: window.location.href,
        });
      } catch {
        /* Share cancelled */
      }
    } else {
      alert('Enlace copiado al portapapeles');
    }
  };

  const whatsappUrl = `https://wa.me/1${BUSINESS_CONTACT.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hola Richard! 👋 Vi el ${car.name} (${year}) en tu web por $${car.price.toLocaleString()}. ¿Está disponible? También quiero info sobre el Bono Web de $300.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#020617] pb-32 pt-24 lg:pt-0 selection:bg-primary/30">
      <SEO
        title={`${car.name} | Richard Automotive`}
        description={`Compra este ${car.name} ${year} por $${car.price.toLocaleString()}. Financiamiento disponible, garantía incluida y entrega rápida en Puerto Rico.`}
        image={car.image || car.img || car.images?.[0] || ''}
        url={`/inventario/${slug || generateVehicleSlug(car)}/${car.id}`}
        type="product"
      />

      {/* Navigation Bar (Mobile) / Breadcrumb (Nivel 18: Liquid Glass) */}
      <div className="fixed top-0 left-0 right-0 bg-[#020617]/80 backdrop-blur-3xl p-5 z-40 flex justify-between items-center lg:hidden border-b border-white/10 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/40 transition-all active:scale-90"
        >
          <ChevronLeft className="text-white" />
        </button>
        <span className="font-tech text-xs font-black uppercase tracking-[0.3em] text-white truncate max-w-[180px]">
          {car.name}
        </span>
        <button
          onClick={handleShare}
          aria-label="Compartir vehículo"
          className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Share2 className="text-white" size={20} />
        </button>
      </div>

      {/* Desktop Back Button (Nivel 18 Precision) */}
      <div className="hidden lg:block max-w-[1400px] mx-auto px-12 py-10">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-slate-500 hover:text-primary font-black text-xs uppercase tracking-[0.4em] transition-all"
        >
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all">
            <ChevronLeft size={16} />
          </div>
          VOLVER AL HUB CENTRAL
        </button>
      </div>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column: Media Gallery */}
        <div className="space-y-10">
          {/* 360 Viewer Integration (Nivel 18 Cinema) */}
          <div className="relative z-10 w-full aspect-[4/3]">
            <React.Suspense
              fallback={
                <div className="w-full aspect-[4/3] animate-pulse bg-white/5 rounded-4xl border border-white/10" />
              }
            >
              <Viewer360
                images={(car.images || [car.image || car.img]).filter(Boolean) as string[]}
                alt={car.name}
                badge={car.badge}
                carPrice={car.price}
                carType={car.type}
                onFullscreen={handleGalleryOpen}
                onImageClick={(index) => {
                  setLightboxIndex(index);
                  setLightboxSession(s => s + 1);
                  setLightboxOpen(true);
                }}
              />
            </React.Suspense>
          </div>

          <ImageLightbox
            key={lightboxSession}
            images={(car.images || [car.image || car.img]).filter(Boolean) as string[]}
            initialIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />

          <GlassContainer
            intensity="medium"
            opacity={0.06}
            className="p-8 group relative overflow-hidden border-[#C5A880]/15 hover:border-[#C5A880]/40 transition-all duration-500"
          >
            {/* Gold Laser Scanner (CRO / Nivel 18 Precision) */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C5A880] shadow-[0_0_20px_#C5A880] opacity-0 group-hover:opacity-100 animate-scan transition-opacity" />
            <button
              onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
              className="w-full flex items-center justify-between mb-6 relative z-10"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#C5A880] animate-pulse" size={20} />
                <h3 className="font-tech text-xs font-black uppercase tracking-[0.4em] text-white">
                  ANÁLISIS <span className="text-[#C5A880]">COMPLETO</span>
                </h3>
              </div>
              <ChevronDown
                className={`text-slate-500 transition-transform duration-300 ${isAnalysisOpen ? 'rotate-180' : ''}`}
                size={16}
              />
            </button>

            <AnimatePresence initial={false}>
              {isAnalysisOpen && (
                <motion.div
                  key="deep-analysis-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {loadingAnalysis ? (
                    <div className="h-48 flex flex-col items-center justify-center gap-4 text-[#C5A880] relative z-10">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <span className="font-tech text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                        EJECUTANDO ANÁLISIS...
                      </span>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8 relative z-10"
                    >
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                          Technical Profile
                        </p>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed italic border-l-2 border-[#C5A880]/40 pl-4 py-1">
                          "{deepAnalysis?.technicalProfile}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(deepAnalysis?.keyFeatures || []).map((feature: any, i: number) => {
                          const iconName = feature.icon || 'Sparkles';
                          return (
                            <div
                              key={i}
                              className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 hover:border-[#C5A880]/30 transition-all flex items-start gap-3"
                            >
                              <div className="h-8 w-8 shrink-0 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
                                {(() => {
                                  const iconClass = 'text-[#C5A880] shrink-0';
                                  switch (iconName) {
                                    case 'ShieldCheck':
                                      return <ShieldCheck className={iconClass} size={16} />;
                                    case 'Zap':
                                      return <Zap className={iconClass} size={16} />;
                                    case 'Wind':
                                      return <Wind className={iconClass} size={16} />;
                                    case 'Gauge':
                                      return <Gauge className={iconClass} size={16} />;
                                    case 'Compass':
                                      return <Compass className={iconClass} size={16} />;
                                    case 'Cpu':
                                      return <Cpu className={iconClass} size={16} />;
                                    case 'Coins':
                                      return <Coins className={iconClass} size={16} />;
                                    case 'Flame':
                                      return <Flame className={iconClass} size={16} />;
                                    case 'Crown':
                                      return <Crown className={iconClass} size={16} />;
                                    case 'Activity':
                                      return <Activity className={iconClass} size={16} />;
                                    case 'Key':
                                      return <Key className={iconClass} size={16} />;
                                    default:
                                      return <Sparkles className={iconClass} size={16} />;
                                  }
                                })()}
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-[#C5A880] uppercase tracking-widest mb-0.5">
                                  {feature.label}
                                </p>
                                <p className="text-xs font-bold text-white">{feature.value}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-5 rounded-2xl bg-[#C5A880]/5 border border-[#C5A880]/10">
                        <p className="text-[9px] font-black text-[#C5A880] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <ShieldCheck size={12} className="text-[#C5A880]" /> Psychological Hook
                        </p>
                        <p className="text-xs md:text-sm font-semibold text-slate-300 leading-relaxed pl-1">
                          {deepAnalysis?.psychologicalHook}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-linear-to-br from-[#C5A880]/5 to-transparent pointer-events-none" />
          </GlassContainer>
        </div>

        {/* Right Column: Details & Finance */}
        <div className="space-y-12">
          {/* Breadcrumbs (Nivel 18 Precision) */}
          <nav className="hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="/" className="hover:text-white transition-colors">
              INICIO
            </a>
            <ChevronRight size={10} className="text-slate-700" />
            <a href="/inventario" className="hover:text-white transition-colors">
              INVENTARIO
            </a>
            <ChevronRight size={10} className="text-slate-700" />
            <a
              href={`/autos-usados/tipo/${car.type?.toLowerCase() || 'sedan'}`}
              className="hover:text-white transition-colors"
            >
              {car.type || 'AUTO'}
            </a>
            <ChevronRight size={10} className="text-primary/40" />
            <span className="text-primary">{car.name}</span>
          </nav>

          {/* Header (Nivel 18 Precision) */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                {car.type}{car.trim ? ` • ${car.trim}` : ''} • {year}{car.vin ? ` • ••••${car.vin.slice(-4)}` : ''} • Vega Alta, PR
              </span>
            </motion.div>
            <h1 className="font-cinematic text-5xl lg:text-8xl text-white tracking-tighter leading-none text-glow uppercase">
              {(car.year && car.make && car.model)
                ? `${car.year} ${car.make} ${car.model}`
                : car.name}
            </h1>
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-6 mt-4">
                <span className="font-tech text-5xl font-black text-white decoration-primary/30 underline-offset-8">
                  ${car.price.toLocaleString()}
                </span>
                <span className="font-tech text-lg font-black text-emerald-400/80">
                  ~${Math.round((car.price - 2000) * (1.049 / 60)).toLocaleString()}/mes
                </span>
                <StatusBadge status={car.status} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={() => setIsPreQualifyOpen(true)}
                  className="flex-1 px-8 py-4 bg-primary hover:bg-cyan-500 text-slate-900 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 animate-btn-glow"
                >
                  <Zap size={18} className="animate-pulse" />
                  Pre-cualifícate Express
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-4 bg-white/5 border border-white/20 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 group"
                >
                  <MessageCircle
                    size={18}
                    className="text-emerald-400 group-hover:scale-125 transition-transform"
                  />
                  Hagamos Negocio
                </a>
              </div>

              {/* Urgency Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 mt-2"
              >
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
                <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest">
                  {viewersCount} personas viendo esta unidad ahora
                </span>
              </motion.div>
            </div>
          </div>

          {/* Ford-First Badges */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-wrap">
            {car.make?.toLowerCase() === 'ford' && (
              <>
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-400 whitespace-nowrap">
                  <ShieldCheck size={14} /> Garantía 10 Años / 100k
                </div>
                <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-cyan-400 whitespace-nowrap">
                  <Zap size={14} /> Bono Web $300
                </div>
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-amber-400 whitespace-nowrap">
                  <Coins size={14} /> Ford Credit
                </div>
              </>
            )}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap">
              <ShieldCheck size={14} className="text-emerald-500" /> GARANTÍA RICHARD
            </div>
          </div>

          {/* Dynamic Specs Grid */}
          <GlassContainer intensity="low" opacity={0.04} className="p-6">
            <h3 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">
              ESPECIFICACIONES
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Año', value: car.year?.toString() },
                { label: 'Condición', value: car.condition === 'new' ? 'Nuevo' : car.condition === 'used' ? 'Usado' : null },
                { label: 'Versión / Trim', value: car.trim || null },
                { label: 'Millaje', value: car.mileage != null ? `${car.mileage.toLocaleString()} mi` : null },
                { label: 'Transmisión', value: car.transmission ? car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1) : null },
                { label: 'Combustible', value: (car.fuel || car.fuelType) ? (car.fuel || car.fuelType || '').charAt(0).toUpperCase() + (car.fuel || car.fuelType || '').slice(1) : null },
                { label: 'Motor / HP', value: [car.engine, car.hp ? `${car.hp} HP` : null].filter(Boolean).join(' · ') || null },
                { label: 'Tracción', value: (car as any).drive_train || null },
                { label: 'Tipo', value: car.type ? car.type.charAt(0).toUpperCase() + car.type.slice(1) : null },
                { label: 'Color Exterior', value: car.color && car.color !== 'N/A' ? car.color : null },
                { label: 'Color Interior', value: (car as any).interior_color || null },
              ].filter((s) => s.value).map((spec) => (
                <div key={spec.label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{spec.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>
          </GlassContainer>

          {/* Description */}
          {car.description && (
            <GlassContainer intensity="low" opacity={0.04} className="p-6">
              <h3 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">
                DESCRIPCIÓN
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">{car.description}</p>
            </GlassContainer>
          )}

          {/* Features Tags */}
          {car.features && car.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                CARACTERÍSTICAS
              </h3>
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-slate-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deal Builder */}
          <div id="deal-builder-section" className="scroll-mt-32">
            <React.Suspense
              fallback={
                <div className="w-full h-[600px] rounded-5xl border border-white/10 overflow-hidden p-8 space-y-6">
                  <div className="h-8 w-48 animate-pulse bg-white/5 rounded-lg" />
                  <div className="h-4 w-64 animate-pulse bg-white/5 rounded-lg" />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-32 animate-pulse bg-white/5 rounded-2xl" />
                    <div className="h-32 animate-pulse bg-white/5 rounded-2xl" />
                  </div>
                  <div className="h-24 animate-pulse bg-white/5 rounded-2xl" />
                  <div className="h-16 animate-pulse bg-white/5 rounded-2xl" />
                  <div className="flex gap-4">
                    <div className="h-14 flex-1 animate-pulse bg-white/5 rounded-2xl" />
                    <div className="h-14 flex-1 animate-pulse bg-white/5 rounded-2xl" />
                  </div>
                </div>
              }
            >
              <GlassContainer intensity="medium" opacity={0.02} className="p-1">
                <ApprovalSimulatorWidget
                  vehicleId={car.id}
                  basePrice={car.price}
                  vehicleName={car.name}
                  dealerId={currentDealer?.id || 'richard-automotive'}
                />
              </GlassContainer>
            </React.Suspense>
          </div>

          <div className="h-px bg-white/5" />

          <GlassContainer
            intensity="high"
            opacity={0.04}
            className="p-8 group shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-8 bg-primary rounded-full group-hover:w-12 transition-all" />
              <h3 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                PERFORMANCE                 INDEX <span className="text-white">/ LAB</span>
              </h3>
            </div>
            <div className="flex justify-center mb-8">
              <ProgressRing
                label="PUNTUACIÓN"
                value={deepAnalysis?.advantageScore || 85}
                max={100}
                size={140}
                strokeWidth={12}
              />
            </div>

            <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Market Position
                </span>
              </div>
              <p className="text-xs font-bold text-slate-300 leading-relaxed">
                {deepAnalysis?.marketPosition ||
                  'Unidad con alta demanda proyectada en el mercado local.'}
              </p>
            </div>

            <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/5 blur-3xl pointer-events-none" />
          </GlassContainer>

          {/* Quick CTAs */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/prueba-de-manejo"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Prueba de Manejo
            </a>
            <a
              href="/trade-in"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Trade-In
            </a>
            <a
              href="/bono-300"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all col-span-2"
            >
              <Gift size={14} /> Bono Web $300 — Canjea tu Descuento
            </a>
          </div>

          {/* Referral CTA */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 text-center">
            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">
              Recomienda y Gana
            </p>
            <p className="text-xs text-slate-400 mb-3">
              Invita a un amigo y recibe <strong className="text-amber-400">$200</strong>. Tu amigo recibe{' '}
              <strong className="text-amber-400">$100</strong> de descuento.
            </p>
            <a
              href="/recomienda"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              <Gift size={14} /> Recomendar Ahora
            </a>
          </div>

        </div>
      </main>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-32">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="font-cinematic text-3xl lg:text-5xl text-white tracking-tighter uppercase">
              Unidades Similares
            </h2>
            <p className="font-tech text-[10px] text-primary font-black uppercase tracking-[0.4em]">
              Sugerencias para ti
            </p>
          </div>
          <a
            href="/inventario"
            className="hidden lg:flex items-center gap-3 text-white/50 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest"
          >
            VER TODO EL INVENTARIO <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {inventory
            .filter((i) => i.id !== car.id && (i.type === car.type || i.make === car.make))
            .slice(0, 3)
            .map((item) => (
              <a
                key={item.id}
                href={`/inventario/${generateVehicleSlug(item, false)}/${item.id}`}
                className="group relative bg-white/5 border border-white/10 rounded-4xl overflow-hidden hover:border-primary/40 transition-all"
              >
                <div className="aspect-video relative overflow-hidden flex items-center justify-center bg-slate-900/20">
                  <Image
                    src={getCarImage(item)}
                    alt={item.name}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-transparent opacity-80" />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="font-tech text-[9px] text-primary font-black uppercase tracking-widest">
                      {item.year} • {item.type}
                    </p>
                    <p className="font-tech text-lg font-black text-white">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                  <h3 className="font-cinematic text-xl text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </div>
              </a>
            ))}
        </div>
      </section>

      {/* Discovery Hub: Internal Linking for SEO Authority Distribution */}
      <DiscoveryHub car={car} />

      {/* Sticky CTA Bar — mobile y desktop */}
      <VehicleStickyBar car={car} whatsappUrl={whatsappUrl} />

      {/* Pre-Qualification Modal */}
      <AnimatePresence>
        {isPreQualifyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-5xl border border-white/10 p-1 w-full max-w-4xl relative shadow-2xl mt-20 lg:mt-0"
            >
              <button
                onClick={() => setIsPreQualifyOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white z-50 p-2 bg-slate-800/50 rounded-full backdrop-blur-md border border-white/5"
              >
                ✕
              </button>
              <div className="max-h-[85vh] overflow-y-auto p-6">
                <React.Suspense
                  fallback={
                    <div className="h-[600px] p-8 space-y-6">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 animate-pulse bg-white/5 rounded-2xl" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-48 animate-pulse bg-white/5 rounded-lg" />
                          <div className="h-3 w-32 animate-pulse bg-white/5 rounded-lg" />
                        </div>
                      </div>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-3">
                          <div className="h-3 w-24 animate-pulse bg-white/5 rounded-lg" />
                          <div className="h-12 animate-pulse bg-white/5 rounded-2xl" />
                        </div>
                      ))}
                      <div className="h-14 animate-pulse bg-white/5 rounded-2xl mt-8" />
                    </div>
                  }
                >
                  <PreQualifyView
                    dealContext={{
                      vehicle: car,
                      quote: {
                        monthlyPayment: Math.round((car.price - 2000) * (1.049 / 60)),
                        downPayment: 2000,
                        term: 60,
                        apr: 4.9,
                      },
                    }}
                  />
                </React.Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleDetail;
