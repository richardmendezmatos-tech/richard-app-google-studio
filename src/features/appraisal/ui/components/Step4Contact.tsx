import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { ContactData } from '../../model/appraisalStore';

interface Step4ContactProps {
  contactData: ContactData;
  setContactData: (data: Partial<ContactData>) => void;
  errors?: Partial<Record<keyof ContactData, string>>;
  onSimulate: () => void;
  loading: boolean;
  onPrev: () => void;
}

export const Step4Contact: React.FC<Step4ContactProps> = ({ 
  contactData, 
  setContactData, 
  errors,
  onSimulate, 
  loading,
  onPrev
}) => {
  return (
    <motion.div 
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3 mb-8">
        <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
           <Sparkles className="text-emerald-500" size={32} />
        </div>
        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest font-cinematic">
          Análisis <span className="text-primary text-glow-sm">Completado</span>
        </h3>
        <p className="text-xs text-slate-400 uppercase tracking-widest leading-relaxed max-w-sm mx-auto">
          Ingresa tus datos para desbloquear tu valoración y enviarla directamente a tu WhatsApp.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="ra-label-base">Nombre Completo</label>
          <input 
            type="text" 
            placeholder="Ej: Roberto Sánchez" 
            className={`ra-input-base font-tech uppercase tracking-widest text-sm ${errors?.name ? 'border-red-500/50 focus:border-red-500' : ''}`}
            value={contactData.name}
            onChange={(e) => setContactData({ name: e.target.value })}
          />
          {errors?.name && <p className="text-red-400 text-[10px] uppercase font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.name}</p>}
        </div>

        <div>
          <label className="ra-label-base">WhatsApp / Celular</label>
          <input 
            type="tel" 
            placeholder="(787) 555-0000" 
            className={`ra-input-base font-mono tracking-widest text-sm ${errors?.phone ? 'border-red-500/50 focus:border-red-500' : ''}`}
            value={contactData.phone}
            onChange={(e) => {
              // Basic numeric filter
              const val = e.target.value.replace(/[^0-9\-()+ ]/g, '');
              setContactData({ phone: val });
            }}
          />
          {errors?.phone && <p className="text-red-400 text-[10px] uppercase font-bold mt-2 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.phone}</p>}
        </div>
      </div>

      <div className="flex gap-4 items-center justify-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
        <Lock size={12} className="text-primary" />
        Privacidad garantizada. Nada de llamadas molestas.
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onPrev}
          disabled={loading}
          className="flex-[0.3] py-5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all disabled:opacity-50"
        >
          Atrás
        </button>
        <button 
          onClick={onSimulate}
          disabled={loading}
          className="flex-1 py-5 bg-gradient-to-r from-primary to-cyan-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.4)] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="flex items-center gap-2">
               <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Procesando...
            </span>
          ) : (
            <>Desbloquear Oferta <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};
