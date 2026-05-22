'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from '@/shared/lib/next-route-adapter';
import { Car } from '@/entities/inventory';
import {
  ChevronLeft,
  ChevronRight,
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
} from 'lucide-react';
import { generateCarPitch, sentinelAI } from '@/shared/api/ai';
import { useDealer } from '@/entities/dealer';
import { logIntentSignal } from '@/shared/api/tracking/moatTrackingService';
import { useInventoryAnalytics } from '@/features/inventory';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

const ApprovalSimulatorWidget = React.lazy(() =>
  import('@/features/loans/ui/ApprovalSimulatorWidget').then((m) => ({
    default: m.ApprovalSimulatorWidget,
  })),
);
const Viewer360 = React.lazy(() =>
  import('@/features/inventory').then((m) => ({ default: m.Viewer360 })),
);
const PreQualifyView = React.lazy(() =>
  import('@/views/leads/ui/PreQualifyView').then((m) => ({ default: m.default })),
);
import SEO from '@/shared/ui/seo/SEO';
import { SITE_CONFIG } from '@/shared/config/siteConfig';
import { useMetaPixel } from '@/shared/lib/analytics/useMetaPixel';
import { ProgressRing } from '@/shared/ui/common/ProgressRing';
import DOMPurify from 'dompurify';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  inventory: Car[];
  car?: Car;
}

