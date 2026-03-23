import React, { useState, useMemo } from 'react';
import { procesarTradeInFinanciado } from '../application/ProcesarTradeInFinanciado';
import {
  generarPersuasionVenta,
  ArgumentoVentaUnidad,
} from '../application/GenerarPersuasionVenta';
import { UnidadTradeIn, CotizacionFinanciera } from '../domain/TradeIn';

export const TradeInCalculator: React.FC = () => {
  // Estado de la Operación y UI
  const [precioNueva, setPrecioNueva] = useState<number>(45000);
  const [prontoCash, setProntoCash] = useState<number>(5000);
  const [creditScore, setCreditScore] = useState<number>(720);
  const [meses, setMeses] = useState<number>(72);

  // Estado de la Unidad de Trade-In
  const [vin, setVin] = useState('');
  const [valorTasacion, setValorTasacion] = useState<number>(0);
  const [deudaTradeIn, setDeudaTradeIn] = useState<number>(0);

  // Estado de Persuasión de Venta (IA)
  const [argumentoIA, setArgumentoIA] = useState<ArgumentoVentaUnidad | null>(null);

  const cotizacion = useMemo(() => {
    try {
      const tradeIn: UnidadTradeIn | undefined =
        valorTasacion > 0
          ? {
              vin,
              marca: 'Unidad Cliente', // Placeholder
              modelo: 'Genérico', // Placeholder
              anio: 2020,
              millaje: 0,
              valorTasacion,
              deudaPendiente: deudaTradeIn,
            }
          : undefined;

      return procesarTradeInFinanciado.execute({
        precioUnidadNueva: precioNueva,
        tradeIn,
        prontoCash,
        terminoMeses: meses,
        creditScore,
      });
    } catch (error) {
      console.error('Error calculando cotización:', error);
      return null;
    }
  }, [precioNueva, prontoCash, creditScore, meses, vin, valorTasacion, deudaTradeIn]);

  const handleGenerarPropuesta = () => {
    if (cotizacion) {
      const script = generarPersuasionVenta.execute({
        cotizacion,
        nombreCliente: 'Cliente Valioso',
      });
      setArgumentoIA(script);
    }
  };

  return (
    <div className="trade-in-calculator-container p-6 bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 backdrop-blur-xl bg-opacity-80 max-w-6xl mx-auto my-10">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400">Richard Automotive</h2>
          <p className="text-slate-400 text-sm">Command Center - Sistema de Ventas Inteligente</p>
        </div>
        <div className="bg-cyan-500/10 px-4 py-1 rounded-full border border-cyan-500/20">
          <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">
            Sentinel Active v2.0
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Entradas */}
        <section className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 border-l-4 border-cyan-500 pl-3">
            Datos de Operación
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="precioNueva"
                className="block text-xs font-medium text-slate-500 uppercase mb-1"
              >
                Precio Unidad Nueva
              </label>
              <input
                id="precioNueva"
                type="number"
                value={precioNueva}
                onChange={(e) => setPrecioNueva(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prontoCash"
                  className="block text-xs font-medium text-slate-500 uppercase mb-1"
                >
                  Pronto Cash
                </label>
                <input
                  id="prontoCash"
                  type="number"
                  value={prontoCash}
                  onChange={(e) => setProntoCash(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="creditScore"
                  className="block text-xs font-medium text-slate-500 uppercase mb-1"
                >
                  Credit Score
                </label>
                <input
                  id="creditScore"
                  type="number"
                  value={creditScore}
                  onChange={(e) => setCreditScore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="meses"
                className="block text-xs font-medium text-slate-500 uppercase mb-1"
              >
                Término (Meses)
              </label>
              <select
                id="meses"
                value={meses}
                onChange={(e) => setMeses(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
              >
                {[36, 48, 60, 72, 84].map((m) => (
                  <option key={m} value={m}>
                    {m} meses
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-200 mt-8 mb-4 border-l-4 border-orange-500 pl-3">
            Unidad de Trade-In
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="valorTasacion"
                className="block text-xs font-medium text-slate-500 uppercase mb-1"
              >
                Valor Tasación
              </label>
              <input
                id="valorTasacion"
                type="number"
                value={valorTasacion}
                onChange={(e) => setValorTasacion(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="deudaTradeIn"
                className="block text-xs font-medium text-slate-500 uppercase mb-1"
              >
                Deuda Pendiente
              </label>
              <input
                id="deudaTradeIn"
                type="number"
                value={deudaTradeIn}
                onChange={(e) => setDeudaTradeIn(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* PANEL CENTRAL: Cálculos y Resultados */}
        <section className="space-y-6">
          <div className="p-8 bg-cyan-600 rounded-3xl shadow-xl shadow-cyan-900/40 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase opacity-80 mb-2">Pago Mensual Estimado</p>
              <div className="text-5xl font-black mb-2 antialiased">
                ${cotizacion?.pagoMensualEstimado.toLocaleString() ?? '0'}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium opacity-90">
                <span className="bg-white/20 px-2 py-0.5 rounded uppercase">{meses} meses</span>
                <span className="bg-white/20 px-2 py-0.5 rounded uppercase">
                  {cotizacion?.apr ?? 0}% APR
                </span>
              </div>
            </div>
            {/* Decoration background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          </div>

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              Métricas Operacionales
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Monto a Financiar</p>
                <p className="text-xl font-bold text-slate-100">
                  ${cotizacion?.montoAFinanciar.toLocaleString() ?? '0'}
                </p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Equidad Neta</p>
                <p
                  className={`text-xl font-bold ${valorTasacion - deudaTradeIn >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  ${(valorTasacion - deudaTradeIn).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerarPropuesta}
            className="w-full py-4 bg-linear-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            Generar Argumentos IA
          </button>
        </section>

        {/* PANEL DERECHO: Inteligencia y Persuasión */}
        <section className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            Venta Asistida por IA
          </h3>

          {argumentoIA ? (
            <div className="space-y-6 flex-1">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <h4 className="text-purple-400 font-bold text-sm mb-2">{argumentoIA.headline}</h4>
                <ul className="space-y-3">
                  {argumentoIA.points.map((point: string, i: number) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-purple-400 font-bold rounded-xl border border-purple-500/30 transition-all flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copiar Argumentos
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-400">
                Configure la operación para habilitar la persuasión asistida
              </p>
            </div>
          )}
        </section>
      </div>

      <footer className="mt-12 text-center border-t border-slate-800/50 pt-6">
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-left">
            <p className="text-[10px] text-slate-500 uppercase">Health Score</p>
            <p className="text-xs font-bold text-green-500">OPTIMAL (98.2)</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-500 uppercase">Operational Status</p>
            <p className="text-xs font-bold text-cyan-500">COMMANDER READY</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
          Propiedad de Richard Automotive Group - 2026
        </p>
      </footer>

      <style>{`
        .trade-in-calculator-container input[type=number]::-webkit-inner-spin-button, 
        .trade-in-calculator-container input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .trade-in-calculator-container {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};
