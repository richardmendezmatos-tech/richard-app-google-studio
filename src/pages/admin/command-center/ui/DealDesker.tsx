import React, { useState } from 'react';
import {
  Calculator,
  Save,
  Target,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  FileDown,
} from 'lucide-react';
import { calculateOTD, calculateLoan, CreditTier, FinancingStructure } from '@/entities/finance';
import { CONSTANTES_PR, PRODUCTOS_BACKEND_RANGOS } from '@/entities/finance';
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
  );

  const loanCalculation = calculateLoan(currentStructure);

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
        <section className="bg-white rounded-4xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 p-8 opacity-5">
            <ShieldCheck size={150} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-6 relative z-10 uppercase tracking-widest text-primary">
            Cuadro 2: Productos F&I (Backend)
          </h2>

          <div className="space-y-6 relative z-10">
            <div
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() =>
                setGapInsurance(
                  gapInsurance === 0 ? PRODUCTOS_BACKEND_RANGOS.GAP_INSURANCE.default : 0,
                )
              }
            >
              <span className="font-bold text-slate-700">Seguro GAP</span>
              <span
                className={`font-black tracking-widest ${gapInsurance > 0 ? 'text-emerald-500' : 'text-slate-400'}`}
              >
                {gapInsurance > 0 ? formatCurrency(gapInsurance) : 'NO APLICA'}
              </span>
            </div>

            <div
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() =>
                setExtendedWarranty(
                  extendedWarranty === 0 ? PRODUCTOS_BACKEND_RANGOS.WARRANTY_EXT.default : 0,
                )
              }
            >
              <span className="font-bold text-slate-700">Garantía Extendida (RichCare)</span>
              <span
                className={`font-black tracking-widest ${extendedWarranty > 0 ? 'text-emerald-500' : 'text-slate-400'}`}
              >
                {extendedWarranty > 0 ? formatCurrency(extendedWarranty) : 'NO APLICA'}
              </span>
            </div>

            <div
              className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() =>
                setPaintProtection(
                  paintProtection === 0 ? PRODUCTOS_BACKEND_RANGOS.PAINT_PROTECTION.default : 0,
                )
              }
            >
              <span className="font-bold text-slate-700">Protección Cerámica Externa</span>
              <span
                className={`font-black tracking-widest ${paintProtection > 0 ? 'text-emerald-500' : 'text-slate-400'}`}
              >
                {paintProtection > 0 ? formatCurrency(paintProtection) : 'NO APLICA'}
              </span>
            </div>

            <div className="pt-4 flex justify-between items-center text-lg">
              <span className="font-bold text-slate-500">Total Backend</span>
              <span className="font-black text-slate-900">
                {formatCurrency(otdCalculation.totalBackendProducts)}
              </span>
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
            <div className="w-full lg:w-96 bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between shadow-xl">
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
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500 block">
                  Pago Mensual
                </span>
                <div className="flex items-start text-white gap-1 mt-1">
                  <span className="text-2xl font-bold opacity-50 mt-2">$</span>
                  <span className="text-7xl font-black tracking-tighter shadow-primary/50">
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
