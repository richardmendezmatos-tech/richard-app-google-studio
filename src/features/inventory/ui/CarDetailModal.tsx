"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Car } from '@/entities/inventory';
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
  Info,
  Eye,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { generateCarPitch } from '@/shared/api/ai';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';
import { ProgressRing } from '@/shared/ui/common/ProgressRing';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import Viewer360 from '@/features/inventory/ui/common/Viewer360';
import DOMPurify from 'dompurify';
import { captureHotLead } from '@/shared/api/supabase/supabaseClient';
import { AuditRepository } from '@/shared/api/houston/AuditRepository';

const auditRepo = new AuditRepository();


interface Props {
  car: Car;
  onClose: () => void;
}

type TabType = 'overview' | 'financials' | 'specs' | 'contact';

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
};

const CarDetailModal: React.FC<Props> = ({ car, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [tradeIn, setTradeIn] = useState<number | ''>(0);
  const [term, setTerm] = useState<number>(84);
  const [creditRate, setCreditRate] = useState<number>(0.059);
  
  const [aiPitch, setAiPitch] = useState<string>('');
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [showHeavyContent, setShowHeavyContent] = useState(false);
  
  const analytics = useInventoryAnalytics();

  // Monthly payment derived state
  const calculatedPayment = useMemo(() => {
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

  useEffect(() => {
    const timer = setTimeout(() => setShowHeavyContent(true), 300);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [onClose]);

  useEffect(() => {
    analytics.trackTabChange(car.id, activeTab);
    auditRepo.log({
      type: 'info',
      message: `User viewed ${activeTab} tab for ${car.name}`,
      source: 'CarDetailModal',
      metadata: { vehicleId: car.id, tab: activeTab }
    });
  }, [activeTab, car.id, car.name, analytics]);

  useEffect(() => {
    if (activeTab === 'overview' && !aiPitch && !loadingPitch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingPitch(true);
      generateCarPitch(car)
        .then((text) => setAiPitch(text))
        .catch(() => setAiPitch('No pudimos conectar con Richard IA.'))
        .finally(() => setLoadingPitch(false));
    }
  }, [activeTab, aiPitch, car, loadingPitch]);

  const handleAction = () => {
    const dpVal = downPayment === '' ? 0 : downPayment;
    const tiVal = tradeIn === '' ? 0 : tradeIn;
    
    // 1. Silent Lead Capture in Supabase (Sentinel N15 standard)
    captureHotLead({
      vehicleId: car.id,
      vehicleName: car.name,
      vehiclePrice: car.price,
      monthlyPayment: calculatedPayment,
      downPayment: dpVal,
      tradeIn: tiVal,
      term,
      creditTier: creditRate === 0.029 ? 'Excellent' : creditRate === 0.059 ? 'Good' : creditRate === 0.099 ? 'Fair' : 'Poor',
      source: `CarDetailModal_${activeTab}`,
    });

    analytics.trackCarConfigure(car.id);
    auditRepo.log({
      type: 'conversion',
      message: `WhatsApp Conversion attempt for ${car.name}`,
      source: 'CarDetailModal',
      metadata: { vehicleId: car.id, payment: calculatedPayment }
    });

    window.open(
      `https://wa.me/17873682880?text=Hola Richard, me interesa el ${car.name}. Vi el reporte IA y calculé un pago de $${calculatedPayment}/mes.`,
      '_blank'
    );
  };

  const handleCall = () => {
    // 1. Silent Lead Capture
    captureHotLead({
      vehicleId: car.id,
      vehicleName: car.name,
      vehiclePrice: car.price,
      source: `CarDetailModal_Call`,
    });

    auditRepo.log({
      type: 'conversion',
      message: `Call Conversion attempt for ${car.name}`,
      source: 'CarDetailModal',
      metadata: { vehicleId: car.id }
    });

    window.location.href = 'tel:7873682880';
  };

  const handleShare = async () => {
    const shareData = {
      title: car.name,
      text: `¡Mira este ${car.name} en Richard Automotive!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) { console.debug('Native share failed', e); }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`, '_blank');
    }
  };

  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <Eye size={18} />, label: 'Explorador' },
    { id: 'financials', icon: <Calculator size={18} />, label: 'Finanzas' },
    { id: 'specs', icon: <Info size={18} />, label: 'Ficha' },
    { id: 'contact', icon: <Phone size={18} />, label: 'Acción' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-0 md:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, y: -20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-premium w-full max-w-6xl h-full md:h-[92vh] md:rounded-[64px] shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Header Navigation */}
        <div className="flex items-center justify-between p-6 lg:px-12 lg:py-8 relative z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
              <p className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/80">Mission Critical Unit {car.id.slice(0,6).toUpperCase()}</p>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">{car.name}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-90">
              <Share2 size={20} />
            </button>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-rose-500 transition-all hover:scale-110 active:scale-90">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sentinel Tab Bar */}
        <div className="px-6 lg:px-12 mb-4 relative z-20">
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-[24px] border border-white/5 backdrop-blur-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-4 rounded-[18px] flex flex-col md:flex-row items-center justify-center gap-2 transition-all relative overflow-hidden group ${activeTab === tab.id ? 'bg-gradient-to-br from-primary to-cyan-600 shadow-[0_10px_30px_rgba(0,180,216,0.3)]' : 'hover:bg-white/5'}`}
              >
                <div className={`${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {tab.icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-glow" className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative z-10 px-6 lg:px-12 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 1.01 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full"
            >
              {activeTab === 'overview' && (
                <div className="flex flex-col lg:flex-row gap-6 h-full">
                  {/* Digital Garage Area */}
                  <div className="w-full lg:w-2/3 bg-white/5 rounded-[40px] border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                    {showHeavyContent ? (
                      <div className="w-full h-full relative">
                         {/* HUD HUD Digital HUD */}
                        <div className="absolute top-8 left-8 p-4 border-l-2 border-cyan-500 opacity-60 z-20 pointer-events-none">
                          <p className="font-tech text-[8px] font-black uppercase tracking-[0.4em] text-cyan-400">Tactical Scan ACTIVE</p>
                          <div className="flex gap-2 mt-2">
                             {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                          </div>
                        </div>

                        <div className="absolute bottom-8 right-8 text-right opacity-60 z-20 pointer-events-none">
                           <p className="font-tech text-3xl font-black text-white italic tracking-tighter">CERTIFIED</p>
                           <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Sentinel Elite Unit</p>
                        </div>
                        
                        <Viewer360
                          images={(car.images || [car.img || car.image]).filter((img): img is string => !!img)}
                          alt={car.name}
                          badge={car.badge}
                          carPrice={car.price}
                          carType={car.type}
                          onFullscreen={() => {}}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 size={40} className="animate-spin text-cyan-500" />
                        <span className="font-tech text-[10px] uppercase tracking-[0.5em] text-cyan-500 animate-pulse">Syncing Garage...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Specs / Insight Area */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <GlassContainer intensity="high" className="p-8 rounded-[40px] flex-1 border-t-2 border-cyan-500/30 overflow-hidden flex flex-col shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                           <Cpu size={20} className="text-cyan-400" />
                           <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">IA Richard Report</span>
                        </div>
                        <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full">
                           <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">PRO VERSION</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loadingPitch ? (
                          <div className="h-full flex flex-col items-center justify-center gap-6 overflow-hidden">
                            <div className="relative w-full h-32 overflow-hidden bg-slate-900/50 rounded-2xl flex items-center justify-center">
                              {/* Neural Scan Animation */}
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              />
                              <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                  <motion.div 
                                    key={i}
                                    className="w-2 h-8 bg-cyan-500/30 rounded-full"
                                    animate={{ height: [32, 48, 32] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black animate-pulse">Running Neural Analysis...</p>
                          </div>
                        ) : (
                          <div className="text-[14px] leading-relaxed text-slate-300 font-medium space-y-4">
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiPitch.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400 font-black">$1</strong>').replace(/\n/g, '<br/>')) }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Sub-stats indicators */}
                      <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/5">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Condition</p>
                           <p className="text-xs font-black text-white italic">Elite Certified</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Fuel Economy</p>
                           <p className="text-xs font-black text-white italic">Optimal</p>
                        </div>
                      </div>
                    </GlassContainer>
                  </div>
                </div>
              )}

              {activeTab === 'financials' && (
                <div className="h-full flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-2/3 bg-slate-900/60 rounded-[40px] border border-white/10 p-8 lg:p-12 overflow-y-auto custom-scrollbar shadow-2xl">
                    <div className="flex items-center gap-2 mb-8">
                       <Calculator size={24} className="text-cyan-400" />
                       <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Simulador de Aprobación</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="ra-label-base flex items-center gap-2">
                           <Banknote size={14} className="text-ra-primary" /> Pago Inicial (Pronto)
                        </label>
                        <div className="relative group">
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500 group-focus-within:text-ra-primary transition-colors">$</span>
                           <input 
                             type="number" 
                             value={downPayment} 
                             onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                             className="ra-input-base pl-14 text-4xl font-black tabular-nums"
                             placeholder="0"
                           />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="ra-label-base flex items-center gap-2">
                           <Zap size={14} className="text-ra-primary" /> Trade-In Estimado
                        </label>
                        <div className="relative group">
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500 group-focus-within:text-ra-primary transition-colors">$</span>
                           <input 
                             type="number" 
                             value={tradeIn} 
                             onChange={(e) => setTradeIn(e.target.value === '' ? '' : Number(e.target.value))}
                             className="ra-input-base pl-14 text-4xl font-black tabular-nums"
                             placeholder="0"
                           />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="ra-label-base flex items-center gap-2">
                           <Calendar size={14} className="text-ra-primary" /> Término (Meses)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[48, 60, 72, 84].map((t) => (
                            <button
                              key={t}
                              onClick={() => setTerm(t)}
                              className={`py-4 rounded-2xl text-sm font-black transition-all ${term === t ? 'bg-ra-primary text-slate-950 shadow-lg shadow-ra-primary/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                            >
                              {t}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="ra-label-base flex items-center gap-2">
                           <ShieldCheck size={14} className="text-ra-primary" /> Perfil de Crédito
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[0.029, 0.059, 0.099, 0.129].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => setCreditRate(rate)}
                              className={`py-4 rounded-2xl text-xs font-black transition-all ${creditRate === rate ? 'bg-ra-primary text-slate-950 shadow-lg shadow-ra-primary/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                            >
                              {rate === 0.029 ? 'EXC' : rate === 0.059 ? 'BUENO' : rate === 0.099 ? 'REG' : 'POB'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <GlassContainer intensity="high" className="p-10 rounded-[48px] border-t-2 border-primary flex-1 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Pago Mensual Estimado</p>
                       <div className="text-7xl lg:text-8xl font-black text-white italic tracking-tighter mb-2">
                          $<AnimatedNumber value={calculatedPayment} />
                       </div>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">+ Tax & Licensing</p>
                       
                       <div className="mt-12 w-full space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                             <span>Precio Unidad</span>
                             <span className="text-white">${car.price.toLocaleString()}</span>
                          </div>
                          <div className="h-[1px] w-full bg-white/5" />
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                             <span>APR Estimado</span>
                             <span className="text-cyan-400">{(creditRate * 100).toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Financial Audit Note */}
                        <div className="mt-8 p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                           <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                           <p className="text-[10px] text-slate-400 leading-tight">
                              <strong>Socio Financiero PR:</strong> Pago estimado basado en crédito de excelencia. Sujeto a aprobación por Banco Popular, FirstBank u Oriental. No incluye seguros ni arbitrios.
                           </p>
                        </div>
                    </GlassContainer>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="h-full bg-white/5 rounded-[40px] border border-white/10 p-8 lg:p-12 overflow-y-auto custom-scrollbar shadow-2xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      <div className="space-y-8">
                         <div className="flex items-center gap-3">
                            <Zap size={20} className="text-cyan-400" />
                            <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Matriz de Energía</h4>
                         </div>
                         <div className="space-y-6">
                            {[
                              { label: 'Caballos de Fuerza (HP)', value: car.hp || 'N/A' },
                              { label: 'Transmisión', value: car.transmission || 'Automática Selective' },
                              { label: 'Tracción', value: 'Delantera AWD System' },
                              { label: 'Motor', value: car.engine || 'Turbocard Intercooled' }
                            ].map(spec => (
                               <div key={spec.label} className="group">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-cyan-400 transition-colors">{spec.label}</p>
                                  <p className="text-sm font-black text-white italic">{spec.value}</p>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-cyan-400" />
                            <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Sentinel Security</h4>
                         </div>
                         <div className="grid grid-cols-1 gap-4">
                            {['Frenado Autónomo', 'Sensores Blind-Spot', 'Cámara 360 Scan', 'Alerta de Tráfico Cruzado'].map(f => (
                               <div key={f} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                  <CheckCircle2 size={16} className="text-cyan-400" />
                                  <span className="text-xs font-black text-slate-300 uppercase italic">{f}</span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="flex items-center gap-3">
                            <Activity size={20} className="text-cyan-400" />
                            <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Estado de Unidad</h4>
                         </div>
                         <GlassContainer intensity="low" className="p-6 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                               <ProgressRing value={100} max={100} size={50} label="CERT" strokeWidth={4} color="#00e5ff" />
                               <div>
                                  <p className="text-xs font-black text-white italic uppercase">Nivel 13 Aprobado</p>
                                  <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase italic">Inspección Rigurosa 2026</p>
                               </div>
                            </div>
                            <div className="p-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                               <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] leading-relaxed">Esta unidad ha sido sometida a un escaneo digital completo y validada por Sentinel Engine.</p>
                            </div>
                         </GlassContainer>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'contact' && (
                 <div className="h-full flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white/5 rounded-[64px] border border-white/10 p-12 text-center shadow-2xl relative overflow-hidden group">
                       <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div className="relative z-10 flex flex-col items-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-primary to-cyan-400 rounded-full flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(0,180,216,0.5)]">
                             <MessageCircle size={48} className="text-white" />
                          </div>
                          <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">¿Listo para la Misión?</h3>
                          <p className="text-lg text-slate-400 font-medium mb-12 max-w-md">Conversa directamente con Richard IA o un estratega certificado para coordinar tu prueba de vuelo.</p>
                          
                          <div className="w-full flex flex-col md:flex-row gap-4">
                             <button
                               onClick={handleAction}
                               className="flex-1 py-8 bg-white text-slate-950 rounded-[32px] font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-cyan-400 transition-all hover:scale-[1.05] shadow-xl"
                             >
                                <MessageCircle size={24} /> WhatsApp
                             </button>
                             <button
                               onClick={handleCall}
                               className="flex-1 py-8 bg-primary text-white rounded-[32px] font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-primary/80 transition-all hover:scale-[1.05] shadow-xl shadow-primary/20"
                             >
                                <Phone size={24} /> Llamar
                             </button>
                          </div>
                          
                          <div className="mt-12 flex items-center gap-4 opacity-40">
                             <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-cyan-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic text-white">Transacción Segura</span>
                             </div>
                             <div className="h-1 w-1 rounded-full bg-slate-500" />
                             <div className="flex items-center gap-2">
                                <ProgressRing 
                                  value={car.year > 2024 ? 98 : 95} 
                                  size={45}
                                  strokeWidth={3}
                                  label="HP Efficiency" 
                                  color={car.make === 'Porsche' || car.price > 80000 ? '#f59e0b' : '#10b981'} 
                                />
                                <ProgressRing 
                                  value={100} 
                                  size={45}
                                  strokeWidth={3}
                                  label="Security" 
                                  color="#06b6d4" 
                                />
                                <ProgressRing 
                                  value={95} 
                                  size={45}
                                  strokeWidth={3}
                                  label="Neural Log" 
                                  color="#8b5cf6" 
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest italic text-white">Respuesta Inmediata</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Floating Actions (Pinned Footer) */}
        <div className="p-6 lg:px-12 lg:py-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative z-30">
           <div className="flex items-end gap-6">
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Precio de Venta</p>
                 <p className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter tabular-nums">${car.price.toLocaleString()}</p>
              </div>
              <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
              <div className="space-y-1">
                 <p className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.4em]">Financiamiento desde</p>
                 <p className="text-4xl lg:text-5xl font-black text-cyan-400 italic tracking-tighter tabular-nums leading-none">
                    $<AnimatedNumber value={calculatedPayment} />
                    <span className="text-lg ml-1">/mes</span>
                 </p>
              </div>
           </div>
           
           <button 
             onClick={handleAction}
             className="w-full md:w-auto px-16 py-6 bg-gradient-to-r from-primary to-cyan-500 text-white rounded-[32px] font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,180,216,0.3)] hover:scale-[1.05] active:scale-95 transition-all group"
           >
              <Zap size={20} className="fill-white group-hover:animate-bounce" /> Autorizar Misión
           </button>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,229,255,0.3); }
        .font-tech { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>
    </motion.div>
  );
};

export default CarDetailModal;
