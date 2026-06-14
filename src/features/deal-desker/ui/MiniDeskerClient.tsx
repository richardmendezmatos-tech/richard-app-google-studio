// MiniDeskerClient - Calculadora Pública de Precualificación (CRO)
// Capa: Features - Slice: deal-desker - UI
// Creado: 2026-05-24
// Aesthetics: Sleek Glassmorphic card, Harmonic color palette (emerald & indigo), premium feedback micro-animations.

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { getSuggestedAPR } from '../lib/fiCalculator';
import { CreditTier } from '@/entities/deal/model/types';

export const MiniDeskerClient: React.FC = () => {
  // Parámetros de Precualificación
  const [downPayment, setDownPayment] = useState<number>(3000);
  const [targetMonthlyPayment, setTargetMonthlyPayment] = useState<number>(450);
  const [creditTier, setCreditTier] = useState<CreditTier>('tier_2');
  const [term, setTerm] = useState<number>(72);

  // Estados de Inventario y Lead Form
  const [inventory, setInventory] = useState<any[]>([]);
  const [matchingCars, setMatchingCars] = useState<any[]>([]);
  const [maxVehiclePrice, setMaxVehiclePrice] = useState<number>(0);

  // Lead Form Modal
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Cargar inventario elegible desde API Route
  useEffect(() => {
    async function fetchEligibleInventory() {
      try {
        const res = await fetch('/api/inventory/available');
        const data = await res.json();
        if (Array.isArray(data)) setInventory(data);
      } catch (err) {
        console.error('Error fetching public inventory:', err);
      }
    }
    fetchEligibleInventory();
  }, []);

  // Calcular el precio máximo del vehículo financiable en tiempo real
  useEffect(() => {
    const apr = getSuggestedAPR(creditTier, term);
    const r = apr / 12 / 100; // Tasa mensual decimal
    const n = term; // Meses

    let maxFinanced: number;
    if (r > 0) {
      // PV = P * [1 - (1 + r)^(-n)] / r
      maxFinanced = (targetMonthlyPayment * (1 - Math.pow(1 + r, -n))) / r;
    } else {
      maxFinanced = targetMonthlyPayment * term;
    }

    const calculatedMaxPrice = maxFinanced + downPayment;
    setMaxVehiclePrice(Math.round(calculatedMaxPrice));

    // Filtrar inventario que se ajuste al presupuesto
    if (inventory.length > 0) {
      const matched = inventory.filter(car => car.price <= calculatedMaxPrice);
      setMatchingCars(matched);
    }
  }, [downPayment, targetMonthlyPayment, creditTier, term, inventory]);

  const handlePreQualifyClick = (car: any) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadPhone) {
      alert('⚠️ Por favor ingresa tu nombre y teléfono.');
      return;
    }
    setIsSubmitting(true);
    try {
      const apr = getSuggestedAPR(creditTier, term);
      const message = selectedCar
        ? `Precualificación automática para ${selectedCar.year} ${selectedCar.make} ${selectedCar.model} - Presupuesto: $${targetMonthlyPayment}/mes, Pronto: $${downPayment}.`
        : `Precualificación automática - Presupuesto: $${targetMonthlyPayment}/mes, Pronto: $${downPayment}.`;

      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName,
          leadPhone,
          leadEmail,
          carVin: selectedCar?.vin || null,
          downPayment,
          targetMonthlyPayment,
          creditTier,
          term,
          apr,
          message,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        setLeadName('');
        setLeadPhone('');
        setLeadEmail('');
      }, 3000);

    } catch (err: any) {
      alert(`❌ Error al enviar precualificación: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      {/* HUD de Precualificación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel de Entrada (Sliders) */}
        <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-lg rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <Calculator className="text-emerald-400" size={24} />
            <div>
              <h2 className="text-sm font-black uppercase text-slate-100 tracking-wider">Configura tu Presupuesto</h2>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Vega Alta, Puerto Rico</span>
            </div>
          </div>

          {/* Pago Mensual Ideal */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-400">Pago Mensual Ideal</span>
              <span className="text-emerald-400">${targetMonthlyPayment}/mes</span>
            </div>
            <input
              type="range"
              min={250}
              max={1500}
              step={25}
              title="Pago Mensual"
              value={targetMonthlyPayment}
              onChange={(e) => setTargetMonthlyPayment(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Pronto Pago */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-black">
              <span className="text-slate-400">Tu Pronto Pago</span>
              <span className="text-indigo-400">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={0}
              max={25000}
              step={500}
              title="Pronto Pago"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Crédito */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Perfil de Crédito Estimado</label>
            <select
              title="Perfil de Crédito"
              value={creditTier}
              onChange={(e) => setCreditTier(e.target.value as CreditTier)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="tier_1">Excelente (A+ / 740+)</option>
              <option value="tier_2">Bueno (A / 700-739)</option>
              <option value="tier_3">Regular (B / 640-699)</option>
              <option value="tier_4">Estableciendo (C / &lt;640)</option>
            </select>
          </div>

          {/* Plazo */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Plazo de Financiamiento</label>
            <div className="grid grid-cols-3 gap-2">
              {[60, 72, 84].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    term === t
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Resultados (Inventario en Caliente) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[9px] text-emerald-400 uppercase font-black tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/50">
                Poder Financiero
              </span>
              <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight mt-1.5">
                Calificas para un precio hasta:
              </h3>
            </div>
            <div className="flex items-baseline text-emerald-400 gap-1 bg-emerald-950/20 px-5 py-2.5 rounded-2xl border border-emerald-900/40">
              <span className="text-3xl font-black">${maxVehiclePrice.toLocaleString()}</span>
              <span className="text-xs text-slate-500 font-bold">OTD Proyectado</span>
            </div>
          </div>

          {/* Listado de Autos Filtrados */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                Inventario que califica ({matchingCars.length})
              </span>
              {matchingCars.length > 0 && (
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="animate-pulse" /> Listo para entrega en Vega Alta
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchingCars.length > 0 ? (
                matchingCars.slice(0, 4).map(car => {
                  const carImage = Array.isArray(car.images) && car.images[0]
                    ? car.images[0]
                    : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400';
                  
                  return (
                    <motion.div
                      layout
                      key={car.vin}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
                    >
                      <div className="space-y-3">
                        <div className="h-40 rounded-xl overflow-hidden relative bg-slate-950">
                          <img
                            src={carImage}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5 text-[10px] font-black tracking-widest uppercase">
                            {car.year}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-200 text-sm uppercase tracking-tight">
                            {car.make} {car.model}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                            Vega Alta • En Inventario
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Precio</span>
                          <span className="text-sm font-black text-slate-200">${car.price?.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handlePreQualifyClick(car)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                        >
                          Precualificar <ChevronRight size={12} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-2 bg-slate-900/40 border border-slate-900/60 p-12 text-center rounded-3xl space-y-3">
                  <HelpCircle size={40} className="mx-auto text-slate-600 opacity-30" />
                  <h4 className="text-sm font-black text-slate-400 uppercase">Ninguna unidad califica</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Prueba a incrementar un poco tu pronto pago o a ajustar tu pago mensual para calificar a los vehículos en nuestro catálogo físico.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Contacto para Precualificación */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-3xl p-6 border border-slate-800 max-w-md w-full shadow-2xl relative"
            >
              {/* Cerrar */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
                <Sparkles className="text-emerald-400" size={20} />
                <div>
                  <h3 className="font-black text-slate-100 uppercase text-xs tracking-wider">Precualificación Express</h3>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mt-0.5">Richard Automotive Vega Alta</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/60 mb-5">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Unidad de interés</div>
                <div className="font-black text-slate-200 text-sm mt-0.5">
                  {selectedCar?.year} {selectedCar?.make} {selectedCar?.model}
                </div>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-900 text-xs">
                  <span className="text-slate-500">Pronto Pago</span>
                  <span className="font-bold text-slate-300">${downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Pago Estimado</span>
                  <span className="font-bold text-emerald-400">${targetMonthlyPayment}/mes</span>
                </div>
              </div>

              {submitSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="text-emerald-400 mx-auto" size={48} />
                  <h4 className="text-sm font-black text-slate-100 uppercase">¡Felicidades, preaprobado!</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Richard se comunicará contigo por WhatsApp en los próximos minutos para completar tu radicación de crédito.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Nombre Completo</label>
                    <input
                      type="text"
                      title="Nombre"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Número de Teléfono</label>
                    <input
                      type="tel"
                      title="Telefono"
                      required
                      placeholder="Ej. 787-555-1234"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-black">Correo Electrónico (Opcional)</label>
                    <input
                      type="email"
                      title="Email"
                      placeholder="juan@perez.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/40"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : null}
                    Confirmar Precualificación Express
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
