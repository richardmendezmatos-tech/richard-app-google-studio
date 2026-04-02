"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { ArrowRight, BrainCircuit, DollarSign, Zap, Shield, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { trackInterestIndex } from '@/shared/api/metrics/analytics';

interface HeroSectionProps {
  onNeuralMatch: () => void;
  onBrowseInventory: () => void;
  onSellCar: () => void;
}

const HEADLINES = [
  {
    eyebrow: 'PROTOCOL: DOMINANCE',
    line1: 'EL AUTO DE',
    line2: 'TUS SUEÑOS',
    accent: 'READY TO LAUNCH',
    sub: 'Garantizamos la estructura de financiamiento más agresiva de Puerto Rico. Unidades exclusivas, aprobaciones blindadas.',
  },
  {
    eyebrow: 'PROTOCOL: APPROVAL',
    line1: 'TU CRÉDITO',
    line2: 'ESTÁ PROTEGIDO',
    accent: 'ZERO DOWN',
    sub: 'Nuestros especialistas ejecutan aprobaciones de alta velocidad incluso con desafíos crediticios. Transparencia Richard.',
  },
  {
    eyebrow: 'PROTOCOL: TRADE-IN',
    line1: 'PAGAMOS EL',
    line2: 'MAX TOTAL',
    accent: 'EXCHANGE NOW',
    sub: 'Valora tu activo en 90 segundos con nuestro motor de tasación neural. Sal montado en una unidad superior hoy.',
  },
];

const TICKER_ITEMS = [
  '⚡ ESTRUCTURAS DESDE 4.9% APR',
  '🛡 SEGURIDAD SENTINEL CERTIFICADA',
  '🔁 VALORACIÓN NEURAL EN 90S',
  '📍 HUB CENTRAL: BAYAMÓN, PR',
  '🤖 RICHARD AI ADVISOR: ONLINE',
  '✅ SIN TRUCOS, SIN COSTOS OCULTOS',
];

const HeroSection: React.FC<HeroSectionProps> = ({
  onNeuralMatch,
  onBrowseInventory,
  onSellCar,
}) => {
  const [idx, setIdx] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setIdx((p) => (p + 1) % HEADLINES.length);
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    let pos = 0;
    const speed = 0.5;
    const step = () => {
      if (tickerRef.current) {
        const w = tickerRef.current.scrollWidth / 2;
        pos -= speed;
        if (pos <= -w) pos = 0;
        tickerRef.current.style.transform = `translateX(${pos}px)`;
      }
      animFrameRef.current = requestAnimationFrame(step);
    };
    animFrameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const h = HEADLINES[idx];

  return (
    <section className="relative min-h-[95vh] w-full overflow-hidden bg-slate-950 flex flex-col">
      {/* ── Cinematic Background Engine ── */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="https://images.unsplash.com/photo-1672278374378-8ef184d2e685?q=80&w=2400&auto=format&fit=crop"
          alt="Richard Automotive Universe"
          className="h-full w-full object-cover object-[center_35%] opacity-25 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Ambient Tech Elements */}
        <div className="absolute inset-0 mesh-bg-elite z-[1]" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
        <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
      </div>

      {/* ── Tactical Content Grid ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 max-w-[1500px] mx-auto w-full px-6 lg:px-12 py-20 lg:py-0">
        
        {/* Left: Intelligence & Branding */}
        <div className="flex-1 space-y-8 text-left">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
              <span className="font-tech text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                SENTINEL HUB ACTIVE
              </span>
            </div>
            <span className="font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {h.eyebrow}
            </span>
          </motion.div>

          <div className="min-h-[300px] lg:min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, skewY: 3 }}
                animate={{ opacity: 1, y: 0, skewY: 0 }}
                exit={{ opacity: 0, y: -40, skewY: -3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-0"
              >
                <h1 className="flex flex-col">
                  <span className="font-cinematic text-5xl md:text-7xl lg:text-9xl text-white leading-[0.85]">{h.line1}</span>
                  <span className="font-cinematic text-5xl md:text-7xl lg:text-9xl text-white opacity-80 leading-[0.85]">{h.line2}</span>
                  <span className="font-cinematic text-5xl md:text-7xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary leading-[0.85] drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                    {h.accent}
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.p 
            key={`sub-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm md:text-lg text-slate-400 max-w-xl leading-relaxed font-medium transition-all"
          >
            {h.sub}
          </motion.p>

          <div className="flex flex-wrap gap-4 pt-4">
            {[
              { icon: <Shield size={14} />, label: "Certified" },
              { icon: <Clock size={14} />, label: "Express Approval" },
              { icon: <Zap size={14} />, label: "Same Day" }
            ].map((p, i) => (
              <span key={i} className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-cyan-500/20 hover:text-slate-300">
                {p.icon} {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Command Panel CTAs */}
        <div className="w-full lg:w-[450px] space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-premium p-8 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <Sparkles className="text-cyan-400/20 animate-pulse" size={40} />
            </div>

            <div className="space-y-2">
              <p className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                DIRECT ACTION HUB
              </p>
              <div className="h-1 w-12 bg-cyan-500/30 rounded-full" />
            </div>

            <div className="space-y-3">
              <HeroCTA 
                label="EXPLORAR INVENTARIO" 
                tag="UNIT DATABASE" 
                icon={<ArrowRight size={20} />} 
                variant="primary" 
                onClick={onBrowseInventory}
              />
              <HeroCTA 
                label="NEURAL MATCH" 
                tag="AI DISCOVERY" 
                icon={<BrainCircuit size={20} />} 
                variant="secondary" 
                onClick={onNeuralMatch}
              />
              <HeroCTA 
                label="COTIZAR MI AUTO" 
                tag="TRADE-IN EVAL" 
                icon={<DollarSign size={20} />} 
                variant="tertiary" 
                onClick={onSellCar}
              />
            </div>

            {/* Micro Dashboard */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/5">
              {[
                { val: "500+", lbl: "Families" },
                { val: "4.9%", lbl: "APR" },
                { val: "24/7", lbl: "Support" }
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-tech text-lg font-black text-white">{s.val}</div>
                  <div className="font-tech text-[8px] uppercase tracking-widest text-slate-500">{s.lbl}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Global Ticker Protocol ── */}
      <div className="relative z-20 border-t border-white/5 bg-slate-950/80 backdrop-blur-lg py-4">
        <div className="flex overflow-hidden whitespace-nowrap" ref={tickerRef}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 font-tech text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-cyan-400 transition-colors cursor-default">
              {item}
            </span>
          ))}
        </div>
      </div>

      <style>{`
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
      `}</style>
    </section>
  );
};

const HeroCTA = ({ label, tag, icon, variant, onClick }: any) => {
  const styles: any = {
    primary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_10px_30px_-5px_rgba(0,229,255,0.4)]",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    tertiary: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
  };

  return (
    <button 
      onClick={onClick}
      className={`group w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 transform active:scale-95 ${styles[variant]}`}
    >
      <div className="flex flex-col items-start text-left">
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 opacity-60 ${variant === 'primary' ? 'text-slate-900' : ''}`}>
          {tag}
        </span>
        <span className="font-cinematic text-xl tracking-wider leading-none">
          {label}
        </span>
      </div>
      <div className={`p-2 rounded-xl transition-transform group-hover:translate-x-1 ${variant === 'primary' ? 'bg-slate-950/10' : 'bg-white/5'}`}>
        {icon}
      </div>
    </button>
  );
};

export default HeroSection;
