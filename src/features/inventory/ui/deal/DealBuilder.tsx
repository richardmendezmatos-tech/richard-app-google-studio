import React, { useState } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { calculateSimplePayment, CreditTier, getCreditTierLabel } from '@/entities/finance';
import { DollarSign, TrendingUp, CheckCircle, ShieldCheck, Zap, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { generarPersuasionVenta } from '@/features/sales/application/GenerarPersuasionVenta';

interface DealBuilderProps {
  vehicleId: string;
  vehiclePrice: number;
  vehicleName: string;
  vehicleImage?: string;
}

const DealBuilder: React.FC<DealBuilderProps> = ({
  vehicleId,
  vehiclePrice,
  vehicleName,
  vehicleImage,
}) => {
  const navigate = useNavigate();
  // State
  const [downPayment, setDownPayment] = useState<number>(Math.round(vehiclePrice * 0.15)); // Default 15% para PR
  const [term, setTerm] = useState<number>(72);
  const [creditTier, setCreditTier] = useState<CreditTier>('excellent');

  // New simplified payment calculation (No Item 4)
  const payment = React.useMemo(() => {
    return calculateSimplePayment(vehiclePrice, downPayment, term, creditTier);
  }, [vehiclePrice, downPayment, term, creditTier]);

  const purchasePowerScore = Math.min(
    100,
    Math.round(
      (downPayment / vehiclePrice) * 60 + // Up to 60 pts for DP
        (creditTier === 'excellent' ? 40 : creditTier === 'good' ? 30 : creditTier === 'fair' ? 15 : 5),
    ),
  );

  const getPowerLabel = (score: number) => {
    if (score > 80)
      return { text: 'SENTINEL APPROVED', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (score > 40) return { text: 'BAJO REVISIÓN', color: 'text-primary', bg: 'bg-primary' };
    return { text: 'REQUIERE EVALUACIÓN DIRECTA', color: 'text-amber-400', bg: 'bg-amber-500' };
  };

  const power = getPowerLabel(purchasePowerScore);

  const handlePreQualify = () => {
    navigate('/qualify', {
      state: {
        vehicle: { id: vehicleId, name: vehicleName, price: vehiclePrice, image: vehicleImage },
        quote: {
          monthlyPayment: payment,
          downPayment: downPayment,
          term: term,
          creditTier: creditTier,
          apr: creditTier === 'excellent' ? 5.95 : creditTier === 'good' ? 8.95 : 12.95
        },
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
      
      <div className="relative z-10 space-y-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Simulador de Aprobación</h3>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Richard Automotive F&I Division</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">En Vivo</span>
          </div>
        </header>

        {/* PAYMENT DISPLAY */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Inversión Mensual Estimada
          </p>
          <div className="flex items-start justify-center gap-2 text-white scale-110 lg:scale-125 mb-4">
            <span className="text-3xl font-black opacity-30 mt-4">$</span>
            <span className="text-7xl lg:text-8xl font-black tracking-tighter tabular-nums drop-shadow-2xl">
              {payment.toLocaleString()}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Tasa: <span className="text-white">{creditTier === 'excellent' ? '5.95%' : creditTier === 'good' ? '8.95%' : creditTier === 'fair' ? '12.95%' : '18.95%'} APR</span>
            </span>
          </div>
        </div>

        {/* INTERACTIVE CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-10">
            {/* Down Payment */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={14} className="text-primary" /> Pronto (Down Payment)
                </label>
                <span className="text-2xl font-black text-white font-mono">${downPayment.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max={vehiclePrice * 0.7}
                step="500"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] text-slate-600 font-black uppercase tracking-widest">
                <span>Sin Pronto</span>
                <span>Max Control</span>
              </div>
            </div>

            {/* Credit Tier Selector */}
            <div className="space-y-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={14} className="text-primary" /> Historial de Crédito
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['excellent', 'good', 'fair', 'poor'] as CreditTier[]).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setCreditTier(tier)}
                    className={`p-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest border transition-all
                      ${creditTier === tier 
                        ? 'bg-primary border-primary text-slate-950 shadow-xl shadow-primary/20 scale-[1.02]' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'}`}
                  >
                    {getCreditTierLabel(tier).split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Term Selector */}
            <div className="space-y-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-primary" /> Plazo (Meses)
              </label>
              <div className="flex bg-white/5 p-2 rounded-[24px] border border-white/5">
                {[48, 60, 72, 84].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all ${term === t ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Approval Progress */}
            <div className="bg-white/5 rounded-[32px] p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probabilidad de Aprobación</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${power.color}`}>{power.text}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-6">
                <motion.div
                  className={`h-full ${power.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${purchasePowerScore}%` }}
                />
              </div>
              
              {/* Sentinel Strategy */}
              <div className="space-y-4">
                <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles size={12} /> Sentinel AI Advice
                </h4>
                <div className="space-y-3">
                  {generarPersuasionVenta.execute({
                    cotizacion: {
                      precioUnidadDestino: vehiclePrice,
                      prontoCash: downPayment,
                      montoAFinanciar: vehiclePrice - downPayment,
                      terminoMeses: term,
                      valorTradeIn: 0,
                      pagoDeudaTradeIn: 0,
                      pagoMensualEstimado: payment,
                      apr: creditTier === 'excellent' ? 5.95 : 8.95
                    },
                    nombreCliente: 'Cliente'
                  }).points.slice(0, 1).map((point, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed text-slate-400 font-bold italic border-l-2 border-primary/20 pl-4">
                      "{point}"
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePreQualify}
          className="w-full bg-primary hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-[0.3em] text-xs py-6 rounded-[24px] shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] group/btn"
        >
          <CheckCircle size={20} className="group-hover/btn:rotate-12 transition-transform" />
          Pre-Cualificar Ahora
        </button>
      </div>
    </div>
  );
};

export default DealBuilder;
