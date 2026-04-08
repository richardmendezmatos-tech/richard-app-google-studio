import React from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/shared/ui/seo/SEO';
import { TradeInWizard } from '@/features/appraisal/ui/TradeInWizard';

const TradeInView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      <SEO
        title="Trade-in VIP | Valor de Tu Auto en Minutos | Richard Automotive"
        description="Calcula el valor de tu auto con nuestra IA certificada y recibe una oferta de trade-in premium en Puerto Rico."
        url="/trade-in"
        type="website"
      />
      
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="p-8 relative z-20 container mx-auto">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em]"
        >
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/40 group-hover:text-primary transition-all">
            <ArrowLeft size={16} />
          </div>
          Volver a la Tienda
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-5xl mx-auto pb-24">
        <div className="mb-12 text-center space-y-4 max-w-2xl px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase font-cinematic leading-none">
            Vende Tu Auto <br />
            <span className="text-primary text-glow-sm">Al Instante</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium uppercase tracking-widest leading-relaxed opacity-60">
            Richard Automotive utiliza inteligencia predictiva para darte el valor real de mercado. Sin regateos, directo al punto.
          </p>
        </div>

        <div className="w-full">
          <TradeInWizard />
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl px-4 text-center">
            <div className="p-6">
                <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-2">Paso 1: Identificación</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ingresa el VIN o datos básicos para que nuestra IA reconozca tu unidad.</p>
            </div>
            <div className="p-6">
                <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-2">Paso 2: Diagnóstico</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Describe el estado actual para una valoración quirúrgica.</p>
            </div>
            <div className="p-6">
                <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-2">Paso 3: Richard Certified</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Recibe tu oferta y agenda la inspección final en el Bunker RA.</p>
            </div>
        </div>
      </main>
    </div>
  );
};

export default TradeInView;
