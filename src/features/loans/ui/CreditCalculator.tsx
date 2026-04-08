import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Calendar, TrendingUp, ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const INTEREST_RATES = {
  excellent: 5.99, // 740+
  good: 7.49, // 680-739
  fair: 10.99, // 580-679
};

export const CreditCalculator: React.FC = () => {
  const [price, setPrice] = useState(45000);
  const [downPayment, setDownPayment] = useState(5000);
  const [term, setTerm] = useState(72);
  const [creditTier, setCreditTier] = useState<keyof typeof INTEREST_RATES>('excellent');

  const monthlyPayment = useMemo(() => {
    const principal = Math.max(0, price - downPayment);
    const annualRate = INTEREST_RATES[creditTier];
    const monthlyRate = annualRate / 100 / 12;

    if (monthlyRate === 0) return principal / term;

    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);

    return Math.round(payment);
  }, [price, downPayment, term, creditTier]);

  return (
    <section className="py-20 px-6 bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
            <Calculator size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest italic">
              Calculadora F&I Elite
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
            Diseña tu Plan de
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent italic">
              Financiamiento
            </span>
          </h2>

          <p className="text-slate-400 text-lg mb-8 max-w-lg leading-relaxed">
            Transparencia total desde el primer segundo. Ajusta los valores para encontrar el pago
            mensual que se adapte a tu estilo de vida.
          </p>

          <div className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl max-w-md">
            <Info size={20} className="text-cyan-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              *Estimados basados en crédito excelente (Tier 1). Las tasas finales dependen de la
              aprobación bancaria y el historial crediticio en Puerto Rico.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          {/* Result Display */}
          <div className="text-center mb-10 p-6 bg-gradient-to-b from-white/5 to-transparent rounded-3xl border border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 block">
              Pago Mensual Estimado
            </span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-black text-cyan-500/50 mt-4">$</span>
              <span className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums">
                {monthlyPayment.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            {/* Price Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign size={14} className="text-cyan-500" /> Precio del Auto
                </label>
                <div className="text-xl font-black text-white italic">
                  ${price.toLocaleString()}
                </div>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="1000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                aria-label="Ajustar precio del auto"
                title="Desliza para cambiar el precio"
              />
            </div>

            {/* Down Payment Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-cyan-500" /> Pronto / Down Payment
                </label>
                <div className="text-xl font-black text-white italic">
                  ${downPayment.toLocaleString()}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                aria-label="Ajustar pronto inicial"
                title="Desliza para cambiar el pronto"
              />
            </div>

            {/* Term & Credit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label
                  htmlFor="termSelect"
                  className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"
                >
                  <Calendar size={14} className="text-cyan-500" /> Término (Meses)
                </label>
                <select
                  id="termSelect"
                  className="w-full bg-[#0b1116] border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-cyan-500/50 transition-all outline-none appearance-none"
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  title="Seleccione el término en meses"
                >
                  <option value={48}>48 Meses</option>
                  <option value={60}>60 Meses</option>
                  <option value={72}>72 Meses</option>
                  <option value={84}>84 Meses</option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={14} className="text-cyan-500" /> Crédito Estimado
                </label>
                <div className="flex gap-2">
                  {(Object.keys(INTEREST_RATES) as Array<keyof typeof INTEREST_RATES>).map(
                    (tier) => (
                      <button
                        key={tier}
                        onClick={() => setCreditTier(tier)}
                        className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                          creditTier === tier
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                        }`}
                      >
                        {tier === 'excellent' ? '740+' : tier === 'good' ? '680+' : '580+'}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-black uppercase tracking-[0.2em] py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,174,217,0.4)] flex items-center justify-center gap-3 group mt-4">
              Aplicar Financiamiento
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
