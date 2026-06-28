'use client';

import React, { useState } from 'react';
import { Car } from '@/entities/inventory';
import {
  Calculator,
  Banknote,
  Zap,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Gift,
} from 'lucide-react';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import AnimatedNumber from './AnimatedNumber';

interface Props {
  car: Car;
  downPayment: number | '';
  tradeIn: number | '';
  term: number;
  creditRate: number;
  calculatedPayment: number;
  setDownPayment: (v: number | '') => void;
  setTradeIn: (v: number | '') => void;
  setTerm: (v: number) => void;
  setCreditRate: (v: number) => void;
}

const RATES = [
  { rate: 0.059, label: 'EXC' },
  { rate: 0.089, label: 'BUENO' },
  { rate: 0.145, label: 'REG' },
  { rate: 0.219, label: 'POB' },
] as const;

const BONO_WEB = 300;

const FinancialsTab: React.FC<Props> = ({
  car,
  downPayment,
  tradeIn,
  term,
  creditRate,
  calculatedPayment,
  setDownPayment,
  setTradeIn,
  setTerm,
  setCreditRate,
}) => {
  const [bonoApplied, setBonoApplied] = useState(false);

  const handleApplyBono = () => {
    if (bonoApplied) return;
    setBonoApplied(true);
    const current = typeof downPayment === 'number' ? downPayment : 0;
    setDownPayment(current + BONO_WEB);
  };

  return (
  <div className="h-full flex flex-col lg:flex-row gap-6">
    <div className="w-full lg:w-2/3 bg-slate-900/60 rounded-5xl border border-white/10 p-8 lg:p-12 overflow-y-auto custom-scrollbar shadow-2xl">
      <div className="flex items-center gap-2 mb-8">
        <Calculator size={24} className="text-cyan-400" />
        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
          Simulador de Aprobación
        </h3>
      </div>

      {/* Bono Web $300 Banner */}
      <button
        onClick={handleApplyBono}
        disabled={bonoApplied}
        className={`w-full mb-6 flex items-center justify-between px-6 py-4 rounded-3xl border transition-all ${bonoApplied ? 'bg-emerald-500/10 border-emerald-500/30 cursor-default' : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40 cursor-pointer'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bonoApplied ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
            <Gift size={18} className={bonoApplied ? 'text-emerald-400' : 'text-amber-400'} />
          </div>
          <div className="text-left">
            <p className={`text-[10px] font-black uppercase tracking-widest ${bonoApplied ? 'text-emerald-400' : 'text-amber-400'}`}>
              {bonoApplied ? '✓ Bono Web Aplicado' : 'Bono Web Exclusivo'}
            </p>
            <p className="text-xs text-slate-400 font-bold">
              {bonoApplied ? '$300 añadidos a tu pronto' : '$300 de descuento solo para visitas online'}
            </p>
          </div>
        </div>
        {!bonoApplied && (
          <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-[10px] font-black text-amber-400 uppercase tracking-widest whitespace-nowrap">
            Aplicar $300
          </span>
        )}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="ra-label-base flex items-center gap-2">
            <Banknote size={14} className="text-ra-primary" /> Pago Inicial (Pronto)
          </label>
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500 group-focus-within:text-ra-primary transition-colors">
              $
            </span>
            <input
              type="number"
              value={downPayment}
              onChange={(e) =>
                setDownPayment(e.target.value === '' ? '' : Number(e.target.value))
              }
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
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-500 group-focus-within:text-ra-primary transition-colors">
              $
            </span>
            <input
              type="number"
              value={tradeIn}
              onChange={(e) =>
                setTradeIn(e.target.value === '' ? '' : Number(e.target.value))
              }
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
            {RATES.map(({ rate, label }) => (
              <button
                key={rate}
                onClick={() => setCreditRate(rate)}
                className={`py-4 rounded-2xl text-xs font-black transition-all ${creditRate === rate ? 'bg-ra-primary text-slate-950 shadow-lg shadow-ra-primary/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="w-full lg:w-1/3 flex flex-col gap-6">
      <GlassContainer
        intensity="high"
        className="p-10 rounded-[48px] border-t-2 border-primary flex-1 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">
          Pago Mensual Estimado
        </p>
        <div className="text-7xl lg:text-8xl font-black text-white italic tracking-tighter mb-2">
          $<AnimatedNumber value={calculatedPayment} />
        </div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
          + Impuestos y Arbitrios
        </p>

        <div className="mt-12 w-full space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>Precio Unidad</span>
            <span className="text-white">${car.price.toLocaleString()}</span>
          </div>
          <div className="h-px w-full bg-white/5" />
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span>APR Estimado</span>
            <span className="text-cyan-400">{(creditRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-4xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
          <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-tight">
            <strong>Socio Financiero PR:</strong> Pago estimado basado en crédito de
            excelencia. Sujeto a aprobación por Banco Popular, FirstBank u Oriental.
            No incluye seguros ni arbitrios.
          </p>
        </div>
      </GlassContainer>
    </div>
  </div>
  );
};

export default FinancialsTab;
