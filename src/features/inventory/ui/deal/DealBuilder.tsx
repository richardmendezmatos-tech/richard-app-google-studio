import React, { useState } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { calculateLoan, CreditTier, getCreditTierLabel } from '@/entities/finance';
import { DollarSign, TrendingUp, CheckCircle, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [downPayment, setDownPayment] = useState<number>(Math.round(vehiclePrice * 0.1)); // Default 10%
  const [term, setTerm] = useState<number>(72);
  const [creditTier, setCreditTier] = useState<CreditTier>('good');
  // Derived payment calculation instead of synchronous effect
  const payment = React.useMemo(() => {
    const result = calculateLoan({
      vehiclePrice,
      downPayment,
      termMonths: term,
      creditTier,
    });
    return result.monthlyPayment;
  }, [vehiclePrice, downPayment, term, creditTier]);

  // Derived Visuals for "Deserve It Meter" (Purchase Power)
  // Heuristic: If payment is < 15% of assumed income (mocked), it's "Great".
  // Or simpler: High Down Payment + Good Credit = High Power.
  const purchasePowerScore = Math.min(
    100,
    Math.round(
      (downPayment / vehiclePrice) * 50 + // Up to 50 pts for DP
        (creditTier === 'excellent'
          ? 50
          : creditTier === 'good'
            ? 35
            : creditTier === 'fair'
              ? 20
              : 0), // Credit score pts
    ),
  );

  const getPowerLabel = (score: number) => {
    if (score > 80)
      return { text: 'Viabilidad Óptima (Sentinel Approved)', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (score > 50) return { text: 'Alta Probabilidad', color: 'text-primary', bg: 'bg-primary' };
    return { text: 'Análisis de Riesgo Requerido', color: 'text-amber-400', bg: 'bg-amber-500' };
  };

  const power = getPowerLabel(purchasePowerScore);

  const handlePreQualify = () => {
    navigate('/qualify', {
      state: {
        vehicle: {
          id: vehicleId,
          name: vehicleName,
          price: vehiclePrice,
          image: vehicleImage,
        },
        quote: {
          monthlyPayment: payment,
          downPayment: downPayment,
          term: term,
          creditTier: creditTier,
        },
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-primary">
        <DollarSign size={200} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,174,217,0.2)]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Briefing Estratégico F&I</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Optimización de Capital & Paz Mental</p>
          </div>
        </div>

        {/* MONTHLY PAYMENT HERO */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-center border border-slate-700 shadow-inner relative group">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            Inversión Mensual Estimada
          </p>
          <div className="flex items-start justify-center gap-1 text-white">
            <span className="text-2xl mt-2 font-bold opacity-50">$</span>
            <span className="text-6xl md:text-7xl font-black tracking-tighter shadow-emerald-500/50 drop-shadow-sm">
              {payment.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
            *Análisis de Inversión F&I. Sujeto a validación bancaria.
          </p>

          {/* "Hidden" APR Notice */}
          <div className="absolute top-4 right-4 group-hover:opacity-100 opacity-0 transition-opacity">
            <div className="bg-slate-800 text-[10px] p-2 rounded border border-slate-600 shadow-xl max-w-[150px] text-left">
              <AlertCircle size={10} className="inline mr-1 mb-0.5" />
              Tu tasa personalizada está calculada internamente basada en tu perfil.
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="space-y-8">
          {/* Down Payment */}
          <div>
            <div className="flex justify-between text-sm font-bold text-slate-300 mb-3">
              <label>Pago Inicial (Down Payment)</label>
              <span className="text-primary">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={vehiclePrice * 0.5}
              step="500"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Ajustar pago inicial"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
              <span>$0</span>
              <span>${(vehiclePrice * 0.5).toLocaleString()}</span>
            </div>
          </div>

          {/* Credit Score */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">
              Tu Historial de Crédito
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['excellent', 'good', 'fair', 'poor'] as CreditTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setCreditTier(tier)}
                  className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all
                                        ${
                                          creditTier === tier
                                            ? 'bg-white text-slate-900 border-white shadow-lg'
                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                        }`}
                >
                  {getCreditTierLabel(tier)}
                </button>
              ))}
            </div>
          </div>

          {/* Term Length */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">Plazo (Meses)</label>
            <div className="flex bg-slate-800 p-1 rounded-xl">
              {[48, 60, 72, 84].map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${term === t ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DESERVE IT METER / PURCHASE POWER */}
        <div className="mt-10 pt-8 border-t border-slate-700">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Viabilidad de Aprobación F&I
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${power.color}`}>{power.text}</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${power.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${purchasePowerScore}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {/* AI Strategy Briefing */}
          <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={40} className="text-primary" />
            </div>
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Estrategia de Cierre Sentinel
            </h4>
            <div className="space-y-3">
              {generarPersuasionVenta.execute({
                cotizacion: {
                  valorTradeIn: downPayment, // Simple mapping for demo
                  pagoDeudaTradeIn: 0,
                  pagoMensualEstimado: payment,
                  apr: creditTier === 'excellent' ? 5.95 : 8.95
                },
                nombreCliente: 'Cliente'
              }).points.slice(0, 2).map((point, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="mt-1 w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handlePreQualify}
            className="w-full bg-primary hover:bg-cyan-500 text-white font-black uppercase tracking-[0.3em] text-[10px] py-5 rounded-2xl shadow-2xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95"
          >
            <CheckCircle size={18} /> Ejecutar Cierre Estratégico
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealBuilder;
