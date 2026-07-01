'use client';

import React, { useState, useEffect } from 'react';
import { Car } from '@/entities/inventory';
import { Sliders, Flame, Brain, Timer, ChevronRight } from 'lucide-react';
import { BudgetTab } from './discovery/BudgetTab';
import { SwipeTab } from './discovery/SwipeTab';
import { NeuralMatchTab } from './discovery/NeuralMatchTab';
import { ExpressOfferModal } from './discovery/ExpressOfferModal';

interface SentinelDiscoverySuiteProps {
  inventory: Car[];
}

const SentinelDiscoverySuite: React.FC<SentinelDiscoverySuiteProps> = ({ inventory }) => {
  const [activeTab, setActiveTab] = useState<'budget' | 'swipe' | 'neural'>('budget');
  const [isExpressModalOpen, setIsExpressModalOpen] = useState<boolean>(false);

  // --- Temporizador Activo de 24 Horas (Bono de Acción Rápida) ---
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return 24 * 3600 - 15 * 60; // Empezamos en 23h 45m para que luzca ultra dinámico en vivo
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  if (!inventory || inventory.length === 0) return null;

  return (
    <div className="w-full rounded-4xl border border-white/10 bg-linear-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden mb-12">
      {/* Resplandor de fondo dinámico */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera & Selector de Pestañas */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-tech uppercase tracking-[0.2em] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              ⚡ Suite de Descubrimiento v24
            </span>
            <span className="text-[10px] text-slate-500 font-tech">| INTELIGENCIA INTERACTIVA</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Descubre tu{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 font-cinematic">
              Unidad Compatible
            </span>
          </h2>
        </div>

        {/* Pestañas estilo Glassmorphism */}
        <div className="flex bg-slate-950/80 p-1 rounded-full border border-white/10 w-full md:w-auto grid grid-cols-3 md:flex gap-1">
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'budget'
                ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders size={14} /> <span className="hidden sm:inline">Presupuesto</span>
            <span className="sm:hidden">$$</span>
          </button>
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'swipe'
                ? 'bg-linear-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame size={14} /> <span className="hidden sm:inline">Swipe Rápido</span>
            <span className="sm:hidden">Swipe</span>
          </button>
          <button
            onClick={() => setActiveTab('neural')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'neural'
                ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain size={14} /> <span className="hidden sm:inline">Match Ideal</span>
            <span className="sm:hidden">Match</span>
          </button>
        </div>
      </div>

      {/* Cintillo de Oferta de 24 Horas (Bono de Acción Rápida) */}
      <div
        onClick={() => setIsExpressModalOpen(true)}
        className="group relative z-10 mb-8 rounded-2xl border-2 border-amber-500/40 bg-linear-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 p-4 md:p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden cursor-pointer transition-all duration-300 hover:border-amber-400 hover:scale-[1.01]"
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse" />
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 text-center xl:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
              <Timer size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center xl:justify-start">
                <span className="text-[10px] font-tech font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded">
                  AHORRO DE $300.00
                </span>
                <span className="text-[10px] text-slate-400 font-tech">| OFERTA ESPECIAL</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                Regístrate y compra en <span className="text-amber-400 font-black">24 Horas</span> y
                te cubrimos{' '}
                <span className="underline decoration-amber-500 decoration-2">
                  Tablilla, Marbete y Registro
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Temporizador Activo */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="text-center">
                <span className="font-cinematic text-base font-black text-white">{hours}</span>
                <span className="block text-[7px] font-tech text-slate-500 uppercase">Horas</span>
              </div>
              <span className="font-cinematic text-base font-black text-amber-500 animate-pulse">
                :
              </span>
              <div className="text-center">
                <span className="font-cinematic text-base font-black text-white">{minutes}</span>
                <span className="block text-[7px] font-tech text-slate-500 uppercase">Mins</span>
              </div>
              <span className="font-cinematic text-base font-black text-amber-500 animate-pulse">
                :
              </span>
              <div className="text-center">
                <span className="font-cinematic text-base font-black text-rose-400">{seconds}</span>
                <span className="block text-[7px] font-tech text-slate-500 uppercase">Segs</span>
              </div>
            </div>

            {/* CTA Secundario Embebido */}
            <span className="flex items-center gap-1 bg-linear-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs px-3 py-2 rounded-xl uppercase tracking-wider group-hover:shadow-lg group-hover:shadow-amber-500/25 transition-all">
              Reclamar{' '}
              <ChevronRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </div>
        </div>
      </div>


      {/* --- PESTAÑA 1: PRESUPUESTO INTELIGENTE --- */}
      {activeTab === 'budget' && <BudgetTab inventory={inventory} />}

      {/* --- PESTAÑA 2: SWIPE RÁPIDO (TINDER MODE) --- */}
      {activeTab === 'swipe' && <SwipeTab inventory={inventory} />}

      {/* --- PESTAÑA 3: NEURAL MATCH (AI SEARCH) --- */}
      {activeTab === 'neural' && <NeuralMatchTab inventory={inventory} />}

      {/* Modal Express de Pre-cualificación en Capa Flotante (Glassmorphism Overlay) */}
      <ExpressOfferModal isOpen={isExpressModalOpen} onClose={() => setIsExpressModalOpen(false)} />
    </div>
  );
};

export default SentinelDiscoverySuite;
