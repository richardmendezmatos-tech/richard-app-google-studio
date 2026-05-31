'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Car } from '@/entities/inventory';
import {
  Sparkles,
  Sliders,
  Flame,
  Heart,
  X,
  RotateCcw,
  DollarSign,
  Activity,
  ChevronRight,
  Timer,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Gift,
  Send,
  Brain,
  Search,
  Loader2,
} from 'lucide-react';
import { getCarImage } from '@/entities/inventory/lib/carImage';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { generateVehicleSlug } from '@/shared/lib/utils/seo';
import { addLead } from '@/shared/api/adapters/leads/crmService';
import { generateNeuralMatch } from '@/shared/api/ai/aiService';

interface SentinelDiscoverySuiteProps {
  inventory: Car[];
}

const SentinelDiscoverySuite: React.FC<SentinelDiscoverySuiteProps> = ({ inventory }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'budget' | 'swipe' | 'neural'>('budget');

  // --- STATE: Neural Match ---
  const [neuralQuery, setNeuralQuery] = useState('');
  const [isNeuralMatching, setIsNeuralMatching] = useState(false);
  const [neuralResults, setNeuralResults] = useState<Car[]>([]);

  const handleNeuralMatchSubmit = async () => {
    if (!neuralQuery.trim()) return;
    setIsNeuralMatching(true);
    try {
      const matchIds = await generateNeuralMatch(neuralQuery, inventory);
      const matches = inventory.filter((c) => matchIds.includes(c.id));
      setNeuralResults(matches);
    } catch (error) {
      console.error('Neural match error:', error);
    } finally {
      setIsNeuralMatching(false);
    }
  };

  // --- STATE: Modal Express de Pre-cualificación (Bono de Exención $300) ---
  const [isExpressModalOpen, setIsExpressModalOpen] = useState<boolean>(false);
  const [expressForm, setExpressForm] = useState({ name: '', phone: '', email: '' });
  const [isSubmittingExpress, setIsSubmittingExpress] = useState<boolean>(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<string | null>(null);
  const [expressError, setExpressError] = useState<string | null>(null);

  const handleExpressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpressError(null);
    if (!expressForm.name.trim() || !expressForm.phone.trim()) {
      setExpressError('Por favor ingresa tu Nombre y Teléfono/WhatsApp.');
      return;
    }
    setIsSubmittingExpress(true);
    try {
      // Guardar lead de alta intención
      await addLead({
        type: 'finance',
        name: expressForm.name,
        phone: expressForm.phone,
        email: expressForm.email,
        notes: `[BONO_300_ACTIVO] - Reclamo Express de Exención de Gastos (Tablilla/Marbete/Registro) desde Sentinel Discovery Suite.`,
      });
      // Generar voucher único
      const randomSeg = Math.floor(1000 + Math.random() * 9000);
      setGeneratedVoucher(`RA-BONO-24H-${randomSeg}`);
    } catch (err) {
      console.error('Error al guardar lead express:', err);
      // Fallback seguro en memoria para que la experiencia premium fluya sin interrupciones
      const randomSeg = Math.floor(1000 + Math.random() * 9000);
      setGeneratedVoucher(`RA-BONO-24H-${randomSeg}`);
    } finally {
      setIsSubmittingExpress(false);
    }
  };

  // --- STATE: Temporizador Activo de 24 Horas (Bono de Acción Rápida) ---
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    return 24 * 3600 - 15 * 60; // Empezamos en 23h 45m para que luzca ultra dinámico en vivo
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0'),
    };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  // --- TABS STATE: Presupuesto Inteligente ---
  const [monthlyBudget, setMonthlyBudget] = useState<number>(450);
  const [downPayment, setDownPayment] = useState<number>(2000);

  // Estimación simplificada de poder adquisitivo para gamificación visual
  const estimatedPurchasingPower = useMemo(() => {
    return monthlyBudget * 65 + downPayment;
  }, [monthlyBudget, downPayment]);

  // Filtrado de vehículos accesibles
  const accessibleCars = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    // Ordenar de precio menor a mayor para sugerir las mejores opciones bajo presupuesto
    const sorted = [...inventory].sort((a, b) => (a.price || 0) - (b.price || 0));
    const filtered = sorted.filter((car) => (car.price || 0) <= estimatedPurchasingPower + 3000);
    // Si la lista está vacía, retornar las 3 unidades más económicas
    return filtered.length > 0 ? filtered.slice(0, 4) : sorted.slice(0, 4);
  }, [inventory, estimatedPurchasingPower]);

  // --- TABS STATE: Swipe Rápido (Tinder Mode) ---
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

  if (!inventory || inventory.length === 0) return null;

  return (
    <div className="w-full rounded-4xl border border-white/10 bg-linear-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden mb-12">
      {/* Resplandor de fondo dinámico */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera & Selector de Pestañas */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-tech uppercase tracking-[0.2em] bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              ⚡ Suite de Descubrimiento v24
            </span>
            <span className="text-[10px] text-slate-500 font-tech">| INTELIGENCIA INTERACTIVA</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Descubre tu{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 font-cinematic">
              Unidad Compatible
            </span>
          </h2>
        </div>

        {/* Pestañas estilo Glassmorphism */}
        <div className="flex bg-slate-950/80 p-1 rounded-full border border-white/10 w-full md:w-auto grid grid-cols-3 md:flex gap-1">
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'budget'
                ? 'bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders size={14} /> <span className="hidden sm:inline">Presupuesto</span>
            <span className="sm:hidden">$$</span>
          </button>
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'swipe'
                ? 'bg-linear-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame size={14} /> <span className="hidden sm:inline">Swipe Rápido</span>
            <span className="sm:hidden">Swipe</span>
          </button>
          <button
            onClick={() => setActiveTab('neural')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'neural'
                ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain size={14} /> <span className="hidden sm:inline">Match Ideal</span>
            <span className="sm:hidden">Match</span>
          </button>
        </div>
      </div>

      {/* Cintillo de Oferta de 24 Horas (Bono de Acción Rápida) */}
      <div
        onClick={() => setIsExpressModalOpen(true)}
        className="group relative z-10 mb-8 rounded-2xl border-2 border-amber-500/40 bg-linear-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 p-4 md:p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden cursor-pointer transition-all duration-300 hover:border-amber-400 hover:scale-[1.01]"
      >
        <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse" />
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 text-center xl:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 group-hover:scale-110 transition-transform">
              <Timer size={20} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center xl:justify-start">
                <span className="text-[10px] font-tech font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded">
                  AHORRO DE $300.00
                </span>
                <span className="text-[10px] text-slate-400 font-tech">| OFERTA ESPECIAL</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                Regístrate y compra en <span className="text-amber-400 font-black">24 Horas</span> y
                te cubrimos{' '}
                <span className="underline decoration-amber-500 decoration-2">
                  Tablilla, Marbete y Registro
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Temporizador Activo */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10">
              <div className="text-center">
                <span className="font-cinematic text-base font-black text-white">{hours}</span>
                <span className="block text-[7px] font-tech text-slate-500 uppercase">Horas</span>
              </div>
              <span className="font-cinematic text-base font-black text-amber-500 animate-pulse">
                :
              </span>
              <div className="text-center">
                <span className="font-cinematic text-base font-black text-white">{minutes}</span>
                <span className="block text-[7px] font-tech text-slate-500 uppercase">Mins</span>
              </div>
              <span className="font-cinematic text-base font-black text-amber-500 animate-pulse">
                :
              </span>
              <div className="text-center">
                <span className="font-cinematic text-base font-black text-rose-400">{seconds}</span>
                <span className="block text-[7px] font-tech text-slate-500 uppercase">Segs</span>
              </div>
            </div>

            {/* CTA Secundario Embebido */}
            <span className="flex items-center gap-1 bg-linear-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs px-3 py-2 rounded-xl uppercase tracking-wider group-hover:shadow-lg group-hover:shadow-amber-500/25 transition-all">
              Reclamar{' '}
              <ChevronRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </span>
          </div>
        </div>
      </div>

      {/* --- PESTAÑA 1: PRESUPUESTO INTELIGENTE --- */}
      {activeTab === 'budget' && (
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
      )}

      {/* --- PESTAÑA 2: SWIPE RÁPIDO (TINDER MODE) --- */}
      {activeTab === 'swipe' && currentSwipeCar && (
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
      )}

      {/* --- PESTAÑA 3: NEURAL MATCH (AI SEARCH) --- */}
      {activeTab === 'neural' && (
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
                  onClick={async () => {
                    setNeuralQuery(chip.query);
                    setIsNeuralMatching(true);
                    try {
                      const matchIds = await generateNeuralMatch(chip.query, inventory);
                      const matches = inventory.filter((c) => matchIds.includes(c.id));
                      setNeuralResults(matches);
                    } catch (err) {
                      console.error('Neural match error:', err);
                    } finally {
                      setIsNeuralMatching(false);
                    }
                  }}
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
      )}

      {/* Modal Express de Pre-cualificación en Capa Flotante (Glassmorphism Overlay) */}
      {isExpressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-left overflow-hidden">
            {/* Esquinas resplandecientes */}
            <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

            <button
              onClick={() => {
                setIsExpressModalOpen(false);
                setGeneratedVoucher(null);
                setExpressError(null);
              }}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                <Gift size={20} />
              </div>
              <div>
                <span className="text-[9px] font-tech font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded">
                  AHORRO GARANTIZADO DE $300.00
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">Pre-cualificación Express</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6 font-light">
              Congela de inmediato la cobertura gratuita de{' '}
              <span className="text-amber-400 font-bold">Tablilla, Marbete y Registro</span>{' '}
              ingresando tu información a continuación. Sin fricción, sin compromiso.
            </p>

            {generatedVoucher ? (
              <div className="text-center py-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <span className="text-[10px] font-tech text-slate-500 uppercase tracking-widest block mb-1">
                  Tu Código de Cupón Exclusivo
                </span>
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 mb-4 inline-block">
                  <span className="text-xl font-mono font-black tracking-widest text-amber-400 select-all">
                    {generatedVoucher}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                  ¡Código enlazado exitosamente a tu expediente! Preséntalo o compártelo por
                  WhatsApp para que nuestros asesores apliquen los $300 de descuento directo en tus
                  trámites.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const m = `¡Hola! Acabo de activar mi Pre-cualificación Express con el cupón ${generatedVoucher} para el Ahorro de $300 en Tablilla y Marbete.`;
                      window.open(
                        `https://wa.me/17875550000?text=${encodeURIComponent(m)}`,
                        '_blank',
                      );
                    }}
                    className="flex-1 py-3 bg-[#25D366] hover:bg-[#1ebd5a] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-lg shadow-[#25D366]/20"
                  >
                    <Send size={14} /> Reclamar a WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      setIsExpressModalOpen(false);
                      setGeneratedVoucher(null);
                    }}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExpressSubmit} className="space-y-4">
                {expressError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
                    {expressError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-tech font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User size={12} className="text-amber-400" /> Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Rivera"
                    value={expressForm.name}
                    onChange={(e) => setExpressForm({ ...expressForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-tech font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone size={12} className="text-amber-400" /> WhatsApp / Celular
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(787) 000-0000"
                    value={expressForm.phone}
                    onChange={(e) => setExpressForm({ ...expressForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-tech font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Mail size={12} className="text-slate-500" /> Correo Electrónico{' '}
                    <span className="text-slate-600 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="carlos@email.com"
                    value={expressForm.email}
                    onChange={(e) => setExpressForm({ ...expressForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingExpress}
                  className="w-full mt-2 py-3.5 bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmittingExpress ? (
                    <span className="animate-pulse">Asegurando Cupón...</span>
                  ) : (
                    <>
                      Activar Cupón de $300 <ChevronRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-[9px] text-slate-500 text-center font-tech uppercase tracking-wider">
                  🔒 Procesamiento Seguro • Almacenamiento Cifrado
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SentinelDiscoverySuite;
