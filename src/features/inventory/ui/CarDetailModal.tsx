"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Car } from '@/shared/types/types';
import {
  X,
  ChevronRight,
  Sparkles,
  Loader2,
  Calculator,
  CreditCard,
  Banknote,
  Calendar,
  AlertCircle,
  Share2,
  MessageCircle,
  ShieldCheck,
  Activity,
  Zap,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { generateCarPitch } from '@/shared/api/ai';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';
import { ProgressRing } from '@/shared/ui/common/ProgressRing';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import Viewer360 from '@/features/inventory/ui/common/Viewer360';
import DOMPurify from 'dompurify';

interface Props {
  car: Car;
  onClose: () => void;
}

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, displayValue]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
};

const CarDetailModal: React.FC<Props> = ({ car, onClose }) => {
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [tradeIn, setTradeIn] = useState<number | ''>(0);
  const [term, setTerm] = useState<number>(84);
  const [creditRate, setCreditRate] = useState<number>(0.059);

  const [activeTab, setActiveTab] = useState<'calculator' | 'insight'>('calculator');
  const [aiPitch, setAiPitch] = useState<string>('');
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [errors, setErrors] = useState<{ downPayment?: string }>({});
  const analytics = useInventoryAnalytics();

  const [showHeavyContent, setShowHeavyContent] = useState(false);

  // Monthly payment derived state
  const calculatedPayment = React.useMemo(() => {
    const dpVal = downPayment === '' ? 0 : downPayment;
    const tiVal = tradeIn === '' ? 0 : tradeIn;
    const principal = Math.max(0, car.price - dpVal - tiVal);

    if (principal <= 0) return 0;

    const monthlyRate = creditRate / 12;
    if (monthlyRate === 0) return Math.round(principal / term);

    const numerator = monthlyRate * Math.pow(1 + monthlyRate, term);
    const denominator = Math.pow(1 + monthlyRate, term) - 1;
    return Math.round(principal * (numerator / denominator));
  }, [downPayment, tradeIn, term, creditRate, car.price]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowHeavyContent(true), 300);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
    }
  }, [onClose]);

  const handleTabChange = (tab: 'calculator' | 'insight') => {
    setActiveTab(tab);
    if (tab === 'insight' && !aiPitch && !loadingPitch) {
      setLoadingPitch(true);
      generateCarPitch(car)
        .then((text) => setAiPitch(text))
        .catch(() => setAiPitch('No pudimos conectar con Richard IA en este momento.'))
        .finally(() => setLoadingPitch(false));
    }
  };

  const validate = (): boolean => {
    const newErrors: { downPayment?: string } = {};
    let isValid = true;
    if (downPayment === '') {
      newErrors.downPayment = 'Este campo es obligatorio.';
      isValid = false;
    } else if (downPayment < 0) {
      newErrors.downPayment = 'El valor no puede ser negativo.';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleRequestApproval = () => {
    if (!validate()) {
      const form = document.getElementById('calculator-form');
      form?.classList.add('animate-shake');
      setTimeout(() => form?.classList.remove('animate-shake'), 500);
      return;
    }
    const dpVal = downPayment === '' ? 0 : downPayment;
    const tiVal = tradeIn === '' ? 0 : tradeIn;
    analytics.trackCarConfigure(car.id);
    window.open(
      `https://wa.me/17873682880?text=Hola, vi el análisis de IA del ${car.name}. Me interesa con un pago estimado de $${calculatedPayment}/mes (Pronto: $${dpVal}, TradeIn: $${tiVal}, Término: ${term} meses).`,
      '_blank',
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: `Mira este ${car.name}`,
      text: `¡Encontré este ${car.name} en Richard Automotive! Precio: $${car.price.toLocaleString()}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.debug('Share cancelled or failed', error);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.02, y: -10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-slate-50 dark:bg-slate-950 w-full max-w-6xl h-[92vh] rounded-[48px] md:rounded-[64px] shadow-[0_32px_120px_rgba(0,0,0,0.8)] p-4 md:p-6 relative flex flex-col lg:flex-row gap-6 overflow-hidden border border-white/10"
      >
        {/* Holographic Mesh Layer */}
        <div className="absolute inset-0 pointer-events-none opacity-30 select-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
          <div className="mesh-bg-elite absolute inset-0 opacity-10" />
        </div>

        <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-30 flex gap-4">
          <button onClick={handleShare} className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-slate-300 hover:bg-cyan-500 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95" title="Compartir este vehículo" aria-label="Compartir este vehículo">
            <Share2 size={18} />
          </button>
          <button onClick={onClose} className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95" title="Cerrar detalles" aria-label="Cerrar detalles">
            <X size={18} />
          </button>
        </div>

        <div className="w-full lg:w-3/5 flex flex-col gap-4 h-[40%] lg:h-full relative z-10">
          <div className="flex-1 bg-slate-200/20 dark:bg-white/5 rounded-[35px] lg:rounded-[45px] flex items-center justify-center relative overflow-hidden group border border-white/10 shadow-2xl backdrop-blur-md">
            {showHeavyContent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full relative">
                  {/* Digital HUD Overlay on image */}
                  <div className="absolute top-8 left-8 p-4 border-l-2 border-cyan-500 opacity-40">
                    <p className="font-tech text-[8px] font-black uppercase tracking-[0.4em] text-cyan-400">Tactical 3D Scan</p>
                    <p className="text-[10px] font-bold text-white mt-1">Resolution: 8K High Definition</p>
                  </div>
                  
                  <Viewer360
                      images={(car.images && car.images.length > 0 ? car.images : [car.img]).filter((img): img is string => !!img)}
                      alt={car.name}
                      badge={car.badge}
                      carPrice={car.price}
                      carType={car.type}
                      onFullscreen={() => {}}
                  />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20" />
                    <Loader2 className="animate-spin text-cyan-400 relative z-10" size={40} />
                  </div>
                  <span className="font-tech text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/80 animate-pulse">Initializing Virtual Garage...</span>
              </div>
            )}
          </div>
          
          {/* Stats Bar */}
          <GlassContainer intensity="low" className="hidden lg:flex justify-between items-center py-5 px-10 rounded-[32px] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-cyan-500/20 rounded-full" />
                <ProgressRing label="HP" value={car.price > 60000 ? 450 : car.price > 35000 ? 280 : 180} max={600} size={56} strokeWidth={5} color="#00e5ff" />
              </div>
              <div className="h-8 w-[1px] bg-white/10" />
              <div className="space-y-1">
                <p className="font-tech text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500">Transmission</p>
                <p className="text-xs font-black text-white uppercase italic tracking-tighter">8-Speed Direct Shift</p>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Sentinel Unit</span>
              <span className="text-xs font-black text-white uppercase tracking-tighter italic flex items-center gap-2 justify-end">
                Verified & Mission Ready <ShieldCheck size={14} className="text-cyan-500" />
              </span>
            </div>
          </GlassContainer>
        </div>

        <div className="w-full lg:w-[38%] flex flex-col h-full overflow-hidden p-2 relative z-10">
          {/* Header Area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#00e5ff]" />
                <span className="font-tech text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">
                {car.type} Priority Node
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                UNIT-{car.id.slice(0, 8)}
              </span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-none italic uppercase">
              {car.name}
            </h2>
          </div>

          <GlassContainer intensity="high" className="p-6 lg:p-8 rounded-[40px] shadow-2xl mb-6 relative border-t-2 border-cyan-500/30">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Calculator size={12} className="text-cyan-500" /> Strategic Payment
                </div>
                <div className="text-5xl lg:text-6xl font-black text-white tracking-tighter tabular-nums italic">
                  $<AnimatedNumber value={calculatedPayment} />
                  <span className="text-lg text-slate-500 ml-1">/mo</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl mb-6 border border-white/5">
                {(['calculator', 'insight'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab === 'insight' ? <Cpu size={14} /> : <Zap size={14} />}
                        {tab === 'calculator' ? 'Config' : 'IA Intel'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'calculator' ? (
                <motion.div 
                  key="calc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 group-hover:text-cyan-400">
                      <Banknote size={12} /> Down Payment
                    </label>
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                        <input
                            type="number" value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-transparent text-white font-black outline-none text-lg pl-3"
                            placeholder="0"
                        />
                    </div>
                  </div>
                  <div className="space-y-2 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 group-hover:text-cyan-400">
                      <CreditCard size={12} /> Trade-In
                    </label>
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-black">$</span>
                        <input
                            type="number" value={tradeIn}
                            onChange={(e) => setTradeIn(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-transparent text-white font-black outline-none text-lg pl-3"
                            placeholder="0"
                        />
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 mb-2">
                      <Calendar size={12} /> Duration
                    </label>
                    <select
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                      aria-label="Seleccionar término de financiamiento en meses"
                      title="Seleccionar término de financiamiento"
                      className="w-full bg-transparent text-white font-black outline-none text-sm appearance-none cursor-pointer"
                    >
                      {[48, 60, 72, 84].map(t => (
                        <option key={t} value={t} className="bg-slate-900">{t} Months</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-1.5 mb-2">
                      <ShieldCheck size={12} /> Tier
                    </label>
                    <div className="flex gap-1">
                      {[0.029, 0.059, 0.099, 0.129].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setCreditRate(rate)}
                          className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${creditRate === rate ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800/40 text-slate-600 border border-transparent'}`}
                        >
                          {rate === 0.029 ? 'A+' : rate === 0.059 ? 'A' : rate === 0.099 ? 'B' : 'C'}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="insight"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="max-h-[220px] overflow-y-auto custom-scrollbar bg-black/40 p-6 rounded-3xl border border-white/5"
                >
                  {loadingPitch ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                      <div className="relative h-12 w-12">
                        <Loader2 className="animate-spin text-cyan-500 absolute inset-0" size={48} />
                        <Sparkles className="text-white absolute inset-0 m-auto animate-pulse" size={20} />
                      </div>
                      <span className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/60">Decoding AI Strategy...</span>
                    </div>
                  ) : (
                    <div className="text-[12px] leading-relaxed text-slate-300 font-medium">
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiPitch.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-black">$1</strong>').replace(/\n/g, '<br/>')) }} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </GlassContainer>

          <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
            <button
              onClick={handleRequestApproval}
              className="group relative w-full py-6 bg-gradient-to-r from-primary to-cyan-600 text-white rounded-[32px] font-black text-base uppercase tracking-[0.3em] flex items-center justify-center gap-3 overflow-hidden shadow-[0_20px_50px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all hover:shadow-[0_0_40px_rgba(0,229,255,0.4)]"
            >
                {/* Nivel 13 Adaptive CTA Pulse */}
                <div className="absolute inset-0 bg-cyan-400/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <Zap size={20} className="fill-white group-hover:animate-bounce relative z-10" /> 
                <span className="relative z-10">Authorize Mission</span>
            </button>
            <div className="flex items-center justify-center gap-6 opacity-40">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-cyan-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Sentinel Verified</span>
                </div>
                <div className="h-1 w-1 rounded-full bg-slate-600" />
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-cyan-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 italic">Tactical Approval</span>
                </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,229,255,0.4); }
      `}</style>
    </motion.div>
  );
};

export default CarDetailModal;
