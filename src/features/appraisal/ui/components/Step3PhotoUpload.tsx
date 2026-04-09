import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ChevronRight, Zap } from 'lucide-react';

interface Step3PhotoUploadProps {
  onNext: () => void;
  onPrev: () => void;
}

export const Step3PhotoUpload: React.FC<Step3PhotoUploadProps> = ({ onNext, onPrev }) => {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Fake progress loading for "analysis"
    setTimeout(() => {
      setAnalyzing(false);
      onNext();
    }, 1500);
  };

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
              Frontal, Laterales y Tacómetro (Opcional - Recomendado)
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onPrev}
          disabled={analyzing}
          className="flex-[0.3] py-5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
        >
          Atrás
        </button>
        <button 
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex-1 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {analyzing ? (
            <span className="flex items-center justify-center gap-3">
               <Zap size={18} className="animate-pulse text-primary" /> Analizando Carrocería...
            </span>
          ) : (
            <>Analizar Unidad <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </motion.div>
  );
};
