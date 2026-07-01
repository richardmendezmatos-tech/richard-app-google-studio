'use client';

import React, { useState, useMemo } from 'react';
import { DollarSign, Activity, ChevronRight } from 'lucide-react';
import { Car } from '@/entities/inventory';
import { getCarImage } from '@/entities/inventory/lib/carImage';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

interface Props {
  inventory: Car[];
}

/**
 * Tab "Presupuesto Inteligente" extraído de SentinelDiscoverySuite.
 * Autónomo: gestiona su propio estado de sliders (monthlyBudget/downPayment)
 * y deriva el poder adquisitivo + unidades accesibles a partir del inventario.
 */
export function BudgetTab({ inventory }: Props) {
  const navigate = useNavigate();
  const [monthlyBudget, setMonthlyBudget] = useState<number>(450);
  const [downPayment, setDownPayment] = useState<number>(2000);

  const estimatedPurchasingPower = useMemo(() => {
    return monthlyBudget * 65 + downPayment;
  }, [monthlyBudget, downPayment]);

  const accessibleCars = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    const sorted = [...inventory].sort((a, b) => (a.price || 0) - (b.price || 0));
    const filtered = sorted.filter((car) => (car.price || 0) <= estimatedPurchasingPower + 3000);
    return filtered.length > 0 ? filtered.slice(0, 4) : sorted.slice(0, 4);
  }, [inventory, estimatedPurchasingPower]);

  return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 animate-in fade-in duration-500">
          {/* Columna Izquierda: Sliders Líquidos */}
          <div className="lg:col-span-5 space-y-6 bg-slate-950/40 p-6 rounded-3xl border border-white/5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-tech text-slate-400 uppercase tracking-wider">
                  Pago Mensual Ideal
                </label>
                <span className="text-lg font-black text-cyan-400 font-tech">
                  ${monthlyBudget} <span className="text-[10px] text-slate-500">/mes</span>
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={1500}
                step={25}
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] text-slate-600 font-tech mt-1">
                <span>$200</span>
                <span>$850</span>
                <span>$1,500+</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-tech text-slate-400 uppercase tracking-wider">
                  Pronto Disponible
                </label>
                <span className="text-lg font-black text-blue-400 font-tech">
                  ${downPayment.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15000}
                step={500}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-slate-600 font-tech mt-1">
                <span>$0</span>
                <span>$7,500</span>
                <span>$15,000</span>
              </div>
            </div>

            {/* Medidor de Poder Adquisitivo Estimado */}
            <div className="border-t border-white/10 pt-4 mt-6">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={14} className="text-emerald-400" />
                <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest">
                  Poder Adquisitivo Sugerido
                </span>
              </div>
              <p className="text-3xl font-black text-white font-cinematic">
                ${estimatedPurchasingPower.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-sans font-normal">aprox.</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Basado en estimación actuarial estándar. Ajustamos los términos directos con
                nuestros bancos para garantizar tu aprobación.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Grilla Reactiva de Unidades Compatibles */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-tech text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={12} className="text-cyan-400 animate-pulse" /> Unidades Compatibles
                al Instante ({accessibleCars.length})
              </span>
              <span className="text-[10px] text-cyan-500 font-tech animate-pulse">
                ACTUALIZACIÓN EN VIVO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accessibleCars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`)}
                  className="group relative bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-all duration-300 flex flex-col"
                >
                  <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                    <OptimizedImage
                      src={getCarImage(car)}
                      alt={car.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[8px] font-tech text-cyan-400 uppercase">
                      {car.condition || 'CERTIFICADO'}
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-tech text-primary uppercase">
                        {car.make}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                        {car.name}
                      </h4>
                    </div>
                    <div className="flex items-end justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-sm font-black text-white font-tech">
                        ${(car.price || 0).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
                        Ver <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  );
}
