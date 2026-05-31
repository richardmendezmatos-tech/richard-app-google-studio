'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  SlidersHorizontal,
  Flame,
  Sparkles,
  Heart,
  X,
  Star,
  RefreshCw,
  Zap,
  Check,
  ShieldCheck,
  Loader2,
  Car as CarIcon,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { useDealMatcherStore, MatchCar, LifestyleType } from '../model/dealMatcherStore';
import { leadService } from '@/entities/lead';

export const DealMatcherWidget: React.FC = () => {
  const {
    filters,
    filteredCars,
    activeCar,
    currentIndex,
    likedList,
    superMatchedList,
    updateFilters,
    swipeRight,
    swipeLeft,
    superMatch,
    restartDeck,
  } = useDealMatcherStore();

  const [showFilters, setShowFilters] = useState(false);
  const [qualifyCar, setQualifyCar] = useState<MatchCar | null>(null);
  
  // Lead form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Swipe gesture motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform drag distance into card rotation and color overlay triggers
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacityLeft = useTransform(x, [-150, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 150], [0, 1]);
  const opacitySuper = useTransform(y, [-150, 0], [1, 0]);

  // Ref to count remaining cards
  const cardsRemaining = filteredCars.length - currentIndex;

  const handleDragEnd = (_event: any, info: any) => {
    if (!activeCar) return;
    const swipeThreshold = 140;

    if (info.offset.x > swipeThreshold) {
      // Swipe Right - Like
      swipeRight(activeCar);
      x.set(0);
      y.set(0);
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe Left - Dislike
      swipeLeft(activeCar);
      x.set(0);
      y.set(0);
    } else if (info.offset.y < -swipeThreshold) {
      // Swipe Up - Super Match
      superMatch(activeCar);
      setQualifyCar(activeCar); // Open pre-qualify flow immediately for high-intent super matches!
      x.set(0);
      y.set(0);
    } else {
      // Reset card position if drag threshold was not met
      x.set(0);
      y.set(0);
    }
  };

  const triggerSwipeRight = useCallback(() => {
    if (!activeCar) return;
    swipeRight(activeCar);
  }, [activeCar, swipeRight]);

  const triggerSwipeLeft = useCallback(() => {
    if (!activeCar) return;
    swipeLeft(activeCar);
  }, [activeCar, swipeLeft]);

  const triggerSuperMatch = useCallback(() => {
    if (!activeCar) return;
    superMatch(activeCar);
    setQualifyCar(activeCar);
  }, [activeCar, superMatch]);

  // Format phone numbers dynamically for Puerto Rico standard (787) 555-1234
  const formatPuertoRicoPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const truncated = digits.slice(0, 10);
    
    if (truncated.length === 0) return '';
    if (truncated.length <= 3) return `(${truncated}`;
    if (truncated.length <= 6) return `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
    return `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`;
  };

  // Keyboard shortcuts for swiping and resetting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable shortcuts when interactive fields in modal are active
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (!activeCar) {
        if (e.key === ' ' || e.key.toLowerCase() === 'r') {
          e.preventDefault();
          restartDeck();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          triggerSwipeLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          triggerSwipeRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          triggerSuperMatch();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          restartDeck();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCar, triggerSwipeLeft, triggerSwipeRight, triggerSuperMatch, restartDeck]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qualifyCar) return;

    setSubmitting(true);
    try {
      await leadService.saveLead({
        firstName: name.split(' ')[0] || 'Cliente',
        lastName: name.split(' ').slice(1).join(' ') || 'VIP',
        phone,
        email,
        vehicleOfInterest: qualifyCar.name,
        type: 'finance',
        status: 'new',
        aiAnalysis: {
          score: qualifyCar.matchScore,
          category: 'deal_matcher_gamified_match',
          insights: [
            `Match Automotriz v3`,
            `Auto Seleccionado: ${qualifyCar.name}`,
            `Match Score del Matcher: ${qualifyCar.matchScore}%`,
            `Cuota Estimada: $${qualifyCar.monthlyPayment}/mes`,
            `Pronto de Excelencia: $${filters.downPayment}`,
            `Estilo Seleccionado: ${filters.lifestyle}`,
          ],
          nextAction: 'Llamar de inmediato para cotización formal en Central Ford',
          reasoning: 'Usuario interactuó con la interfaz de Tinder Swiper mostrando altísimo interés.',
          unidad_interes: qualifyCar.name,
        },
        closureProbability: qualifyCar.matchScore,
      });

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting Deal-Matcher lead:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const closePreQualModal = () => {
    setQualifyCar(null);
    setSuccess(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  const lifestyleLabels: Record<LifestyleType, string> = {
    all: '🔍 Todos',
    chinchorreo: '🏔️ Chinchorreo Off-Road',
    daily: '💼 Daily Ejecutivo',
    familiar: '🚐 Guagua de Show / Familiar',
    ahorro: '⚡ Ahorro de Gasolina',
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto p-4 md:p-8 select-none">
      
      {/* Background Decor Lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Header HUD */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative z-20">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Sentinel <span className="text-cyan-400">Deal-Matcher</span>
            </h2>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
              Match! AI
            </span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black mt-2">
            Desliza. Conecta. Monta tu Guagua de Show
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-6 py-4 rounded-full border text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              showFilters
                ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={14} className="animate-spin-slow" />
            <span>Ajustar Filtros HUD</span>
          </button>
          
          <button
            onClick={restartDeck}
            className="flex items-center gap-3 px-6 py-4 rounded-full bg-white/[0.03] border border-white/5 hover:bg-white/10 text-white/60 text-xs font-black uppercase tracking-wider transition-all"
          >
            <RefreshCw size={14} />
            <span>Recargar Mazo</span>
          </button>
        </div>
      </div>

      {/* Interactive Filters Grid */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-10 relative z-20"
          >
            <div className="p-8 rounded-4xl bg-slate-950/60 border border-white/5 backdrop-blur-3xl space-y-8 shadow-[0_32px_64px_-20px_rgba(0,0,0,0.8)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cuota Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                      Cuota Mensual Máxima
                    </span>
                    <span className="text-lg font-black text-cyan-400 italic">
                      ${filters.maxMonthlyBudget} / mes
                    </span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={1800}
                    step={50}
                    value={filters.maxMonthlyBudget}
                    onChange={(e) => updateFilters({ maxMonthlyBudget: Number(e.target.value) })}
                    className="ra-range-premium w-full"
                  />
                  <div className="flex justify-between text-[9px] text-white/30 font-bold tracking-widest uppercase">
                    <span>$300</span>
                    <span>$1,000 (Promedio)</span>
                    <span>$1,800+</span>
                  </div>
                </div>

                {/* Pronto Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white/60 uppercase tracking-widest">
                      Pronto de Excelencia
                    </span>
                    <span className="text-lg font-black text-emerald-400 italic">
                      ${filters.downPayment.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15000}
                    step={500}
                    value={filters.downPayment}
                    onChange={(e) => updateFilters({ downPayment: Number(e.target.value) })}
                    className="ra-range-premium accent-emerald-500 w-full"
                  />
                  <div className="flex justify-between text-[9px] text-white/30 font-bold tracking-widest uppercase">
                    <span>$0 (Sin Pronto)</span>
                    <span>$7,500</span>
                    <span>$15,000+</span>
                  </div>
                </div>
              </div>

              {/* Lifestyle Badges */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <span className="text-xs font-black text-white/60 uppercase tracking-widest block mb-2">
                  ¿Para qué quieres tu máquina? (Estilo de Vida)
                </span>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(lifestyleLabels) as LifestyleType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateFilters({ lifestyle: type })}
                      className={`px-5 py-3 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                        filters.lifestyle === type
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {lifestyleLabels[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core Cards Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10 min-h-[560px]">
        
        {/* Left Stats Info Panel */}
        <div className="lg:col-span-1 bg-slate-950/40 border border-white/5 rounded-4xl p-8 backdrop-blur-xl space-y-8 hidden lg:block h-full min-h-[500px]">
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Compass className="text-cyan-400" size={18} />
              <span>Tu Historial VIP</span>
            </h3>
            <p className="text-[10px] text-white/30 leading-relaxed font-bold uppercase tracking-wider">
              Las unidades que marques con Like o Super Match se guardan aquí para tu pre-cualificación.
            </p>
          </div>

          {/* Likes List */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.35em] block">
              💚 Guardadas ({likedList.length})
            </span>
            {likedList.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-white/5 text-center text-[10px] text-white/20 uppercase tracking-widest font-black">
                Sin Unidades
              </div>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                {likedList.map((car, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-black text-white/80 uppercase truncate max-w-[140px]">{car.name}</span>
                    <span className="text-[10px] font-black text-emerald-400">${car.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Super Match Lists */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.35em] block">
              ⚡ Super Matches ({superMatchedList.length})
            </span>
            {superMatchedList.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-white/5 text-center text-[10px] text-white/20 uppercase tracking-widest font-black">
                Sin Super Matches
              </div>
            ) : (
              <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-2">
                {superMatchedList.map((car, index) => (
                  <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-xs font-black text-white uppercase truncate max-w-[140px]">{car.name}</span>
                    <button
                      onClick={() => setQualifyCar(car)}
                      className="px-2.5 py-1 bg-cyan-500 text-black font-black text-[9px] uppercase tracking-widest rounded-md hover:bg-white transition-colors"
                    >
                      Pre-Qual
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Deck Card Swiper */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center relative min-h-[500px]">
          
          <AnimatePresence>
            {activeCar ? (
              <div className="relative w-full max-w-[420px] h-[520px] flex items-center justify-center">
                
                {/* Underneath Card Decor (creates stacked deck depth) */}
                {cardsRemaining > 1 && (
                  <div className="absolute w-[92%] h-[480px] bg-slate-950/80 border border-white/[0.03] rounded-5xl translate-y-6 scale-[0.95] z-0 blur-[2px]" />
                )}
                {cardsRemaining > 2 && (
                  <div className="absolute w-[84%] h-[480px] bg-slate-950/90 border border-white/[0.01] rounded-5xl translate-y-12 scale-[0.9] -z-10 blur-[4px]" />
                )}

                {/* Primary Swipeable Card */}
                <motion.div
                  style={{ x, y, rotate }}
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="absolute w-full h-[500px] bg-slate-950/40 border border-white/5 rounded-5xl shadow-[0_48px_96px_-24px_rgba(0,0,0,0.8)] backdrop-blur-3xl p-5 overflow-hidden flex flex-col justify-between group/card cursor-grab z-10"
                >
                  
                  {/* Glowing Overlay Triggers */}
                  <motion.div
                    style={{ opacity: opacityLeft }}
                    className="absolute inset-0 bg-red-500/10 border-4 border-red-500/30 rounded-5xl flex items-center justify-center pointer-events-none z-30"
                  >
                    <div className="px-6 py-3 border-4 border-red-500 rounded-2xl text-red-500 font-black text-2xl uppercase tracking-widest rotate-[-12deg]">
                      ¡Pasar!
                    </div>
                  </motion.div>

                  <motion.div
                    style={{ opacity: opacityRight }}
                    className="absolute inset-0 bg-emerald-500/10 border-4 border-emerald-500/30 rounded-5xl flex items-center justify-center pointer-events-none z-30"
                  >
                    <div className="px-6 py-3 border-4 border-emerald-500 rounded-2xl text-emerald-500 font-black text-2xl uppercase tracking-widest rotate-[12deg]">
                      ¡Me Gusta!
                    </div>
                  </motion.div>

                  <motion.div
                    style={{ opacity: opacitySuper }}
                    className="absolute inset-0 bg-cyan-500/10 border-4 border-cyan-500/30 rounded-5xl flex items-center justify-center pointer-events-none z-30"
                  >
                    <div className="px-6 py-3 border-4 border-cyan-500 rounded-2xl text-cyan-500 font-black text-2xl uppercase tracking-widest rotate-0">
                      ⚡ Super Match
                    </div>
                  </motion.div>

                  {/* Top Stats HUD Overlay inside Card */}
                  <div className="relative rounded-4xl overflow-hidden aspect-video group/img">
                    <Image
                      src={activeCar.image || activeCar.img || ''}
                      alt={activeCar.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority
                      className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/10 to-transparent z-10" />
                    
                    {/* Badge Overlay */}
                    {activeCar.badge && (
                      <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest z-20">
                        {activeCar.badge}
                      </span>
                    )}

                    {/* Match Score Indicator (Neural Circle) with dynamic premium neon glow pulse animations */}
                    <div className={`absolute top-4 right-4 flex items-center justify-center w-14 h-14 bg-black/80 rounded-full shadow-lg backdrop-blur-md transition-all duration-500 z-20 border ${
                      activeCar.matchScore >= 90
                        ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse'
                        : activeCar.matchScore >= 75
                        ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                        : 'border-white/15'
                    }`}>
                      <div className="text-center">
                        <span className={`text-[16px] font-black leading-none italic ${
                          activeCar.matchScore >= 90 ? 'text-cyan-300' : activeCar.matchScore >= 75 ? 'text-emerald-300' : 'text-white'
                        }`}>
                          {activeCar.matchScore}%
                        </span>
                        <span className="text-[7px] text-white/50 block font-black uppercase tracking-wider mt-0.5">
                          Match
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Basic Specs Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end z-20">
                      <div>
                        <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-300 text-[8px] font-black uppercase tracking-widest rounded">
                          {activeCar.type}
                        </span>
                        <h4 className="text-white font-black text-lg tracking-tighter mt-1">
                          {activeCar.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/40 uppercase font-black tracking-wider">
                          Precio Cash
                        </p>
                        <p className="text-sm font-black text-white tracking-tight">
                          ${activeCar.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Central Dialect Hook & Detail Segment */}
                  <div className="py-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl relative">
                      <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-slate-950 border border-white/5 rounded text-[7px] font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                        <Zap size={6} />
                        <span>Sentinel Hook</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-bold tracking-wide italic">
                        "{activeCar.lifestyleHook}"
                      </p>
                    </div>

                    {/* Computed Financial Projection Row */}
                    <div className="grid grid-cols-2 gap-4 items-center p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
                      <div>
                        <span className="text-[8px] text-white/30 uppercase font-black tracking-widest block">
                          Pronto
                        </span>
                        <span className="text-xs font-black text-emerald-400">
                          ${filters.downPayment.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-white/30 uppercase font-black tracking-widest block">
                          Inversión Estimada
                        </span>
                        <span className="text-sm font-black text-white italic tracking-tighter">
                          ${activeCar.monthlyPayment} <span className="text-[9px] text-cyan-400">/mes*</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Drag Tips in Puerto Rican dialect */}
                  <div className="text-center pt-2 border-t border-white/5 flex justify-between text-[8px] text-white/20 uppercase font-black tracking-widest">
                    <span>← Pasar</span>
                    <span className="text-cyan-400 animate-pulse">↑ Super Match</span>
                    <span>Guardar →</span>
                  </div>

                </motion.div>
              </div>
            ) : (
              /* Out of Cards State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[400px] bg-slate-950/40 border border-white/5 rounded-5xl p-10 text-center space-y-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
              >
                {/* Rainbow Neural Sweep Background */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
                
                <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto relative">
                  <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-10 animate-pulse"></div>
                  <Flame className="w-10 h-10 text-cyan-400" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                    ¡Fin del Mazo VIP!
                  </h3>
                  <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-wider max-w-xs mx-auto">
                    Ya evaluaste todas las máquinas que coinciden con tus filtros. Amplía tu presupuesto o pronto para ver más opciones de show.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => updateFilters({ maxMonthlyBudget: filters.maxMonthlyBudget + 200 })}
                    className="w-full py-4 bg-cyan-500 text-black hover:bg-white transition-colors rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                  >
                    <SlidersHorizontal size={12} />
                    <span>Expandir Cuota (+$200)</span>
                  </button>
                  <button
                    onClick={restartDeck}
                    className="w-full py-4 border border-white/10 hover:bg-white/5 transition-all rounded-full font-black text-[10px] text-white/60 uppercase tracking-[0.2em]"
                  >
                    Empezar de Nuevo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cockpit HUD Floating Control Console */}
          {activeCar && (
            <div className="flex items-center gap-6 mt-8 relative z-20">
              {/* Swipe Left Button */}
              <button
                onClick={triggerSwipeLeft}
                className="w-14 h-14 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-black hover:border-red-400 text-red-500 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group/btn"
                title="Descartar"
              >
                <X size={20} className="transition-transform group-hover/btn:rotate-90 duration-300" />
              </button>

              {/* Swipe Up / Super Match Button */}
              <button
                onClick={triggerSuperMatch}
                className="w-18 h-18 bg-cyan-500/20 border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black text-cyan-300 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-110 active:scale-95 group/btn"
                title="Super Match - Pre-cualificar"
              >
                <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 rounded-full animate-ping pointer-events-none"></div>
                <Star size={24} className="animate-spin-slow text-cyan-400 group-hover/btn:text-black" fill="currentColor" />
              </button>

              {/* Swipe Right Button */}
              <button
                onClick={triggerSwipeRight}
                className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 group/btn"
                title="Me Gusta"
              >
                <Heart size={20} className="transition-transform group-hover/btn:scale-125 duration-300" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* High-Converting Pre-qualification Lead Modal */}
      <AnimatePresence>
        {qualifyCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreQualModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-950/80 border border-white/10 rounded-5xl shadow-[0_50px_100px_rgba(0,0,0,0.9)] backdrop-blur-3xl overflow-hidden p-8 md:p-10 z-10"
            >
              {/* Modal Glowing Corner Decor */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

              <div className="relative z-10">
                {!success ? (
                  /* Lead Capture Form */
                  <form onSubmit={handleLeadSubmit} className="space-y-6">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-5">
                      <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">
                          ¡Pre-cualificación VIP!
                        </h4>
                        <p className="text-[9px] text-white/40 uppercase tracking-widest font-black">
                          Sentinel Secure Encryption Protocol v3.1
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-4 items-center">
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={qualifyCar.image || qualifyCar.img || ''}
                          alt={qualifyCar.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[8px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 font-black uppercase tracking-wider rounded">
                          {qualifyCar.type}
                        </span>
                        <p className="text-white font-black text-sm uppercase tracking-tight mt-1">{qualifyCar.name}</p>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                          Cuota Estimada: ${qualifyCar.monthlyPayment}/mes*
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] ml-2">
                          Nombre Completo
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Ej. Richard Mendez"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-14 bg-white/[0.03] border border-white/5 focus:border-cyan-400/50 rounded-2xl px-6 text-xs font-black text-white outline-none transition-all placeholder:text-white/5"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] ml-2">
                          WhatsApp VIP (Requerido)
                        </label>
                        <input
                          required
                          type="tel"
                          placeholder="(787) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(formatPuertoRicoPhone(e.target.value))}
                          className="w-full h-14 bg-white/[0.03] border border-white/5 focus:border-cyan-400/50 rounded-2xl px-6 text-xs font-black text-white outline-none transition-all placeholder:text-white/5"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.25em] ml-2">
                          Email Corporativo
                        </label>
                        <input
                          required
                          type="email"
                          placeholder="richard@automotive.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-14 bg-white/[0.03] border border-white/5 focus:border-cyan-400/50 rounded-2xl px-6 text-xs font-black text-white outline-none transition-all placeholder:text-white/5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                      <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase tracking-wide">
                        Al enviar, nuestro robot AI procesará tu pronto de <strong className="text-cyan-300">${filters.downPayment.toLocaleString()}</strong> y cuota de forma segura sin impacto crediticio inmediato.
                      </p>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        type="button"
                        onClick={closePreQualModal}
                        className="px-6 py-4 rounded-full border border-white/10 text-white/30 hover:bg-white/5 hover:text-white transition-all font-black text-[10px] uppercase tracking-wider"
                      >
                        Regresar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-4 bg-cyan-500 text-black hover:bg-white transition-all rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-3 shadow-[0_15px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)]"
                      >
                        {submitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <span>Enviar Solicitud</span>
                            <Zap size={12} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Success Screen */
                  <div className="text-center py-8 space-y-8">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto relative">
                      <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-10 rounded-full animate-pulse"></div>
                      <Check className="w-10 h-10 text-emerald-400" />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                        ¡Pre-cualificado!
                      </h3>
                      <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-wider max-w-sm mx-auto">
                        Felicidades, {name.split(' ')[0]}. Tu solicitud para la guagua <strong className="text-cyan-300">{qualifyCar.name}</strong> ha sido pre-calificada por la IA.
                      </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl inline-flex flex-col items-center">
                      <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">
                        Cuota AI Asignada
                      </span>
                      <span className="text-3xl font-black text-emerald-400 mt-1 italic">
                        ${qualifyCar.monthlyPayment} / mes*
                      </span>
                    </div>

                    <p className="text-[10px] text-cyan-400 leading-relaxed font-black uppercase tracking-widest max-w-xs mx-auto animate-pulse">
                      Jules y el equipo VIP de Richard Automotive se comunicarán contigo vía WhatsApp VIP a la brevedad.
                    </p>

                    <button
                      onClick={closePreQualModal}
                      className="px-10 py-4 bg-white text-black hover:bg-cyan-500 transition-colors rounded-full font-black text-[10px] uppercase tracking-wider"
                    >
                      Listo, Entendido
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footnote Disclaimers */}
      <div className="mt-12 text-center max-w-2xl mx-auto opacity-25 hover:opacity-50 transition-opacity">
        <p className="text-[8px] text-white uppercase font-bold tracking-widest leading-relaxed">
          *Las cuotas provistas son estimaciones financieras matemáticas del motor de inteligencia artificial basadas en un término estándar de 72 meses y una tasa sugerida del 8.9% APR. No constituyen una oferta contractual final de financiamiento. Sujeto a aprobación crediticia de las instituciones financieras locales en Puerto Rico.
        </p>
      </div>

    </div>
  );
};
