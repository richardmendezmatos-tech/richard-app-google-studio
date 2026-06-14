'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Car } from '@/entities/inventory';
import {
  X,
  Calculator,
  Info,
  Share2,
  Zap,
  Eye,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCarPitch } from '@/shared/api/ai/client';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';
import { AuditRepository } from '@/shared/api/houston/AuditRepository';
import { ARViewOverlay } from '@/features/inventory/ui/ARViewOverlay';
import OverviewTab from './tabs/OverviewTab';
import FinancialsTab from './tabs/FinancialsTab';
import SpecsTab from './tabs/SpecsTab';
import ContactTab from './tabs/ContactTab';
import AnimatedNumber from './tabs/AnimatedNumber';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

const auditRepo = new AuditRepository();

interface Props {
  car: Car;
  onClose: () => void;
}

type TabType = 'overview' | 'financials' | 'specs' | 'contact';

const CarDetailModal: React.FC<Props> = ({ car, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [tradeIn, setTradeIn] = useState<number | ''>(0);
  const [term, setTerm] = useState<number>(84);
  const [creditRate, setCreditRate] = useState<number>(0.059);

  const [aiPitch, setAiPitch] = useState<string>('');
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [showHeavyContent, setShowHeavyContent] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const leadCapturedRef = useRef(false);

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
    auditRepo.log(
      'info',
      `User viewed ${activeTab} tab for ${car.name}`,
      { vehicleId: car.id, tab: activeTab },
      'CarDetailModal',
    );
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
    if (leadCapturedRef.current) return;
    leadCapturedRef.current = true;
    const dpVal = downPayment === '' ? 0 : downPayment;
    const tiVal = tradeIn === '' ? 0 : tradeIn;

    // 1. Silent Lead Capture in Supabase (Sentinel N15 standard)
    fetch('/api/leads/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicleId: car.vin,
        vehicleName: `${car.year} ${car.make} ${car.model}`,
        vehiclePrice: Number(car.price),
        monthlyPayment,
        downPayment,
        tradeIn,
        term,
        creditTier,
        source: 'whatsapp',
      }),
    }).catch(() => {});

    analytics.trackCarConfigure(car.id);
    auditRepo.log(
      'conversion',
      `WhatsApp Conversion attempt for ${car.name}`,
      { vehicleId: car.id, payment: calculatedPayment },
      'CarDetailModal',
    );

    window.open(
      `https://wa.me/${BUSINESS_CONTACT.phone.replace(/-/g, '')}?text=Hola Richard, me interesa el ${car.name}. Vi el reporte IA y calculé un pago de $${calculatedPayment}/mes.`,
      '_blank',
    );
  };

  const handleCall = () => {
    if (leadCapturedRef.current) return;
    leadCapturedRef.current = true;
    // 1. Silent Lead Capture
    captureHotLead({
      vehicleId: car.id,
      vehicleName: car.name,
      vehiclePrice: car.price,
      source: `CarDetailModal_Call`,
    });

    auditRepo.log(
      'conversion',
      `Call Conversion attempt for ${car.name}`,
      { vehicleId: car.id },
      'CarDetailModal',
    );

    window.location.href = `tel:${BUSINESS_CONTACT.phone.replace(/-/g, '')}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: car.name,
      text: `¡Mira este ${car.name} en Richard Automotive!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.debug('Native share failed', e);
      }
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
        className="glass-premium w-full max-w-6xl h-full md:h-[92vh] md:rounded-[64px] shadow-2xl overflow-hidden flex flex-col relative z-100"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Header Navigation */}
        <div className="flex items-center justify-between p-6 lg:px-12 lg:py-8 relative z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
              <p className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/80">
                Unidad Certificada {(car?.id || '').slice(0, 6).toUpperCase()}
              </p>
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              {car.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              aria-label="Compartir vehículo"
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all hover:scale-110 active:scale-90"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-rose-500 transition-all hover:scale-110 active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Sentinel Tab Bar */}
        <div className="px-6 lg:px-12 mb-4 relative z-20">
          <div role="tablist" className="flex gap-2 bg-white/5 p-1.5 rounded-[24px] border border-white/5 backdrop-blur-md">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-4 rounded-[18px] flex flex-col md:flex-row items-center justify-center gap-2 transition-all relative overflow-hidden group ${activeTab === tab.id ? 'bg-linear-to-br from-primary to-cyan-600 shadow-[0_10px_30px_rgba(0,180,216,0.3)]' : 'hover:bg-white/5'}`}
              >
                <div
                  className={`${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                >
                  {tab.icon}
                </div>
                <span
                  className={`text-[9px] font-black uppercase tracking-[0.2em] ${activeTab === tab.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                >
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-glow"
                    className="absolute inset-0 bg-white/20 animate-pulse"
                  />
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
              role="tabpanel"
              initial={{ opacity: 0, x: 20, scale: 0.99 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 1.01 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="h-full"
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  car={car}
                  showHeavyContent={showHeavyContent}
                  loadingPitch={loadingPitch}
                  aiPitch={aiPitch}
                  onToggleAR={() => setShowAR(true)}
                />
              )}

              {activeTab === 'financials' && (
                <FinancialsTab
                  car={car}
                  downPayment={downPayment}
                  tradeIn={tradeIn}
                  term={term}
                  creditRate={creditRate}
                  calculatedPayment={calculatedPayment}
                  setDownPayment={setDownPayment}
                  setTradeIn={setTradeIn}
                  setTerm={setTerm}
                  setCreditRate={setCreditRate}
                />
              )}

              {activeTab === 'specs' && <SpecsTab car={car} />}

              {activeTab === 'contact' && (
                <ContactTab car={car} onAction={handleAction} onCall={handleCall} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Floating Actions (Pinned Footer) */}
        <div className="p-6 lg:px-12 lg:py-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6 relative z-30">
          <div className="flex items-end gap-6">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                Precio de Venta
              </p>
              <p className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter tabular-nums">
                ${car.price.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="space-y-1">
              <p className="text-[8px] font-black text-cyan-500 uppercase tracking-[0.4em]">
                Financiamiento desde
              </p>
              <p className="text-4xl lg:text-5xl font-black text-cyan-400 italic tracking-tighter tabular-nums leading-none">
                $<AnimatedNumber value={calculatedPayment} />
                <span className="text-lg ml-1">/mes</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleAction}
            className="w-full md:w-auto px-16 py-6 bg-linear-to-r from-primary to-cyan-500 text-white rounded-4xl font-black text-lg uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,180,216,0.3)] hover:scale-[1.05] active:scale-95 transition-all group"
          >
            <Zap size={20} className="fill-white group-hover:animate-bounce" /> Cotizar por WhatsApp
          </button>
        </div>

        {/* Phase 5: AR-Vision Overlay */}
        <AnimatePresence>
          {showAR && (
            <ARViewOverlay
              image={car.img || car.image || (car.images?.[0] ?? '')}
              vehicleName={car.name}
              specs={{
                hp: car.hp || 180,
                torque: 210,
                safety: 96,
              }}
              onClose={() => setShowAR(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 229, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 229, 255, 0.3);
        }
        .font-tech {
          font-family: 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </motion.div>
  );
};

export default CarDetailModal;
