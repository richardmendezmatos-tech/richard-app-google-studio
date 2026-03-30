import React, { Suspense } from 'react';
import { Sparkles, User as UserIcon } from 'lucide-react';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';
import { Car } from '@/shared/types/types';

// Lazy load
const GapAnalyticsWidget = React.lazy(() =>
  import('./GapAnalyticsWidget').then((m) => ({ default: m.GapAnalyticsWidget })),
);

interface MarketingTabViewProps {
  inventory: Car[];
  subscribers: any[];
  setMarketingCar: (car: Car) => void;
}

export const MarketingTabView: React.FC<MarketingTabViewProps> = ({
  inventory,
  subscribers,
  setMarketingCar,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
      <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em] relative z-10">
          <Sparkles size={20} className="animate-pulse" /> Content Engine
        </div>
        <h3 className="text-3xl font-black text-white uppercase tracking-tight relative z-10">
          Estrategia Semántica
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-xl relative z-10">
          Richard IA utiliza búsqueda semántica para identificar qué modelos de tu inventario tienen
          más "momentum" basado en las consultas de los usuarios. Selecciona una unidad abajo para
          generar contenido viral.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {inventory.slice(0, 4).map((car) => (
            <button
              key={car.id}
              onClick={() => setMarketingCar(car)}
              className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(0,174,217,0.15)] hover:-translate-y-1 transition-all duration-300 text-left group"
            >
              <img
                src={optimizeImage(car.img, 100)}
                alt={car.name}
                className="w-14 h-14 rounded-xl object-cover shadow-lg"
              />
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                  {car.name}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Planear Post <span className="text-primary">✨</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1 h-full space-y-6">
        <Suspense
          fallback={
            <div className="h-48 rounded-[2rem] bg-slate-900/40 animate-pulse border border-white/5" />
          }
        >
          <GapAnalyticsWidget />
        </Suspense>

        <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[400px] relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />

          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <UserIcon size={12} /> Newsroom Audience
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1">
                Suscriptores
              </h3>
            </div>
            <span className="text-3xl font-black text-white text-glow glow-emerald-500/50">
              {subscribers.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 relative z-10 pr-2">
            {subscribers.map((sub: any, i: number) => (
              <div
                key={sub.id || i}
                className="p-3 bg-slate-800/30 rounded-xl border border-white/5 flex flex-col shadow-inner hover:bg-slate-800/60 hover:border-white/10 transition-colors"
              >
                <span className="text-xs font-bold text-slate-200">{sub.email}</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">
                  {sub.timestamp?.seconds
                    ? new Date(sub.timestamp.seconds * 1000).toLocaleDateString()
                    : 'Reciente'}
                </span>
              </div>
            ))}
            {subscribers.length === 0 && (
              <p className="text-xs text-slate-500 p-4 text-center italic">Sin suscriptores aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
