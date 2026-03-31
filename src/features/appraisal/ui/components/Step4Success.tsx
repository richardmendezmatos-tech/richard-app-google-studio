import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Calendar } from 'lucide-react';

interface Step4SuccessProps {
  result: number | null;
  onReset: () => void;
}

export const Step4Success: React.FC<Step4SuccessProps> = ({ result, onReset }) => {
  return (
    <motion.div 
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="inline-flex p-4 bg-emerald-500/10 rounded-full text-emerald-400 mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <CheckCircle2 size={48} />
      </div>
      
      <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Oferta Estimada Richard Certified</h3>
      <div className="text-6xl font-black text-white tracking-tighter mb-4 font-cinematic">
        ${result?.toLocaleString()}
      </div>
      
      <p className="text-xs text-slate-400 mb-10 max-w-sm mx-auto uppercase tracking-wide leading-relaxed">
        Basado en el historial de mercado de hoy. Esta oferta es tentativa y se honrará tras la inspección física en Richard Automotive.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <button 
          onClick={onReset}
          className="py-5 bg-slate-900 border border-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all font-tech"
         >
           Nueva Tasación
         </button>
         <button 
          className="py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 hover:scale-105 transition-all font-tech"
         >
           <Calendar size={14} /> Reservar Inspección
         </button>
      </div>
    </motion.div>
  );
};
