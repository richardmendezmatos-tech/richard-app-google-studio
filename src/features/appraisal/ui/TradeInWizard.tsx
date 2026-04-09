import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSaveAppraisal } from '@/entities/appraisal';
import { Appraisal } from '@/shared/types/types';
import { WifiOff } from 'lucide-react';
import { leadService } from '@/entities/lead/api/leadService';

// Sub-components
import { AppraisalHeader } from './components/AppraisalHeader';
import { Step1VehicleInfo } from './components/Step1VehicleInfo';
import { Step2ConditionMileage } from './components/Step2ConditionMileage';
import { Step3PhotoUpload } from './components/Step3PhotoUpload';
import { Step4Contact } from './components/Step4Contact';
import { Step4Success as Step5Success } from './components/Step4Success';
import { AppraisalFooter } from './components/AppraisalFooter';

import { useAppraisalStore } from '../model/appraisalStore';

export const TradeInWizard: React.FC = () => {
  const { 
    step, 
    formData, 
    contactData,
    isOffline, 
    errors,
    setStep, 
    updateFormData, 
    updateContactData,
    setOffline, 
    reset,
    validateStep
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

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(Math.min(step + 1, 4));
      
      // Sentinel Lead Interceptor (Passive Capture)
      if (step === 1 && formData.make && formData.model) {
        console.log('RA Sentinel: Intercepting partial lead...', formData);
        leadService.saveLead({
          firstName: 'Sentinel',
          lastName: 'Interceptor',
          email: 'sentinel.ra@richardautomotive.com', // Internal sentinel tag
          phone: '',
          notes: `RA-Elite Lead Intercepted: ${formData.year} ${formData.make} ${formData.model}`,
          status: 'new',
          source: 'ra-elite-wizard'
        });
      }
    }
  };

  const prevStep = () => setStep(Math.max(step - 1, 1));
  
  const resetWizard = () => {
    setResult(null);
    reset();
  };

  const handleSimulateAppraisal = () => {
    if (!validateStep(4)) return;

    setLoading(true);
    // Simulación de "Calculando con Richard Intelligence"
    setTimeout(() => {
      const base = 25000;
      const final = base - (parseInt(formData.mileage || '0') * 0.1);
      const calculatedValue = Math.max(final, 5000);
      
      setResult(calculatedValue);
      setLoading(false);
      setStep(5);

      // Guardar Lead Real con Contacto
      leadService.saveLead({
        firstName: contactData.name.split(' ')[0],
        lastName: contactData.name.split(' ').slice(1).join(' ') || '',
        email: '',
        phone: contactData.phone,
        notes: `RA-Elite Lead Final: ${formData.year} ${formData.make} ${formData.model}. Valor IA: $${calculatedValue}`,
        status: 'new',
        source: 'ra-elite-wizard'
      });

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

  const inputClasses = "ra-input-base font-tech uppercase tracking-widest text-sm";
  const labelClasses = "ra-label-base";

  return (
    <div className="glass-premium p-8 md:p-12 max-w-4xl mx-auto rounded-[3rem] border border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-12 -mt-32" />
      
      <AppraisalHeader step={step > 4 ? 4 : step} />

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
            setFormData={updateFormData}
            onNext={nextStep}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />
        )}

        {step === 2 && (
          <Step2ConditionMileage 
            formData={formData} 
            setFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            inputClasses={inputClasses}
            labelClasses={labelClasses}
          />
        )}

        {step === 3 && (
          <Step3PhotoUpload 
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {step === 4 && (
          <Step4Contact 
            contactData={contactData}
            setContactData={updateContactData}
            errors={errors}
            onSimulate={handleSimulateAppraisal}
            loading={loading}
            onPrev={prevStep}
          />
        )}

        {step === 5 && (
          <Step5Success 
            result={result}
            onReset={resetWizard}
          />
        )}
      </AnimatePresence>

      <AppraisalFooter />
    </div>
  );
};
