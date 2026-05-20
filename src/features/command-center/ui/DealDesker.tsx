'use client';

'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Save,
  Target,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  FileDown,
  Sparkles,
  Award,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { calculateOTD, calculateLoan, CreditTier, FinancingStructure } from '@/entities/finance';
import {
  CONSTANTES_PR,
  PRODUCTOS_BACKEND_RANGOS,
  PREMIER_WARRANTY,
  calculateProductAmortization,
} from '@/entities/finance';
import { workspaceManager } from '@/features/automation/api/workspaceManager';
import { generatePDFFromDOM } from '@/features/sales-automation/lib/pdfGenerator';
import { BillOfSaleTemplate } from './BillOfSaleTemplate';

const DealDesker: React.FC = () => {
  // Frontend Control State
  const [vehiclePrice, setVehiclePrice] = useState(35000);
  const [tradeInValue, setTradeInValue] = useState(0);
  const [tradeInPayoff, setTradeInPayoff] = useState(0);
  const [downPayment, setDownPayment] = useState(2500);

  // Backend Control State (F&I Products)
  const [gapInsurance, setGapInsurance] = useState(0);
  const [extendedWarranty, setExtendedWarranty] = useState(0);
  const [paintProtection, setPaintProtection] = useState(0);
  const [powerPack, setPowerPack] = useState(0);

  // UX Control: Richard Mode (Oculta precios totales por defecto al cliente)
  const [showPrices, setShowPrices] = useState(false);

  // Terms Control State
  const [termMonths, setTermMonths] = useState(72);
  const [creditTier, setCreditTier] = useState<CreditTier>('good');

  // Unified Structure
  const currentStructure: FinancingStructure = {
    vehiclePrice,
    tradeInValue,
    tradeInPayoff,
    downPayment,
    gapInsurance,
    extendedWarranty,
    paintProtection,
    powerPack,
    creditLife: 0,
    termMonths,
    creditTier,
  };

  // Math Engine Calculations (Sync)
  const otdCalculation = calculateOTD(
    vehiclePrice,
    tradeInValue,
    tradeInPayoff,
    gapInsurance,
    extendedWarranty,
    paintProtection,
    0,
    powerPack,
  );

  const loanCalculation = calculateLoan(currentStructure);

  // Dynamic F&I Menu Packages Calculations (Covert selling strategy)
  const loanPlatinum = calculateLoan({
    ...currentStructure,
    extendedWarranty: PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    gapInsurance: PREMIER_WARRANTY.PRECIOS.GAP,
    paintProtection: PREMIER_WARRANTY.PRECIOS.CERAMICA,
    powerPack: PREMIER_WARRANTY.PRECIOS.POWER_PACK,
  });

  const loanGold = calculateLoan({
    ...currentStructure,
    extendedWarranty: PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    gapInsurance: PREMIER_WARRANTY.PRECIOS.GAP,
    paintProtection: PREMIER_WARRANTY.PRECIOS.CERAMICA,
    powerPack: 0,
  });

  const loanSilver = calculateLoan({
    ...currentStructure,
    extendedWarranty: PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    gapInsurance: PREMIER_WARRANTY.PRECIOS.GAP,
    paintProtection: 0,
    powerPack: 0,
  });

  const loanBase = calculateLoan({
    ...currentStructure,
    extendedWarranty: 0,
    gapInsurance: 0,
    paintProtection: 0,
    powerPack: 0,
  });

  // Amortized dynamic payment impacts for product-centric pitch
  const gapAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.GAP,
    termMonths,
    creditTier,
  );
  const warrantyAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    termMonths,
    creditTier,
  );
  const ceramicAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.CERAMICA,
    termMonths,
    creditTier,
  );
  const powerPackAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.POWER_PACK,
    termMonths,
    creditTier,
  );

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;

  const handleSaveDeal = async () => {
    try {
      const sessionId = workspaceManager.startSession();
      await workspaceManager.checkpointOperation(sessionId, 'FANDI_DEAL_DESKER', {
        params: currentStructure,
        results: {
          otd: otdCalculation,
          loan: loanCalculation,
        },
      });
      alert(
        `✅ Deal #${sessionId.substring(0, 6)} guardado exitosamente en el Workspace de Firebase.`,
      );
    } catch (error) {
      console.error(error);
      alert('⚠️ Error crítico guardando en el Workspace.');
    }
  };

  const handleExportPDF = async () => {
    try {
      await generatePDFFromDOM(
        'deal-desker-receipt',
        `BillOfSale_Richard_${new Date().getTime()}.pdf`,
      );
    } catch (error) {
      alert('⚠️ Error generando el formato PDF.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Hidden Print Template for PDF Engine */}
      <BillOfSaleTemplate
        structure={currentStructure}
        otdCalculation={otdCalculation}
        loanCalculation={loanCalculation}
      />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Calculator className="text-primary" size={32} /> Deal Desker (F&I)
          </h1>
          <p className="text-slate-500 font-medium">
            Herramienta ejecutiva para estructuración de negocios en PR. (IVU 11.5% Automático)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportPDF}
            title="Exportar documento Bill of Sale físico"
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileDown size={18} /> Exportar Bill of Sale
          </button>
          <button
            onClick={handleSaveDeal}
            title="Sincronizar cotización a Workflow CRM"
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Save size={18} /> Guardar al Workspace
          </button>
        </div>
      </header>

      {/* Main Grid: 4 Squares (The four square method) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 relative">
        {/* Cuadro 1: Frontend (Precio del Auto y Trade-In) */}
        <section className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Target size={150} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-6 relative z-10 uppercase tracking-widest text-primary">
            Cuadro 1: Valor del Trato (Frontend)
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Precio de Venta</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  title="Precio de Venta"
                  value={vehiclePrice || ''}
                  onChange={(e) => setVehiclePrice(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Valor Trade-In
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    title="Valor Trade-In"
                    value={tradeInValue || ''}
                    onChange={(e) => setTradeInValue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Deuda Trade-In
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    title="Deuda Trade-In"
                    value={tradeInPayoff || ''}
                    onChange={(e) => setTradeInPayoff(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">IVU Base</span>
                <span className="font-bold">{formatCurrency(otdCalculation.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">IVU Estatal (10.5%)</span>
                <span className="font-bold text-rose-500">
                  {formatCurrency(otdCalculation.stateTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">IVU Municipal (1%)</span>
                <span className="font-bold text-rose-500">
                  {formatCurrency(otdCalculation.municipalTax)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-500">Doc & Reg. Fees</span>
                <span className="font-bold text-slate-700">
                  {formatCurrency(otdCalculation.dealerFees)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cuadro 2: Backend (F&I Products) */}
        <section className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <ShieldCheck size={150} />
            </div>

            <div className="flex justify-between items-center mb-4 relative z-10">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest text-primary">
                  Cuadro 2: Protección F&I (Backend)
                </h2>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Productor: {PREMIER_WARRANTY.PRODUCER} •{' '}
                  <span className="text-amber-500 font-extrabold animate-pulse">
                    ⭐ PRODUCTO VITAL: CONTRATO DE SERVICIO
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrices(!showPrices)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  showPrices
                    ? 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {showPrices ? '🔓 Ocultar Precios' : '🔒 Modo Richard'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-4 relative z-10 border-l-2 border-amber-500 pl-3">
              <span className="font-extrabold text-slate-700">Estrategia de Venta Unificada:</span>{' '}
              Presenta al cliente el pago mensual total con los productos incluidos y listo. El{' '}
              <span className="text-amber-600 font-extrabold">Contrato de Servicio</span> es el
              componente vital e imprescindible para resguardar la transmisión, el motor y sistema
              eléctrico de su auto.
            </p>

            <div className="space-y-4 relative z-10">
              {/* Contrato de Servicio */}
              <div
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  extendedWarranty > 0
                    ? 'bg-amber-50/70 border-amber-500 shadow-md shadow-amber-200/50 scale-[1.02]'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                }`}
                onClick={() =>
                  setExtendedWarranty(
                    extendedWarranty === 0 ? PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO : 0,
                  )
                }
              >
                <div className="flex flex-col">
                  <span className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                    👑 Contrato de Servicio{' '}
                    <span className="text-[10px] font-black uppercase bg-amber-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                      ★ VITAL
                    </span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase mt-0.5">
                    Garantía VIP Oficial de Premier Warranty
                  </span>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span
                    className={`font-black text-base ${extendedWarranty > 0 ? 'text-amber-600' : 'text-slate-400'}`}
                  >
                    {extendedWarranty > 0 ? `+$${warrantyAmortized}/mes` : 'NO APLICA'}
                  </span>
                  {showPrices && (
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {formatCurrency(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO)}
                    </span>
                  )}
                </div>
              </div>

              {/* Seguro GAP */}
              <div
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  gapInsurance > 0
                    ? 'bg-emerald-50/50 border-emerald-500/30 shadow-sm shadow-emerald-100 scale-[1.01]'
                    : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/60'
                }`}
                onClick={() =>
                  setGapInsurance(gapInsurance === 0 ? PREMIER_WARRANTY.PRECIOS.GAP : 0)
                }
              >
                <div className="flex flex-col">
                  <span className="font-black text-slate-700 text-sm">Seguro GAP</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">
                    Protección por Pérdida Total
                  </span>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span
                    className={`font-black text-base ${gapInsurance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {gapInsurance > 0 ? `+$${gapAmortized}/mes` : 'NO APLICA'}
                  </span>
                  {showPrices && (
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {formatCurrency(PREMIER_WARRANTY.PRECIOS.GAP)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tratamiento Cerámica */}
              <div
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  paintProtection > 0
                    ? 'bg-emerald-50/50 border-emerald-500/30 shadow-sm shadow-emerald-100 scale-[1.01]'
                    : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/60'
                }`}
                onClick={() =>
                  setPaintProtection(paintProtection === 0 ? PREMIER_WARRANTY.PRECIOS.CERAMICA : 0)
                }
              >
                <div className="flex flex-col">
                  <span className="font-black text-slate-700 text-sm">Tratamiento Cerámica</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">
                    Protección de Pintura Exterior
                  </span>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span
                    className={`font-black text-base ${paintProtection > 0 ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {paintProtection > 0 ? `+$${ceramicAmortized}/mes` : 'NO APLICA'}
                  </span>
                  {showPrices && (
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {formatCurrency(PREMIER_WARRANTY.PRECIOS.CERAMICA)}
                    </span>
                  )}
                </div>
              </div>

              {/* Power Pack */}
              <div
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  powerPack > 0
                    ? 'bg-emerald-50/50 border-emerald-500/30 shadow-sm shadow-emerald-100 scale-[1.01]'
                    : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/60'
                }`}
                onClick={() =>
                  setPowerPack(powerPack === 0 ? PREMIER_WARRANTY.PRECIOS.POWER_PACK : 0)
                }
              >
                <div className="flex flex-col">
                  <span className="font-black text-slate-700 text-sm">Power Pack</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">
                    Kit de Entrega VIP y Aditivos
                  </span>
                </div>
                <div className="text-right flex flex-col justify-center">
                  <span
                    className={`font-black text-base ${powerPack > 0 ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {powerPack > 0 ? `+$${powerPackAmortized}/mes` : 'NO APLICA'}
                  </span>
                  {showPrices && (
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {formatCurrency(PREMIER_WARRANTY.PRECIOS.POWER_PACK)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-sm relative z-10">
            <span className="font-black text-slate-500 uppercase tracking-widest text-xs">
              Total F&I Añadido
            </span>
            <div className="text-right">
              <span className="font-black text-xl text-emerald-600 block">
                {`+$${
                  (extendedWarranty > 0 ? warrantyAmortized : 0) +
                  (gapInsurance > 0 ? gapAmortized : 0) +
                  (paintProtection > 0 ? ceramicAmortized : 0) +
                  (powerPack > 0 ? powerPackAmortized : 0)
                }/mes`}
              </span>
              {showPrices && (
                <span className="text-[10px] font-bold text-slate-400">
                  Total OTD: {formatCurrency(otdCalculation.totalBackendProducts)}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* F&I Menú de Paquetes de Pago: Estrategia de Cierre */}
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
                onClick={() => {
                  setExtendedWarranty(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
                  setGapInsurance(PREMIER_WARRANTY.PRECIOS.GAP);
                  setPaintProtection(PREMIER_WARRANTY.PRECIOS.CERAMICA);
                  setPowerPack(PREMIER_WARRANTY.PRECIOS.POWER_PACK);
                }}
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
                onClick={() => {
                  setExtendedWarranty(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
                  setGapInsurance(PREMIER_WARRANTY.PRECIOS.GAP);
                  setPaintProtection(PREMIER_WARRANTY.PRECIOS.CERAMICA);
                  setPowerPack(0);
                }}
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
                onClick={() => {
                  setExtendedWarranty(PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO);
                  setGapInsurance(PREMIER_WARRANTY.PRECIOS.GAP);
                  setPaintProtection(0);
                  setPowerPack(0);
                }}
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
                onClick={() => {
                  setExtendedWarranty(0);
                  setGapInsurance(0);
                  setPaintProtection(0);
                  setPowerPack(0);
                }}
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

        {/* Cuadro 3: Estructuración y Amortización */}
        <section className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TrendingUp size={150} />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 relative z-10">
            {/* Controles del Prestamo */}
            <div className="flex-1 space-y-6">
              <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-widest text-primary">
                Cuadro 3: Términos y Pronto
              </h2>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Pronto (Down Payment)
                </label>
                <input
                  type="range"
                  min="0"
                  max={50000}
                  step="500"
                  title="Pronto (Down Payment)"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="text-right font-black text-slate-700 text-lg">
                  {formatCurrency(downPayment)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Plazo (Meses)
                  </label>
                  <select
                    title="Plazo (Meses)"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {[48, 60, 72, 84].map((t) => (
                      <option key={t} value={t}>
                        {t} Meses
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Perfil de Crédito
                  </label>
                  <select
                    title="Perfil de Crédito"
                    value={creditTier}
                    onChange={(e) => setCreditTier(e.target.value as CreditTier)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="excellent">Excelente (A+)</option>
                    <option value="good">Bueno (A)</option>
                    <option value="fair">Regular (B)</option>
                    <option value="poor">Riesgo (C)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Panel de Cierre */}
            <div className="w-full lg:w-96 bg-slate-900 rounded-4xl p-8 text-white flex flex-col justify-between shadow-xl">
              <div>
                <h2 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-6">
                  El Checkpoint final
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                    <span className="text-sm font-medium text-slate-400">
                      Total OTD (Precio Final)
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      {formatCurrency(otdCalculation.outTheDoorPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                    <span className="text-sm font-medium text-slate-400">
                      Cantidad Financiada (Restando Pronto)
                    </span>
                    <span className="text-xl font-bold">
                      {formatCurrency(loanCalculation.principalFinanced)}
                    </span>
                  </div>

                  <div className="py-2 mt-2">
                    <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        LTV (Riesgo)
                      </span>
                      <span
                        className={`text-sm font-black ${loanCalculation.ltvRatio > 1.2 ? 'text-rose-500' : 'text-emerald-500'}`}
                      >
                        {(loanCalculation.ltvRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block animate-pulse">
                  PAGO MENSUAL TODO INCLUIDO (Y LISTO)
                </span>
                <div className="flex items-start text-white gap-1 mt-1">
                  <span className="text-2xl font-bold opacity-50 mt-2">$</span>
                  <span className="text-7xl font-black tracking-tighter text-emerald-400">
                    {loanCalculation.monthlyPayment}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500 bg-slate-800 py-1 px-3 rounded-md w-fit font-mono">
                  APR Proyectado: {loanCalculation.aprUsed.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DealDesker;
