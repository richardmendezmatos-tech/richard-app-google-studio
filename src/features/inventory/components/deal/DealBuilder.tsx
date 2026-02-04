import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateLoan, CreditTier, getCreditTierLabel } from '@/utils/financeCalculator';
import { DollarSign, Calendar, TrendingUp, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface DealBuilderProps {
    vehicleId: string;
    vehiclePrice: number;
    vehicleName: string;
    vehicleImage?: string;
}

const DealBuilder: React.FC<DealBuilderProps> = ({ vehicleId, vehiclePrice, vehicleName, vehicleImage }) => {
    const navigate = useNavigate();
    // State
    const [downPayment, setDownPayment] = useState<number>(Math.round(vehiclePrice * 0.1)); // Default 10%
    const [term, setTerm] = useState<number>(72);
    const [creditTier, setCreditTier] = useState<CreditTier>('good');
    // Derived payment calculation instead of synchronous effect
    const payment = React.useMemo(() => {
        const result = calculateLoan(vehiclePrice, downPayment, term, creditTier);
        return result.monthlyPayment;
    }, [vehiclePrice, downPayment, term, creditTier]);

    // Derived Visuals for "Deserve It Meter" (Purchase Power)
    // Heuristic: If payment is < 15% of assumed income (mocked), it's "Great". 
    // Or simpler: High Down Payment + Good Credit = High Power.
    const purchasePowerScore = Math.min(100, Math.round(
        (downPayment / vehiclePrice * 50) + // Up to 50 pts for DP
        (creditTier === 'excellent' ? 50 : creditTier === 'good' ? 35 : creditTier === 'fair' ? 20 : 0) // Credit score pts
    ));

    const getPowerLabel = (score: number) => {
        if (score > 80) return { text: '¡Aprobación Inmediata!', color: 'text-emerald-400', bg: 'bg-emerald-500' };
        if (score > 50) return { text: 'Muy Probable', color: 'text-[#00aed9]', bg: 'bg-[#00aed9]' };
        return { text: 'Requiere Revisión', color: 'text-amber-400', bg: 'bg-amber-500' };
    };

    const power = getPowerLabel(purchasePowerScore);

    const handlePreQualify = () => {
        navigate('/qualify', {
            state: {
                vehicle: {
                    id: vehicleId,
                    name: vehicleName,
                    price: vehiclePrice,
                    image: vehicleImage
                },
                quote: {
                    monthlyPayment: payment,
                    downPayment: downPayment,
                    term: term,
                    creditTier: creditTier
                }
            }
        });
    };

    return (
        <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-[#00aed9]">
                <DollarSign size={200} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Diseña tu Trato</h3>
                        <p className="text-slate-400 text-xs">Personaliza tu plan sin compromiso.</p>
                    </div>
                </div>

                {/* MONTHLY PAYMENT HERO */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-center border border-slate-700 shadow-inner relative group">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Tu Mensualidad Estimada</p>
                    <div className="flex items-start justify-center gap-1 text-white">
                        <span className="text-2xl mt-2 font-bold opacity-50">$</span>
                        <span className="text-6xl md:text-7xl font-black tracking-tighter shadow-emerald-500/50 drop-shadow-sm">{payment.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">*Impuestos y tasas no incluidos. Sujeto a aprobación.</p>

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
                            <span className="text-[#00aed9]">${downPayment.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={vehiclePrice * 0.5}
                            step="500"
                            value={downPayment}
                            onChange={(e) => setDownPayment(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00aed9]"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                            <span>$0</span>
                            <span>${(vehiclePrice * 0.5).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Credit Score */}
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-3">Tu Historial de Crédito</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['excellent', 'good', 'fair', 'poor'] as CreditTier[]).map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => setCreditTier(tier)}
                                    className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all
                                        ${creditTier === tier
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
                            {[48, 60, 72, 84].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTerm(t)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${term === t ? 'bg-[#00aed9] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
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
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Poder de Compra</span>
                        <span className={`text-sm font-black ${power.color}`}>{power.text}</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${power.bg}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${purchasePowerScore}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={handlePreQualify}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={16} /> Pre-Aprobarme Ahora
                    </button>
                    {/* Optional secondary action */}
                </div>
            </div>
        </div>
    );
};

export default DealBuilder;
