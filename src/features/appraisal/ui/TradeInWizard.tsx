import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSaveAppraisal } from '@/entities/appraisal';
import { Appraisal } from '@/shared/types/types';

// Sub-components
import { AppraisalHeader } from './components/AppraisalHeader';
import { Step1VehicleInfo } from './components/Step1VehicleInfo';
import { Step2ConditionMileage } from './components/Step2ConditionMileage';
import { Step3PhotoUpload } from './components/Step3PhotoUpload';
import { Step4Success } from './components/Step4Success';
import { AppraisalFooter } from './components/AppraisalFooter';

import { useAppraisalStore } from '../model/appraisalStore';
import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const TradeInWizard: React.FC = () => {
  const { 
    step, 
    formData, 
    isOffline, 
    setStep, 
    updateFormData, 
    setOffline, 
    reset 
  } = useAppraisalStore();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const saveAppraisal = useSaveAppraisal();

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  const nextStep = () => setStep(Math.min(step + 1, 3));
  const prevStep = () => setStep(Math.max(step - 1, 1));
  const resetWizard = () => {
    setResult(null);
    reset();
  };

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
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-12 -mt-32" />
      
      <AppraisalHeader step={step} />

      {isOffline && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-500 text-xs font-black uppercase tracking-widest"
        >
          <WifiOff size={18} />
          Richard Sentinel: Offline Mode Active. Progress will be saved locally.
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1VehicleInfo 
            formData={formData} 
            setFormData={(data) => updateFormData(typeof data === 'function' ? data(formData) : data)}
            onNext={nextStep}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />
        )}

        {step === 2 && (
          <Step2ConditionMileage 
            formData={formData} 
            setFormData={(data) => updateFormData(typeof data === 'function' ? data(formData) : data)}
            onNext={nextStep}
            onPrev={prevStep}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />
        )}

        {step === 3 && (
          <Step3PhotoUpload 
            onSimulate={handleSimulateAppraisal}
            loading={loading}
          />
        )}

        {step === 4 && (
          <Step4Success 
            result={result}
            onReset={resetWizard}
          />
        )}
      </AnimatePresence>

      <AppraisalFooter />
    </div>
  );
};
