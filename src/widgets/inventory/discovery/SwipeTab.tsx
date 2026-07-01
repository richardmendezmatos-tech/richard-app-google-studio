'use client';

import React, { useState, useMemo } from 'react';
import { Flame, X, RotateCcw, Heart } from 'lucide-react';
import { Car } from '@/entities/inventory';
import { getCarImage } from '@/entities/inventory/lib/carImage';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';

interface Props {
  inventory: Car[];
}

/**
 * Tab "Swipe Rápido" (Tinder Mode) extraído de SentinelDiscoverySuite.
 * Autónomo: gestiona su propio índice de swipe, lista de likes y animación.
 */
export function SwipeTab({ inventory }: Props) {
  const navigate = useNavigate();
  const [swipeIndex, setSwipeIndex] = useState<number>(0);
  const [likedList, setLikedList] = useState<Car[]>([]);
  const [swipeAnimation, setSwipeAnimation] = useState<'idle' | 'left' | 'right'>('idle');

  const currentSwipeCar = useMemo(() => {
    if (!inventory || inventory.length === 0) return null;
    return inventory[swipeIndex % inventory.length];
  }, [inventory, swipeIndex]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentSwipeCar) return;
    setSwipeAnimation(direction);

    if (direction === 'right') {
      setLikedList((prev) =>
        prev.some((c) => c.id === currentSwipeCar.id) ? prev : [...prev, currentSwipeCar],
      );
    }

    setTimeout(() => {
      setSwipeIndex((prev) => prev + 1);
      setSwipeAnimation('idle');
    }, 300);
  };

  const handleResetSwipe = () => {
    setSwipeIndex(0);
    setLikedList([]);
  };

  if (!currentSwipeCar) return null;

  return (
        <div className="flex flex-col items-center justify-center relative z-10 animate-in fade-in duration-500 max-w-md mx-auto">
          {/* Contador y Reset */}
          <div className="w-full flex justify-between items-center mb-3 px-2">
            <span className="text-[10px] font-tech text-slate-500 uppercase tracking-widest">
              Unidad {swipeIndex + 1} de {inventory.length}
            </span>
            {likedList.length > 0 && (
              <button
                onClick={handleResetSwipe}
                className="text-[10px] font-tech text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={10} /> Reiniciar Likes ({likedList.length})
              </button>
            )}
          </div>

          {/* Tarjeta Deslizable Central */}
          <div
            className={`w-full bg-slate-950 rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative transition-transform duration-300 ${
              swipeAnimation === 'left' ? '-translate-x-24 rotate-[-6deg] opacity-0' : ''
            } ${swipeAnimation === 'right' ? 'translate-x-24 rotate-[6deg] opacity-0' : ''}`}
          >
            <div className="h-64 sm:h-72 w-full relative bg-slate-900">
              <OptimizedImage
                src={getCarImage(currentSwipeCar)}
                alt={currentSwipeCar.name}
                className="w-full h-full object-cover"
              />
              {/* Overlay de Sombra Estilizada */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              {/* Metadatos sobre la imagen */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="px-2 py-0.5 rounded-full bg-primary/80 backdrop-blur-md text-[8px] font-tech uppercase text-white tracking-widest">
                  {currentSwipeCar.type || 'PREMIUM'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                  {currentSwipeCar.name}
                </h3>
                <p className="text-lg font-tech font-bold text-cyan-400 mt-0.5">
                  ${(currentSwipeCar.price || 0).toLocaleString()}
                </p>
              </div>

              {/* Indicadores Visuales Flotantes (Sellos de Swipe) */}
              {swipeAnimation === 'left' && (
                <div className="absolute top-6 right-6 border-2 border-rose-500 bg-rose-500/20 px-4 py-1 rounded-xl backdrop-blur-md rotate-[12deg]">
                  <span className="text-xs font-black text-rose-500 tracking-widest uppercase font-tech">
                    PASO
                  </span>
                </div>
              )}
              {swipeAnimation === 'right' && (
                <div className="absolute top-6 left-6 border-2 border-emerald-500 bg-emerald-500/20 px-4 py-1 rounded-xl backdrop-blur-md rotate-[-12deg]">
                  <span className="text-xs font-black text-emerald-400 tracking-widest uppercase font-tech">
                    ME ENCANTA
                  </span>
                </div>
              )}
            </div>

            {/* Fila de Especificaciones y Gatillo de Escasez */}
            <div className="p-4 bg-slate-950/90 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-tech">
              <span className="flex items-center gap-1 text-amber-400">
                <Flame size={12} fill="currentColor" /> Alta Demanda
              </span>
              <span>{currentSwipeCar.year} • Automático</span>
              <span className="text-cyan-500">Verificado</span>
            </div>
          </div>

          {/* Botones de Acción Gigantes */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={() => handleSwipe('left')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-rose-500 shadow-xl hover:scale-110 active:scale-95 transition-all"
              aria-label="Descartar"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <button
              onClick={() =>
                navigate(
                  `/inventario/${generateVehicleSlug(currentSwipeCar)}/${currentSwipeCar.id}`,
                )
              }
              className="px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold font-tech transition-all"
            >
              Inspeccionar
            </button>

            <button
              onClick={() => handleSwipe('right')}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/30 hover:scale-110 active:scale-95 transition-all"
              aria-label="Me Encanta"
            >
              <Heart size={24} fill="currentColor" />
            </button>
          </div>

          {/* Bandeja Inferior de Unidades Seleccionadas */}
          {likedList.length > 0 && (
            <div className="w-full mt-6 pt-4 border-t border-white/10">
              <span className="text-[9px] font-tech text-slate-500 uppercase tracking-wider block text-center mb-3">
                💖 Unidades Pre-Seleccionadas por ti ({likedList.length})
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                {likedList.map((likedCar, idx) => (
                    <div
                      key={`${likedCar.id}-${idx}`}
                      onClick={() =>
                        navigate(`/inventario/${generateVehicleSlug(likedCar)}/${likedCar.id}`)
                      }
                      className="h-10 w-10 rounded-full border border-rose-500/40 overflow-hidden shrink-0 cursor-pointer hover:scale-110 transition-transform relative group"
                      title={likedCar.name}
                    >
                      <OptimizedImage
                        src={getCarImage(likedCar)}
                        alt={likedCar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
  );
}
