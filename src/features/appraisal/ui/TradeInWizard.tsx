import React, { useState, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  Camera, 
  Gauge, 
  ShieldCheck, 
  Lock,
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Zap,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useSaveAppraisal } from '@/features/garage/hooks/useAppraisals';
import { Appraisal } from '@/shared/types/types';
import { v4 as uuidv4 } from 'uuid';

export const TradeInWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const saveAppraisal = useSaveAppraisal();

  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    mileage: '',
    condition: 'excelente',
    vin: ''
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSimulateAppraisal = () => {
    setLoading(true);
    // Simulación de "Calculando con Richard Intelligence"
    setTimeout(() => {
      const base = 25000;
      const final = base - (parseInt(formData.mileage || '0') * 0.1);
      const calculatedValue = Math.max(final, 5000);
      
      setResult(calculatedValue);
      setLoading(false);
      setStep(4);

      // Persistir Asset en Richard Digital / RA Cloud
      const newAppraisal: Appraisal = {
        id: `TRD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        vehicle: {
          make: formData.make || 'Richard Choice',
          model: formData.model,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          vin: formData.vin
        },
        condition: {
          overall: formData.condition as any,
          details: ['Verificación RA Pendiente', 'Bunker Inspection Slot Available']
        },
        value: {
          estimated: calculatedValue,
          currency: 'USD',
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        },
        status: 'valid'
      };

      saveAppraisal.mutate(newAppraisal);
    }, 2500);
  };


  const inputClasses = "w-full p-5 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-tech uppercase tracking-widest text-sm";
  const labelClasses = "block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1";

  return (
    <div className="glass-premium p-8 md:p-12 max-w-4xl mx-auto rounded-[3rem] border border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      {/* Header */}
      <div className="relative mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
            <ShieldCheck className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Richard Certified Appraisal</h3>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase font-cinematic">Tasa tu Auto <span className="text-primary/70">VIP</span></h2>
          </div>
        </div>
        
        {step < 4 && (
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-slate-800'}`} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
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
              onClick={nextStep}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-3"
            >
              Identificar Unidad <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
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
                    onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  />
                  <Gauge size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Estado General</label>
                <select 
                  className={inputClasses}
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
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
                  <p className="text-[10px] text-slate-400 leading-relaxed uppercase">Nuestra IA analizará tu unidad para validar el estado clínico y darte el mejor valor de retoma de Puerto Rico.</p>
               </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={prevStep}
                className="flex-[0.3] py-5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all"
              >
                Atrás
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-3"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
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
                  <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest max-w-[200px] mx-auto">Frontal, Laterales y Tacómetro (Opcional para este demo)</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSimulateAppraisal}
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
        )}

        {step === 4 && (
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
                onClick={() => setStep(1)}
                className="py-5 bg-slate-900 border border-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all font-tech"
               >
                 Nueva Tasación
               </button>
               <button 
                className="py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 hover:scale-105 transition-all font-tech"
               >
                 <Zap size={14} fill="white" /> Reservar Inspección
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12 flex items-center justify-center gap-6 opacity-30 text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
         <span className="flex items-center gap-2"><Lock size={10} /> 256-Bit Secure</span>
         <span className="flex items-center gap-2 flex-row-reverse">AI Powered <Sparkles size={10} /></span>
      </div>
    </div>
  );
};
