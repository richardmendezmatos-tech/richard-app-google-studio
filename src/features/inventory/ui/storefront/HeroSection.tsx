'use client';

import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Shield, Clock, Zap } from 'lucide-react';
import { trackInterestIndex } from '@/shared/api/metrics/analytics';

const NeuralBackground = lazy(() =>
  import('@/shared/ui/common/NeuralBackground').then((m) => ({ default: m.NeuralBackground })),
);
const HeroCTAPanel = lazy(() => import('./HeroCTAPanel').then((m) => ({ default: m.HeroCTAPanel })));

interface HeroSectionProps {
  onNeuralMatch: () => void;
  onBrowseInventory: () => void;
  onSellCar: () => void;
}

const HEADLINES = [
  {
    eyebrow: 'DOMINA LA CARRETERA',
    line1: 'AUTOS NUEVOS',
    line2: 'Y USADOS',
    accent: 'LISTO PARA ACCIONAR',
    sub: 'Concesionario oficial de autos nuevos en Vega Alta. Garantizamos la estructura de financiamiento más agresiva de Puerto Rico. Unidades exclusivas, aprobaciones blindadas.',
  },
  {
    eyebrow: 'PROTOCOLO: APROBACIÓN',
    line1: 'TU CRÉDITO',
    line2: 'ESTÁ PROTEGIDO',
    accent: 'SIN PRONTO',
    sub: 'Nuestros especialistas ejecutan aprobaciones de alta velocidad incluso con desafíos crediticios. Transparencia Richard.',
  },
  {
    eyebrow: 'PROTOCOLO: TRADE-IN',
    line1: 'PAGAMOS EL',
    line2: 'MAX TOTAL',
    accent: 'INTERCAMBIO AHORA',
    sub: 'Valora tu activo en 90 segundos con nuestro motor de tasación inteligente. Sal montado en una unidad superior hoy.',
  },
];

const TICKER_ITEMS = [
  '⚡ ESTRUCTURAS DESDE 4.9% APR',
  '🎁 BONO DE $300 WEB ACTIVO',
  '🛡 SEGURIDAD CERTIFICADA',
  '🔁 VALORACIÓN EN 90S',
  '📍 HUB CENTRAL: BAYAMÓN, PR',
  '🤖 ASESOR VIRTUAL: ACTIVO',
  '✅ SIN TRUCOS, SIN COSTOS OCULTOS',
];

const HeroSection: React.FC<HeroSectionProps> = ({
  onNeuralMatch,
  onBrowseInventory,
  onSellCar,
}) => {
  const [isMobile, setIsMobile] = useState(true);
  const [idx, setIdx] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1024px)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);

    const iv = setInterval(() => {
      setIdx((p) => (p + 1) % HEADLINES.length);
    }, 8000);

    return () => {
      clearInterval(iv);
      mql.removeEventListener('change', handler);
    };
  }, []);

  // Ticker animation handled via CSS, not JS, to avoid forced reflow

  const h = HEADLINES[idx];

  return (
    <section className="relative min-h-[96vh] w-full overflow-hidden bg-slate-950 flex flex-col">
      {/* ── Cinematic Engine (Nivel 18) ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950 z-[1]" />

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-slate-950/80 to-slate-950 z-[2]" />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/20 to-transparent z-[2]" />

        {/* Ambient Holographic Layer */}
        <div className="absolute inset-0 mesh-bg-elite z-[3]" />

        {/* Neural Depth Layer */}
        <NeuralBackground className="z-[4]" count={isMobile ? 10 : 30} />

        {/* Premium Background Image Layer - Adds deep cinematic context */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity scale-105 transition-opacity duration-1000"
          style={{ backgroundImage: 'url("/images/hero-fallback.png")' }}
        />
      </div>

      {/* ── Tactical Content Grid ── */}
      <div
        className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-[1500px] mx-auto w-full px-6 lg:px-12 py-20 lg:py-0 hero-fade-in"
      >
        {/* Left: Intelligence & Branding */}
        <div className="flex-1 space-y-10 text-left invisible pointer-events-none select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-3xl shadow-[0_0_20px_rgba(0,229,255,0.1)]">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_#00e5ff]" />
              <span className="font-tech text-xs font-black uppercase tracking-[0.4em] text-white">
                RICHARD<span className="text-primary/70">.AUTO</span>
              </span>
            </div>
            <span className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {h.eyebrow}
            </span>
          </div>

          <div className="min-h-[300px] lg:min-h-[400px]">
              <div
                key={idx}
                className="flex flex-col gap-0 hero-fade-slide"
              >
                <h2 className="flex flex-col">
                  <span className="font-cinematic text-6xl md:text-8xl lg:text-[11rem] text-white leading-[0.8] tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    {h.line1}
                  </span>
                  <span className="font-cinematic text-6xl md:text-8xl lg:text-[11rem] text-white/40 leading-[0.8] tracking-tighter mix-blend-overlay">
                    {h.line2}
                  </span>
                  <span className="font-cinematic text-6xl md:text-8xl lg:text-[11rem] text-transparent bg-clip-text bg-linear-to-r from-white via-primary to-cyan-400 leading-[0.8] tracking-tighter select-none drop-shadow-[0_0_40px_rgba(0,229,255,0.3)] animate-tech-glitch">
                    {h.accent}
                  </span>
                </h2>
              </div>
          </div>

          <p
            key={`sub-${idx}`}
            className="text-sm md:text-lg text-slate-400 max-w-xl leading-relaxed font-medium transition-all hero-fade-in"
          >
            {h.sub}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {[
              { icon: <Shield size={14} />, label: 'Certificado' },
              { icon: <Clock size={14} />, label: 'Aprobación Rápida' },
              { icon: <Zap size={14} />, label: 'Mismo Día' },
            ].map((p, i) => (
              <span
                key={i}
                className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-cyan-500/20 hover:text-slate-300"
              >
                {p.icon} {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Command Panel CTAs (lazy-loaded to defer framer-motion) */}
        <Suspense
          fallback={
            <div className="w-full lg:w-[460px] min-h-[400px] rounded-2xl bg-slate-900/30 animate-pulse" />
          }
        >
          <div className="w-full lg:w-[460px]">
            <HeroCTAPanel
              onBrowseInventory={onBrowseInventory}
              onNeuralMatch={onNeuralMatch}
              onSellCar={onSellCar}
            />
          </div>
        </Suspense>
      </div>

      {/* ── Global Ticker Protocol (CSS animation, no forced reflow) ── */}
      <div className="relative z-20 border-t border-white/5 bg-slate-950/80 backdrop-blur-lg py-4 mt-auto overflow-hidden">
        <div className="flex whitespace-nowrap ticker-scroll" ref={tickerRef}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="mx-8 font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-cyan-400 transition-colors cursor-default"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-scroll {
          animation: tickerLoop 40s linear infinite;
        }
        @keyframes tickerLoop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .mesh-bg-elite {
          background: linear-gradient(-45deg, #00e5ff22, #7000ff22, #ff007011, #00ffaa11);
          background-size: 400% 400%;
          animation: meshGradient 20s ease infinite;
          opacity: 0.3;
          filter: blur(100px);
        }
        @keyframes meshGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-fade-in {
          opacity: 1;
        }
        .hero-fade-slide {
          opacity: 1;
          transform: translateX(0);
        }
        .hero-fade-right {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
