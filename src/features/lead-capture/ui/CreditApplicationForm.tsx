import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Home, Briefcase, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

export const CreditApplicationForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ssn: '',
    // Step 2
    addressLine1: '',
    city: '',
    state: 'PR',
    zipCode: '',
    housingType: 'Rent',
    timeAtAddress: '',
    // Step 3
    employer: '',
    jobTitle: '',
    timeAtEmployer: '',
    monthlyIncome: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return handleNext();

    setIsSubmitting(true);
    try {
      // TODO: Connect to FirestoreLeadRepository to save Credit App
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-white max-w-2xl mx-auto shadow-2xl">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">Aplicación Recibida</h2>
        <p className="text-slate-400 text-lg mb-8">
          Tus datos crediticios han sido encriptados y enviados a nuestro departamento de F&I. 
          Un gerente se pondrá en contacto contigo pronto.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transition-colors"
        >
          Volver a la Vitrina
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4xl p-8 lg:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 max-w-3xl mx-auto">
      {/* Encabezado Nivel Bancario */}
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Comienza tu Pre-Cualificación</h2>
          <p className="text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Cifrado de Alta Seguridad de 256-Bit SSL
          </p>
        </div>
      </div>

      {/* Progreso */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { id: 1, label: 'Personal', icon: User },
          { id: 2, label: 'Residencia', icon: Home },
          { id: 3, label: 'Ingresos', icon: Briefcase },
        ].map(s => (
          <div key={s.id} className="flex-1">
            <div className={`h-2 rounded-full mb-3 ${step >= s.id ? 'bg-primary' : 'bg-slate-100'}`} />
            <p className={`text-xs font-bold uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-slate-400'}`}>
              Paso {s.id}
            </p>
            <p className={`text-sm font-bold ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="min-h-[350px]">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Apellidos</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono Celular</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Seguro Social (Seguro/Cifrado)</label>
                  <input required type="password" name="ssn" placeholder="XXX-XX-XXXX" value={formData.ssn} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xl tracking-widest" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Física</label>
                  <input required name="addressLine1" value={formData.addressLine1} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pueblo / Ciudad</label>
                  <input required name="city" value={formData.city} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Zip Code</label>
                  <input required name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Residencia</label>
                  <select name="housingType" value={formData.housingType} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Rent">Alquillo</option>
                    <option value="Own">Propia (Dueño)</option>
                    <option value="Family">Con Familia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tiempo en residencia (Años)</label>
                  <input required type="number" name="timeAtAddress" value={formData.timeAtAddress} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Patrono / Nombre del Empleo</label>
                  <input required name="employer" value={formData.employer} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Título / Cargo</label>
                  <input required name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tiempo en empleo (Años)</label>
                  <input required type="number" name="timeAtEmployer" value={formData.timeAtEmployer} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ingreso Mensual Bruto (Estimado)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 font-bold">$</span>
                    <input required type="number" name="monthlyIncome" value={formData.monthlyIncome} onChange={handleChange} className="w-full pl-8 pr-4 py-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-black text-xl outline-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Controles del Wizard */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-100">
          <button 
            type="button" 
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-4 font-bold text-slate-500 hover:text-slate-900 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={20} /> Atrás
          </button>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-xl"
          >
            {isSubmitting ? 'Procesando...' : step < 3 ? 'Continuar al Paso ' + (step + 1) : 'Someter Aplicación Segura'}
            {!isSubmitting && <ChevronRight size={20} />}
          </button>
        </div>
      </form>
    </div>
  );
};
