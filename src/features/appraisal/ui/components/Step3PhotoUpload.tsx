import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Zap } from 'lucide-react';

interface Step3PhotoUploadProps {
  onSimulate: () => void;
  loading: boolean;
}

export const Step3PhotoUpload: React.FC<Step3PhotoUploadProps> = ({ onSimulate, loading }) => {
  return (
    <motion.div 
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 text-center"
    >
      <div className="py-12 border-2 border-dashed border-white/10 rounded-[2rem] bg-slate-900/40 relative group cursor-pointer hover:border-primary/40 transition-all">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Camera size={32} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Sube fotos de tu auto</h3>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest max-w-[200px] mx-auto">
              Frontal, Laterales y Tacómetro (Opcional para este demo)
            </p>
          </div>
        </div>
      </div>

      <button 
        onClick={onSimulate}
        disabled={loading}
        className="w-full py-6 bg-gradient-to-r from-primary to-cyan-400 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.4)] disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-3">
             <Zap size={18} className="animate-spin" /> Procesando Tasación RA...
          </span>
        ) : (
          "Obtener Oferta Digital"
        )}
      </button>
    </motion.div>
  );
};