const VehicleDetail: React.FC<Props> = ({ inventory, car: propCar }) => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const { currentDealer } = useDealer();
  const [engagedTime, setEngagedTime] = useState(0);
  const [isPreQualifyOpen, setIsPreQualifyOpen] = useState(false);
  const { trackEvent } = useMetaPixel();
  const analytics = useInventoryAnalytics();

  // Mocked dynamic urgency (for CRO)
  const [viewersCount, setViewersCount] = React.useState(5);
  React.useEffect(() => {
    setViewersCount(Math.floor(Math.random() * 5) + 3);
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
    const timer = setInterval(() => setEngagedTime((prev) => prev + 1), 5000);
    return () => {
      if (engagedTime > 0) {
        logIntentSignal({
          carId: id || 'unknown',
          dealerId: currentDealer.id,
          eventType: 'engaged_time',
          value: engagedTime,
          sessionId: sessionStorage.getItem('session_id') || 'anon',
        });
      }
      clearInterval(timer);
    };
  }, [engagedTime, car, id, currentDealer.id]);

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
      return await sentinelAI.generateVehicleDeepAnalysis(car);
    },
    enabled: !!car,
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

  const whatsappUrl = `https://wa.me/${BUSINESS_CONTACT.phone.replace(/-/g, '')}?text=${encodeURIComponent(
    `Hola Richard, vi el ${car.name} (${year}) en tu web por $${car.price.toLocaleString()}. Quisiera más información para comprarlo.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#020617] pb-24 pt-24 lg:pt-0 selection:bg-primary/30">
      <SEO
        title={`${car.name} | Richard Automotive`}
        description={`Compra este ${car.name} ${year} por $${car.price.toLocaleString()}. Financiamiento disponible, garantía incluida y entrega rápida en Puerto Rico.`}
        image={car.img}
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
          <div className="relative z-10 w-full min-h-[400px] lg:min-h-[500px]">
            <React.Suspense
              fallback={
                <div className="w-full h-[400px] lg:h-[500px] animate-pulse bg-white/5 rounded-5xl border border-white/10" />
              }
            >
              <Viewer360
                images={(car.images || [car.image || car.img]).filter(Boolean) as string[]}
                alt={car.name}
                badge={car.badge}
                carPrice={car.price}
                carType={car.type}
                onFullscreen={handleGalleryOpen}
              />
            </React.Suspense>
          </div>

          <GlassContainer
            intensity="medium"
            opacity={0.06}
            className="p-8 group relative overflow-hidden border-[#C5A880]/15 hover:border-[#C5A880]/40 transition-all duration-500"
          >
            {/* Gold Laser Scanner (CRO / Nivel 18 Precision) */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C5A880] shadow-[0_0_20px_#C5A880] opacity-0 group-hover:opacity-100 animate-scan transition-opacity" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <Sparkles className="text-[#C5A880] animate-pulse" size={20} />
                <h3 className="font-tech text-xs font-black uppercase tracking-[0.4em] text-white">
                  SENTINEL <span className="text-[#C5A880]">DEEP ANALYSIS</span>
                </h3>
              </div>
              <span className="text-[8px] font-tech font-black text-slate-500 uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                S-AI v2.4 Active
              </span>
            </div>

            {loadingAnalysis ? (
              <div className="h-48 flex flex-col items-center justify-center gap-4 text-[#C5A880] relative z-10">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="font-tech text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                  EXECUTING NEURAL SCAN...
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
                {car.type} • {year} • DATABASE-RECOGNIZED
              </span>
            </motion.div>
            <h1 className="font-cinematic text-5xl lg:text-8xl text-white tracking-tighter leading-none text-glow uppercase">
              {car.name}
            </h1>
            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-6 mt-4">
                <span className="font-tech text-5xl font-black text-white decoration-primary/30 underline-offset-8">
                  ${car.price.toLocaleString()}
                </span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    MARKET-VALIDATED
                  </span>
                </div>
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

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              {
                icon: <ShieldCheck size={16} className="text-emerald-500" />,
                label: 'SENTINEL WARRANTY',
              },
              { icon: <Zap size={16} className="text-amber-500" />, label: 'EXPRESS DELIVERY' },
            ].map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 whitespace-nowrap"
              >
                {b.icon} {b.label}
              </div>
            ))}
          </div>

          <GlassContainer
            intensity="high"
            opacity={0.04}
            className="p-8 group shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-8 bg-primary rounded-full group-hover:w-12 transition-all" />
              <h3 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                PERFORMANCE INDEX <span className="text-white">/ SENTINEL LAB</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <ProgressRing
                label="SENTINEL SCORE"
                value={deepAnalysis?.advantageScore || 85}
                max={100}
                size={140}
                strokeWidth={12}
              />
              <ProgressRing
                label="TECH RANK"
                value={car.type === 'luxury' ? 98 : 92}
                max={100}
                size={140}
                strokeWidth={12}
                color="#f59e0b"
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

          <div className="h-px bg-white/5" />

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
        </div>
      </main>

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-32">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="font-cinematic text-3xl lg:text-5xl text-white tracking-tighter uppercase">
              Unidades Similares
            </h2>
            <p className="font-tech text-[10px] text-primary font-black uppercase tracking-[0.4em]">
              Sugerencias de la Red Sentinel
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
                    src={item.image || item.img || item.images?.[0] || '/images/placeholders/car.webp'}
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
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-24 mb-12">
        <GlassContainer intensity="low" opacity={0.03} className="p-10 border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                Explorar Categoría
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Descubre más unidades similares en nuestra colección curada.
              </p>
              <a
                href={`/autos-usados/tipo/${car.type?.toLowerCase() || 'sedan'}`}
                className="inline-flex items-center gap-2 text-white font-bold hover:text-primary transition-all group"
              >
                Ver todos los {car.type || 'Autos'}
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                Inventario Local
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Encuentra los mejores autos usados certificados cerca de ti.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Vega Alta', 'Bayamón', 'San Juan'].map((city) => (
                  <a
                    key={city}
                    href={`/autos-usados/${city.toLowerCase().replace(' ', '-')}`}
                    className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
                  >
                    #{city}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-tech text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                Richard Automotive
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Especialistas en pickups y guaguas de lujo en Puerto Rico.
              </p>
              <a
                href="/"
                className="text-xs font-black text-white hover:text-primary transition-all underline underline-offset-8 decoration-primary/30"
              >
                IR AL HUB DE INVENTARIO
              </a>
            </div>
          </div>
        </GlassContainer>
      </section>

      {/* Mobile Sticky CTA (Nivel 18: Kinetic Bar) */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#020617]/90 backdrop-blur-3xl border-t border-white/10 shadow-2xl z-50 lg:hidden flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-tech text-[9px] text-slate-500 font-black uppercase tracking-widest">
            {car.name}
          </p>
          <p className="text-2xl font-black text-white leading-none tracking-tighter decoration-primary decoration-4">
            ${car.price.toLocaleString()}
          </p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all active:scale-90"
        >
          <MessageCircle size={20} />
        </a>
        <button
          onClick={() => {
            document.getElementById('deal-builder-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex-1 bg-primary hover:bg-primary/90 text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,229,255,0.4)] transition-all active:scale-95 animate-btn-glow"
        >
          ME INTERESA
        </button>
      </div>
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
