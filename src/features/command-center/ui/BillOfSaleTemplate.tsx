import React from 'react';
import {
  FinancingStructure,
  PREMIER_WARRANTY,
  calculateProductAmortization,
} from '@/entities/finance';

interface BillOfSaleProps {
  structure: FinancingStructure;
  otdCalculation: any;
  loanCalculation: any;
}

export const BillOfSaleTemplate: React.FC<BillOfSaleProps> = ({
  structure,
  otdCalculation,
  loanCalculation,
}) => {
  const formatSec = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const tradeInValue = structure.tradeInValue || 0;
  const tradeInPayoff = structure.tradeInPayoff || 0;
  const gap = structure.gapInsurance || 0;
  const wty = structure.extendedWarranty || 0;
  const ceramic = structure.paintProtection || 0;
  const power = structure.powerPack || 0;
  const down = structure.downPayment || 0;

  // Calculo de amortización en cuotas para el PDF orientado a ventas
  const gapAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.GAP,
    structure.termMonths,
    structure.creditTier,
  );
  const warrantyAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.CONTRATO_SERVICIO,
    structure.termMonths,
    structure.creditTier,
  );
  const ceramicAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.CERAMICA,
    structure.termMonths,
    structure.creditTier,
  );
  const powerPackAmortized = calculateProductAmortization(
    PREMIER_WARRANTY.PRECIOS.POWER_PACK,
    structure.termMonths,
    structure.creditTier,
  );

  const totalFiCuota =
    (wty > 0 ? warrantyAmortized : 0) +
    (gap > 0 ? gapAmortized : 0) +
    (ceramic > 0 ? ceramicAmortized : 0) +
    (power > 0 ? powerPackAmortized : 0);

  return (
    <div
      id="deal-desker-receipt"
      // Posicionado fuera de pantalla para que no rompa el layout del Command Center
      className="absolute top-[-9999px] left-[-9999px] w-[800px] bg-white p-12 text-black font-sans shadow-none rounded-none"
    >
      <div className="flex justify-between items-end border-b-4 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Richard Automotive</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">
            Estructuración Financiera Oficial
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-400">FECHA</p>
          <p className="text-lg font-black">{new Date().toLocaleDateString('es-PR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Condiciones de Venta (Frontend)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Precio Vehículo</span>
              <span className="font-black">{formatSec(structure.vehiclePrice)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Crédito por Trade-In</span>
              <span className="font-black text-emerald-600">-{formatSec(tradeInValue)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Deuda Restante Trade-In (Payoff)</span>
              <span className="font-black text-rose-600">+{formatSec(tradeInPayoff)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Equidad Efectiva OTD</span>
              <span className="font-black">
                {formatSec(structure.vehiclePrice - tradeInValue + tradeInPayoff)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Métricas de Impuesto (IVU PR)
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">
                Base Imponible (Solo Precio - Equidad)
              </span>
              <span className="font-black">{formatSec(otdCalculation.taxableAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">IVU Estatal (10.5%)</span>
              <span className="font-black">{formatSec(otdCalculation.stateTax)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">IVU Municipal (1%)</span>
              <span className="font-black">{formatSec(otdCalculation.municipalTax)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-600">Cargos Administrativos (Doc / Reg)</span>
              <span className="font-black">{formatSec(otdCalculation.dealerFees)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          Garantías de Protección Activas — {PREMIER_WARRANTY.PRODUCER}
        </h2>
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 gap-3.5">
            {/* Contrato de Servicio */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                wty > 0
                  ? 'bg-amber-50/40 border-amber-300 text-amber-900'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-extrabold text-sm flex items-center gap-1.5 text-slate-900">
                  👑 Contrato de Servicio Premier{' '}
                  <span className="text-[9px] font-black uppercase bg-amber-600 text-white px-2 py-0.5 rounded tracking-wider">
                    BENEFICIO VITAL
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Protección VIP contra averías mecánicas y eléctricas de transmisión, motor y aire
                  acondicionado.
                </span>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${wty > 0 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                {wty > 0 ? '✓ INCLUIDO Y ACTIVO' : 'EXCLUIDO'}
              </span>
            </div>

            {/* Seguro GAP */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                gap > 0
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900">
                  🛡️ Cobertura GAP Total (Pérdida Total)
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Protección de saldo contra pérdida o robo total de la unidad.
                </span>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${gap > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                {gap > 0 ? '✓ INCLUIDO Y ACTIVO' : 'EXCLUIDO'}
              </span>
            </div>

            {/* Tratamiento Cerámica */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                ceramic > 0
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900">
                  ✨ Tratamiento de Cerámica Profesional
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Sellador protector nanotecnológico para preservación del brillo exterior.
                </span>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${ceramic > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                {ceramic > 0 ? '✓ INCLUIDO Y ACTIVO' : 'EXCLUIDO'}
              </span>
            </div>

            {/* Power Pack */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border ${
                power > 0
                  ? 'bg-slate-900 text-white border-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-900">
                  ⚡ Power Pack VIP (Kit de Entrega)
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  Cuidado estético integral y kit de bienvenida oficial.
                </span>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${power > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                {power > 0 ? '✓ INCLUIDO Y ACTIVO' : 'EXCLUIDO'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 bg-slate-900 text-white p-8 rounded-4xl mb-12">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Resumen de Liquidación
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-700 pb-2">
              <span className="font-bold text-slate-300">Total OTD (Precio Final)</span>
              <span className="text-xl font-black">
                {formatSec(otdCalculation.outTheDoorPrice)}
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-slate-700 pb-2">
              <span className="font-bold text-slate-300">Pronto (Cash Down)</span>
              <span className="text-xl font-black text-emerald-400">-{formatSec(down)}</span>
            </div>
            <div className="flex justify-between items-end border-b border-slate-700 pb-2">
              <span className="font-bold text-emerald-400">Monto Total a Financiar</span>
              <span className="text-2xl font-black">
                {formatSec(loanCalculation.principalFinanced)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
            Pago Mensual Todo Incluido (Y Listo)
          </h2>
          <p className="text-6xl font-black tracking-tighter mb-2 text-emerald-400">
            ${loanCalculation.monthlyPayment}
          </p>
          <div className="flex flex-col items-end gap-1 text-sm font-bold text-slate-400">
            <span className="bg-slate-800 px-3 py-1 rounded max-w-max">
              Plazo: {structure.termMonths} Meses
            </span>
            <span className="bg-slate-800 px-3 py-1 rounded max-w-max">
              A.P.R Estimado: {loanCalculation.aprUsed.toFixed(2)}%
            </span>
            <span className="bg-slate-800 px-3 py-1 rounded max-w-max uppercase">
              Perfil: {structure.creditTier} (LTV: {(loanCalculation.ltvRatio * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-bold max-w-2xl mx-auto uppercase tracking-widest">
        <p>Documento de estructuración preliminar.</p>
        <p>
          Las tasas y pagos finales están sujetos a aprobación crediticia final por la institución
          bancaria.
        </p>
      </div>
    </div>
  );
};
