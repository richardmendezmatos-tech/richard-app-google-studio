'use client';

import React, { useState } from 'react';
import { Sparkles, Brain, Search, Loader2, ChevronRight } from 'lucide-react';
import { Car } from '@/entities/inventory';
import { getCarImage } from '@/entities/inventory/lib/carImage';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { generateNeuralMatch } from '@/shared/api/ai/client';

interface Props {
  inventory: Car[];
}

/**
 * Tab "Neural Match" (búsqueda semántica IA) extraído de SentinelDiscoverySuite.
 * Autónomo: gestiona su propio query, estado de carga y resultados.
 */
export function NeuralMatchTab({ inventory }: Props) {
  const navigate = useNavigate();
  const [neuralQuery, setNeuralQuery] = useState('');
  const [isNeuralMatching, setIsNeuralMatching] = useState(false);
  const [neuralResults, setNeuralResults] = useState<Car[]>([]);

  const runNeuralMatch = async (query: string) => {
    if (!query.trim()) return;
    setNeuralQuery(query);
    setIsNeuralMatching(true);
    try {
      const matchIds = await generateNeuralMatch(query, inventory);
      const matches = inventory.filter((c) => matchIds.includes(c.id));
      setNeuralResults(matches);
    } catch (error) {
      console.error('Neural match error:', error);
    } finally {
      setIsNeuralMatching(false);
    }
  };

  const handleNeuralMatchSubmit = () => runNeuralMatch(neuralQuery);

  return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
          <div className="text-center">
            <span className="text-[10px] font-tech text-indigo-400 uppercase tracking-[0.3em] mb-2 block">
              BÚSQUEDA SEMÁNTICA NIVEL 18
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Dinos qué{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-500 font-cinematic">
                Vibra
              </span>{' '}
              Buscas
            </h3>
            <p className="text-slate-500 text-xs mt-2 max-w-lg mx-auto leading-relaxed">
              Nuestro sistema inteligente analiza el inventario en tiempo real para encontrar unidades que
              no solo encajen con tu bolsillo, sino con tu estilo de vida en la isla.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative">
              <textarea
                placeholder="Ej: Busco algo para mi familia pero que se vea deportivo y sea económico en gasolina..."
                value={neuralQuery}
                onChange={(e) => setNeuralQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-3xl p-6 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all h-32 resize-none text-sm font-medium"
              />
              <button
                onClick={handleNeuralMatchSubmit}
                disabled={isNeuralMatching || !neuralQuery.trim()}
                className="absolute bottom-4 right-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                {isNeuralMatching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> ESCANEANDO...
                  </>
                ) : (
                  <>
                    <Search size={14} /> SCANEAR INVENTARIO
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Chips de Intención Rápida */}
          <div className="space-y-3">
            <p className="text-[10px] font-tech text-slate-500 uppercase tracking-widest text-left">
              Sugerencias Inteligentes:
            </p>
            <div className="flex flex-wrap gap-2 justify-start">
              {[
                {
                  label: 'Guagua familiar < $450/mes',
                  query: 'Guagua familiar espaciosa de menos de $450 al mes',
                },
                {
                  label: 'Pickup para trabajo',
                  query: 'Pickup robusta para trabajo con poco millaje',
                },
                {
                  label: 'Deportivo con poco pronto',
                  query: 'Unidad deportiva premium con poco pronto y gran desempeño',
                },
                {
                  label: 'Unidad diaria económica',
                  query: 'Unidad confiable económica en gasolina para uso diario',
                },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => runNeuralMatch(chip.query)}
                  disabled={isNeuralMatching}
                  className="text-xs font-semibold px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-1.5"
                >
                  <Brain size={12} className="text-indigo-400" />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resultados Neurales */}
          {neuralResults.length > 0 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between px-2 border-b border-white/5 pb-2">
                <span className="text-[10px] font-tech text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles size={12} /> COINCIDENCIAS ENCONTRADAS
                </span>
                <button
                  onClick={() => setNeuralResults([])}
                  className="text-[9px] text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-black"
                >
                  Limpiar Resultados
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {neuralResults.map((car) => {
                  const score = car.aiScore || Math.floor(Math.random() * 8) + 90;
                  return (
                    <div
                      key={car.id}
                      onClick={() => navigate(`/inventario/${generateVehicleSlug(car)}/${car.id}`)}
                      className="group flex gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-350 cursor-pointer overflow-hidden relative"
                    >
                      <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 border border-white/5">
                        <OptimizedImage
                          src={getCarImage(car)}
                          alt={car.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[8px] font-tech text-indigo-400 uppercase tracking-widest">
                            {car.year} • {car.type}
                          </span>
                          <span className="text-[8px] font-tech bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                            {score}% Match
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {car.name}
                        </h4>
                        <p className="text-xs font-black text-white/70 mt-1">
                          ${(car.price || 0).toLocaleString()}
                        </p>
                        {car.mileage && (
                          <p className="text-[9px] text-slate-500 mt-0.5 font-medium">
                            {car.mileage.toLocaleString()} millas
                          </p>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight
                          size={14}
                          className="text-indigo-400 animate-bounce-horizontal"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
  );
}
