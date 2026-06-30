'use client';

import React from 'react';
import { Sparkles, CheckCircle, Award, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useDealCalculations } from '../lib/useDealCalculations';

type DealCalcs = ReturnType<typeof useDealCalculations>;

type Props = Pick<
  DealCalcs,
  | 'termMonths'
  | 'loanCalculation'
  | 'loanPlatinum'
  | 'loanGold'
  | 'loanSilver'
  | 'loanBase'
  | 'applyPlatinum'
  | 'applyGold'
  | 'applySilver'
  | 'applyBase'
  | 'extendedWarranty'
  | 'gapInsurance'
  | 'paintProtection'
  | 'powerPack'
>;

/**
 * Menú de Paquetes de Pago F&I (Platinum/Gold/Silver/Base) extraído de DealDesker.
 * Componente presentacional: muestra los pagos ya calculados por useDealCalculations
 * y dispara los handlers apply* para aplicar cada paquete.
 */
export function FAndIPackageMenu({
  termMonths,
  loanCalculation,
  loanPlatinum,
  loanGold,
  loanSilver,
  loanBase,
  applyPlatinum,
  applyGold,
  applySilver,
  applyBase,
  extendedWarranty,
  gapInsurance,
  paintProtection,
  powerPack,
}: Props) {
  return (
        <section className="bg-slate-900 rounded-4xl p-8 border border-slate-800 shadow-2xl col-span-1 lg:col-span-2 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <Sparkles size={250} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-800 pb-6">
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-900/50">
                  Estrategia de Cierre Premium
                </span>
                <h2 className="text-2xl font-black uppercase tracking-widest text-slate-100 flex items-center gap-2 mt-2">
                  <Sparkles className="text-emerald-400 animate-pulse" size={24} /> Menú de Paquetes
                  de Protección
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Presenta pagos todo incluido de Premier Warranty Services. Diseñado para aumentar
                  el ticket F&I de forma covert y fluida.
                </p>
              </div>
              <div className="mt-4 md:mt-0 bg-emerald-950/40 px-4 py-2.5 rounded-2xl border border-emerald-800/30 text-xs font-bold text-emerald-300 flex items-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Estructura Activa: {termMonths} Meses a {loanCalculation.aprUsed.toFixed(1)}% APR
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* PLATINUM VIP */}
              <div
                onClick={applyPlatinum}
                className={`group relative rounded-3xl p-6 cursor-pointer border transition-all flex flex-col justify-between h-[360px] ${
                  extendedWarranty > 0 && gapInsurance > 0 && paintProtection > 0 && powerPack > 0
                    ? 'bg-gradient-to-br from-slate-900 to-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50 scale-[1.03]'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/40'
                }`}
              >
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-black uppercase bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    VIP / Recomendado
                  </span>
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                    Platinum VIP
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                    Protección Absoluta
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-350">
                      <CheckCircle size={14} className="text-amber-500 shrink-0" />
                      <span className="font-extrabold text-amber-300">
                        Contrato Servicio 👑 [VITAL]
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      <span>Seguro GAP Total</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      <span>Tratamiento Cerámica</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      <span>Power Pack de Entrega</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900">
                  <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block animate-pulse">
                    PAGO MENSUAL TODO INCLUIDO
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-emerald-400">
                      ${loanPlatinum.monthlyPayment}
                    </span>
                    <span className="text-xs text-slate-400">/mes</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                    (Solo +${loanPlatinum.monthlyPayment - loanBase.monthlyPayment}/mes vs Base)
                  </span>
                </div>
              </div>

              {/* GOLD PREMIUM */}
              <div
                onClick={applyGold}
                className={`group relative rounded-3xl p-6 cursor-pointer border transition-all flex flex-col justify-between h-[360px] ${
                  extendedWarranty > 0 && gapInsurance > 0 && paintProtection > 0 && powerPack === 0
                    ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/30 scale-[1.03]'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/60 hover:bg-slate-950/70'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                    Gold Premium
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                    Tranquilidad Total
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-350">
                      <CheckCircle size={14} className="text-amber-500 shrink-0" />
                      <span className="font-extrabold text-amber-300">
                        Contrato Servicio 👑 [VITAL]
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-amber-400 shrink-0" />
                      <span>Seguro GAP Total</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-amber-400 shrink-0" />
                      <span>Tratamiento Cerámica</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 opacity-40">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-black shrink-0">
                        X
                      </span>
                      <span>Power Pack Excluido</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900">
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black block">
                    PAGO MENSUAL TODO INCLUIDO
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-amber-400">
                      ${loanGold.monthlyPayment}
                    </span>
                    <span className="text-xs text-slate-400">/mes</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                    (Solo +${loanGold.monthlyPayment - loanBase.monthlyPayment}/mes vs Base)
                  </span>
                </div>
              </div>

              {/* SILVER CORE */}
              <div
                onClick={applySilver}
                className={`group relative rounded-3xl p-6 cursor-pointer border transition-all flex flex-col justify-between h-[360px] ${
                  extendedWarranty > 0 &&
                  gapInsurance > 0 &&
                  paintProtection === 0 &&
                  powerPack === 0
                    ? 'bg-gradient-to-br from-slate-900 to-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/30 scale-[1.03]'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/60 hover:bg-slate-950/70'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider">
                    Silver Core
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                    Cobertura Esencial
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-350">
                      <CheckCircle size={14} className="text-amber-500 shrink-0" />
                      <span className="font-extrabold text-amber-300">
                        Contrato Servicio 👑 [VITAL]
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle size={14} className="text-indigo-400 shrink-0" />
                      <span>Seguro GAP Total</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 opacity-40">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-black shrink-0">
                        X
                      </span>
                      <span>Cerámica Excluida</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 opacity-40">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-black shrink-0">
                        X
                      </span>
                      <span>Power Pack Excluido</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black block">
                    PAGO MENSUAL TODO INCLUIDO
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-indigo-400">
                      ${loanSilver.monthlyPayment}
                    </span>
                    <span className="text-xs text-slate-400">/mes</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                    (Solo +${loanSilver.monthlyPayment - loanBase.monthlyPayment}/mes vs Base)
                  </span>
                </div>
              </div>

              {/* BASE BARE */}
              <div
                onClick={applyBase}
                className={`group relative rounded-3xl p-6 cursor-pointer border transition-all flex flex-col justify-between h-[360px] ${
                  extendedWarranty === 0 &&
                  gapInsurance === 0 &&
                  paintProtection === 0 &&
                  powerPack === 0
                    ? 'bg-gradient-to-br from-slate-900 to-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/30 scale-[1.03]'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700/60 hover:bg-slate-950/70'
                }`}
              >
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-black uppercase bg-rose-600/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                    ⚠️ SIN COBERTURA VITAL
                  </span>
                </div>

                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={20} className="text-rose-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider text-rose-300">
                    Base Vehículo
                  </h3>
                  <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase">
                    UNIDAD EXPUESTA
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-rose-500/80 font-bold">
                      <span className="w-3.5 h-3.5 rounded-full border border-rose-500/50 flex items-center justify-center text-[8px] font-black shrink-0 bg-rose-950/40">
                        !
                      </span>
                      <span>Contrato Servicio Excluido ⚠️</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-550 opacity-40">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-750 flex items-center justify-center text-[8px] font-black shrink-0">
                        X
                      </span>
                      <span>Seguro GAP Excluido</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-550 opacity-40">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-750 flex items-center justify-center text-[8px] font-black shrink-0">
                        X
                      </span>
                      <span>Cerámica Excluida</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-550 opacity-40">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-750 flex items-center justify-center text-[8px] font-black shrink-0">
                        X
                      </span>
                      <span>Power Pack Excluido</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900">
                  <span className="text-[10px] text-rose-500 uppercase tracking-widest font-black block">
                    PAGO MÍNIMO (SIN PROTECCIÓN)
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-rose-400">
                      ${loanBase.monthlyPayment}
                    </span>
                    <span className="text-xs text-slate-400">/mes</span>
                  </div>
                  <span className="text-[9px] text-rose-600 block font-bold mt-1 uppercase tracking-tighter">
                    ¡Cliente Asume 100% del Riesgo!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
  );
}
