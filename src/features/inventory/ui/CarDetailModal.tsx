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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.02, y: -10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-50 dark:bg-slate-900 w-full max-w-6xl h-[92vh] rounded-[48px] md:rounded-[64px] shadow-2xl p-4 md:p-6 relative flex flex-col lg:flex-row gap-6 overflow-hidden border border-white/10"
      >
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-30 flex gap-2">
          <button onClick={handleShare} className="w-10 h-10 lg:w-12 lg:h-12 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-all shadow-lg" title="Compartir este vehículo">
            <Share2 size={18} />
          </button>
          <button onClick={onClose} className="w-10 h-10 lg:w-12 lg:h-12 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-lg" title="Cerrar detalles">
            <X size={18} />
          </button>
        </div>

        <div className="w-full lg:w-3/5 flex flex-col gap-4 h-[40%] lg:h-full">
          <div className="flex-1 bg-slate-200/50 dark:bg-slate-800 rounded-[35px] lg:rounded-[45px] flex items-center justify-center relative overflow-hidden group border border-slate-200 dark:border-white/5 shadow-inner">
            {showHeavyContent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
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
              <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-cyan-500" size={32} />
                  <span className="font-tech text-[10px] uppercase tracking-widest text-cyan-500/50">Iniciando Visualización...</span>
              </div>
            )}
          </div>
          
          {/* Stats Bar (Liberando espacio del panel derecho) */}
          <div className="hidden lg:flex justify-around items-center py-4 px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[32px] border border-white/10">
            <div className="flex items-center gap-4">
              <ProgressRing label="HP" value={car.price > 60000 ? 450 : car.price > 35000 ? 280 : 180} max={600} size={48} strokeWidth={4} />
              <div className="h-8 w-px bg-white/10" />
              <ProgressRing label="EF%" value={car.type === 'sedan' ? 92 : car.type === 'suv' ? 84 : 76} max={100} size={48} strokeWidth={4} color="#10b981" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory Status</span>
              <span className="text-xs font-black text-emerald-500 uppercase tracking-tighter">Ready for delivery</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[38%] flex flex-col h-full overflow-hidden p-2">
          {/* Header Area */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Activity size={10} className="text-cyan-500 animate-pulse" />
                <span className="font-tech text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em]">
                {car.type} Unit Protocol
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                ID: {car.id.slice(0, 8)}
              </span>
            </div>
            <h2 className="text-2xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight">
              {car.name}
            </h2>
          </div>

          {/* Payment Summary & Critical Controls (Nivel 18 Glassmorphism) */}
          <GlassContainer intensity="high" className="p-5 lg:p-6 rounded-[32px] shadow-xl mb-4 relative overflow-hidden group">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calculator size={12} className="text-cyan-500" /> Mensualidad Estimada
                </div>
                <div className="text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tighter tabular-nums">
                  ${calculatedPayment}
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-white/5 p-1 rounded-xl">
                {(['calculator', 'insight'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {tab === 'insight' ? <Sparkles size={12} /> : <Calculator size={12} />}
                    {tab === 'calculator' ? 'Finas' : 'IA'}
                  </button>
                ))}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === 'calculator' ? (
                <motion.div 
                  key="calc"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className="space-y-1.5 p-3 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Banknote size={10} /> Pronto
                    </label>
                    <input
                      type="number" value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-transparent dark:text-white font-black outline-none text-base"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5 p-3 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <CreditCard size={10} /> Trade-In
                    </label>
                    <input
                      type="number" value={tradeIn}
                      onChange={(e) => setTradeIn(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-transparent dark:text-white font-black outline-none text-base"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> Plazo
                    </label>
                    <select
                      id="term-select"
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                      className="w-full bg-transparent dark:text-white font-black outline-none text-sm appearance-none cursor-pointer"
                      title="Selecciona el plazo en meses"
                    >
                      {[48, 60, 72, 84].map(t => (
                        <option key={t} value={t}>{t} Meses</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 p-3 bg-white/5 dark:bg-black/20 rounded-2xl border border-white/5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck size={10} /> Score
                    </label>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                      {[0.029, 0.059, 0.099, 0.129].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setCreditRate(rate)}
                          className={`flex-1 py-1 rounded-md text-[7px] font-black uppercase transition-all ${creditRate === rate ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                        >
                          {rate === 0.029 ? 'A' : rate === 0.059 ? 'B' : rate === 0.099 ? 'C' : 'D'}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="insight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-h-[160px] overflow-y-auto custom-scrollbar"
                >
                  <div className="bg-white/5 dark:bg-black/20 p-4 rounded-2xl border border-cyan-500/10">
                    {loadingPitch ? (
                      <div className="flex flex-col items-center justify-center py-4 gap-2">
                        <Loader2 className="animate-spin text-cyan-500" size={24} />
                        <span className="font-tech text-[8px] font-bold uppercase tracking-widest text-cyan-500/50">IA Analizando...</span>
                      </div>
                    ) : (
                      <div className="text-[11px] leading-relaxed text-slate-300 pointer-events-none">
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiPitch.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-500">$1</strong>').replace(/\n/g, '<br/>')) }} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassContainer>

          <div className="flex-1 overflow-hidden space-y-3">
             <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-[24px] border border-white/5">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={12} className="text-cyan-500" /> Technical Data Scan
                </div>
                <div className="space-y-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Transmisión</span>
                    <span className="font-black text-slate-800 dark:text-white uppercase">{car.type === 'sedan' ? 'E-Auto 8spd' : '4WD Shiftless'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>Consumo</span>
                    <span className="font-black text-slate-800 dark:text-white uppercase">{car.type === 'sedan' ? '32' : '24'} MPG Comb.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracción</span>
                    <span className="font-black text-slate-800 dark:text-white uppercase">Symmetric AWD</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="mt-4 flex flex-col items-center shrink-0 w-full gap-3 bg-white dark:bg-slate-900 pt-4 border-t border-slate-100 dark:border-white/5">
            <button
              onClick={handleRequestApproval}
              className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <MessageCircle size={18} /> Consultar Disponibilidad
            </button>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] flex items-center gap-1 opacity-60">
              <ShieldCheck size={12} className="text-cyan-500" /> Richard Automotive Priority Unit
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,210,255,0.1); border-radius: 10px; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </motion.div>
  );
};

export default CarDetailModal;
