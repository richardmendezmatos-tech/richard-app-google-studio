"use client";

import React, { useRef } from 'react';
import { ShieldCheck, Zap, Globe, BadgeCheck, Sparkles, Activity } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const TrustBar: React.FC = () => {
  return (
    <section id="trust-protocol" className="relative py-24 overflow-hidden bg-slate-950/20">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="container relative mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-cyan-500/50" />
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-cyan-400 animate-pulse" />
                <h2 className="font-tech text-[10px] uppercase tracking-[0.5em] text-cyan-400">
                  SENTINEL TRUST ENGINE V2
                </h2>
              </div>
            </div>
            <p className="font-cinematic text-4xl md:text-6xl text-white tracking-tight leading-[0.9]">
              Protección de <span className="text-cyan-400">Alto Nivel.</span> <br />
              <span className="text-slate-500 italic">Garantía Richard Automotive.</span>
            </p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex group"
          >
            <div className="relative overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/5 px-6 py-3 backdrop-blur-3xl transition-all hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                <BadgeCheck size={16} className="text-emerald-500" />
                Verified Richard Elite Dealer
              </span>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <TrustItem
            icon={<ShieldCheck size={32} />}
            title="PROTOCOL 150+"
            desc="Certificación neurálgica masiva. Cada unidad es auditada bajo los estándares de Richard para una confiabilidad total."
            color="cyan"
            delay={0.1}
          />
          <TrustItem
            icon={<Zap size={32} />}
            title="MISSION: DELIVERY"
            desc="Manejamos la logística con guante blanco. Entrega en 24h a cualquier punto de la isla con precisión Sentinel."
            color="primary"
            delay={0.2}
          />
          <TrustItem
            icon={<Sparkles size={32} />}
            title="RICHARD GUARANTEE"
            desc="72 horas de prueba real. Si no sientes que es el auto de tus sueños, ejecutamos el retorno sin fricciones."
            color="emerald"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};

interface TrustItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'cyan' | 'primary' | 'emerald';
  delay: number;
}

const TrustItem: React.FC<TrustItemProps> = ({ icon, title, desc, color, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const { left, top } = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const colors = {
    cyan: 'text-cyan-400 group-hover:text-cyan-300',
    primary: 'text-primary group-hover:text-cyan-200',
    emerald: 'text-emerald-400 group-hover:text-emerald-300',
  };

  const glowStyles = {
    cyan: 'rgba(34, 211, 238, 0.1)',
    primary: 'rgba(0, 174, 217, 0.1)',
    emerald: 'rgba(52, 211, 153, 0.1)',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full rounded-[40px] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-slate-900/70 shadow-2xl"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[40px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, ${glowStyles[color]}, transparent 70%)`
          ),
        }}
      />

      <div className="relative z-10">
        <div className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${colors[color]}`}>
          {icon}
        </div>
        
        <h4 className="mb-4 font-tech text-base font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
          {title}
          <div className="h-1 w-1 bg-cyan-500 rounded-full animate-pulse" />
        </h4>
        
        <p className="text-sm font-medium leading-relaxed text-slate-500 group-hover:text-slate-300 transition-colors">
          {desc}
        </p>

        <div className="mt-8 flex items-center gap-2 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
          <Activity size={10} className="text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400">Verificado Richard</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrustBar;
