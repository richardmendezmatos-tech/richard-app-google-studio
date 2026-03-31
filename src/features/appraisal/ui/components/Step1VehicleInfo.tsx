import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Zap } from 'lucide-react';

interface Step1VehicleInfoProps {
  formData: {
    year: string;
    make: string;
    model: string;
    mileage: string;
    condition: string;
    vin: string;
  };
  setFormData: (data: any) => void;
  onNext: () => void;
  inputClasses: string;
  labelClasses: string;
}

export const Step1VehicleInfo: React.FC<Step1VehicleInfoProps> = ({ 
  formData, 
  setFormData, 
  onNext,
  inputClasses,
  labelClasses
}) => {
  return (
    <motion.div 
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Año del Vehículo</label>
          <input 
            type="number" 
            placeholder="2022" 
            className={inputClasses}
            value={formData.year}
            onChange={(e) => setFormData({...formData, year: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClasses}>Marca / Modelo</label>
          <input 
            type="text" 
            placeholder="Ej: Porsche 911" 
            className={inputClasses}
            value={formData.model}
            onChange={(e) => setFormData({...formData, model: e.target.value})}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClasses}>VIN (Opcional - Mayor Precisión)</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="WPOZZZ..." 
              className={`${inputClasses} font-mono`}
              value={formData.vin}
              onChange={(e) => setFormData({...formData, vin: e.target.value})}
            />
            <Zap size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-primary animate-pulse" />
          </div>
        </div>
      </div>
      
      <button 
        onClick={onNext}
        className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-3"
      >
        Identificar Unidad <ChevronRight size={18} />
      </button>
    </motion.div>
  );
};
