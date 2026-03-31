import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Gauge, Camera } from 'lucide-react';

interface Step2ConditionMileageProps {
  formData: {
    mileage: string;
    condition: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  inputClasses: string;
  labelClasses: string;
}

export const Step2ConditionMileage: React.FC<Step2ConditionMileageProps> = ({ 
  formData, 
  setFormData, 
  onNext, 
  onPrev,
  inputClasses,
  labelClasses
}) => {
  return (
    <motion.div 
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Millaje Actual</label>
          <div className="relative">
            <input 
              type="number" 
              placeholder="25000" 
              className={inputClasses}
              value={formData.mileage}
              onChange={(e) => setFormData((prev: any) => ({...prev, mileage: e.target.value}))}
            />
            <Gauge size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Estado General</label>
          <select 
            className={inputClasses}
            value={formData.condition}
            onChange={(e) => setFormData((prev: any) => ({...prev, condition: e.target.value}))}
            title="Estado General"
          >
            <option value="excelente">Excelente (Como nuevo)</option>
            <option value="bueno">Bueno (Uso normal)</option>
            <option value="regular">Regular (Requiere atención)</option>
          </select>
        </div>
      </div>
      
      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex gap-4 items-start">
         <Camera className="text-primary mt-1" size={24} />
         <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Próximo paso: Análisis Visual</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
              Nuestra IA analizará tu unidad para validar el estado clínico y darte el mejor valor de retoma de Puerto Rico.
            </p>
         </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={onPrev}
          className="flex-[0.3] py-5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
        >
          Atrás
        </button>
        <button 
          onClick={onNext}
          className="flex-1 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3"
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};
