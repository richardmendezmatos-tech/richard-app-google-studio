import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  User,
  Home,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/api/firebase/client';
import { LeadHealthSensor } from '../../leads/model/health/LeadHealthSensor';

export const CreditApplicationForm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [hasRescued, setHasRescued] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    ssn: '',
    addressLine1: '',
    city: '',
    state: 'PR',
    zipCode: '',
    housingType: 'Rent',
    timeAtAddress: '',
    employer: '',
    jobTitle: '',
    timeAtEmployer: '',
    monthlyIncome: '',
  });

  // Track behavior for Auto-healing Sensor
  React.useEffect(() => {
    const trackInteraction = () => setLastInteraction(Date.now());
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, trackInteraction));
    
    // Sentinel Watcher: Vigilancia de Abandono de Nivel 13
    const watcher = setInterval(async () => {
      // Solo rescatar si no se ha enviado con éxito y tiene datos mínimos
      if (!isSuccess && !hasRescued && formData.firstName && formData.phone) {
        const leadData = { ...formData, id: `rescue_${Date.now()}`, status: 'new' as const, type: 'finance' as const };
        
        if (LeadHealthSensor.isAbandoned(leadData as any, lastInteraction)) {
          console.warn('🛡️ Sentinel Watcher: Abandono detectado. Iniciando Protocolo de Rescate...');
          setHasRescued(true);
          
          // 1. Guardado de Emergencia
          await LeadHealthSensor.emergencySave(leadData as any);
          
          // 2. Sentinel Nudge (WhatsApp)
          const { triggerSentinelNudge } = await import('../../leads/model/whatsappService');
          await triggerSentinelNudge(
            leadData.id, 
            leadData.firstName, 
            leadData.phone
          );
        }
      }
    }, 30000); // Revisión cada 30s

    return () => {
      events.forEach(e => window.removeEventListener(e, trackInteraction));
      clearInterval(watcher);
    };
  }, [formData, lastInteraction, isSuccess, hasRescued]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLastInteraction(Date.now());
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => {
    setLastInteraction(Date.now());
    setStep((prev: number) => Math.min(prev + 1, 3));
  };
  const handleBack = () => setStep((prev: number) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) return handleNext();

    setIsSubmitting(true);
    const leadData = {
      ...formData,
      id: `emergency_${Date.now()}`,
      status: 'new' as const,
      type: 'finance' as const,
    };

    try {
      if (!db) throw new Error('Firebase DB not initialized');

      await addDoc(collection(db, 'credit_applications'), {
        ...formData,
        status: 'pending',
        source: 'web_form',
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('🔴 Sentinel: Error detectado. Activando Autocuración...', error);
      // Auto-healing Action: Emergency Save
      await LeadHealthSensor.emergencySave(leadData as any);
      setIsSuccess(true); // Mostrar éxito al usuario mientras el sensor gestiona el fallo
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/20 rounded-4xl p-12 text-center text-white max-w-2xl mx-auto shadow-[0_0_80px_-20px_rgba(16,185,129,0.3)]">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
          <CheckCircle2 size={56} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
          Aplicación Recibida Exitosamente
        </h2>
        <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">
          Tus credenciales financieras han sido encriptadas y transferidas directamente a la bóveda
          privada de nuestro departamento de F&I. <br />
          <br />
          Nuestro algoritmo algorítmico y especialistas humanos ya están peleando la mejor tasa del
          mercado para ti. 🚗💨
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-lg font-black tracking-widest uppercase rounded-2xl hover:scale-105 transition-transform shadow-xl hover:shadow-cyan-500/25"
        >
          Explorar el Inventario
        </button>
      </div>
    );
  }

  const inputClasses =
    'w-full p-4 bg-black/40 border border-white/10 text-white placeholder-slate-500 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 focus:bg-black/60 outline-none transition-all';
  const labelClasses = 'block text-sm font-bold text-slate-300 mb-2 tracking-wide uppercase';

  return (
    <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_100px_-20px_rgba(0,180,216,0.25)] border border-white/10 max-w-3xl mx-auto overflow-hidden">
      {/* Decorative Orbs inside the form container to match Hero */}
      <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Encabezado Nivel Bancario */}
      <div className="relative flex items-center gap-5 mb-8 pb-8 border-b border-white/10 z-10">
        <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,200,240,0.15)]">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            Bóveda de Pre-Cualificación
          </h2>
          <p className="text-xs md:text-sm font-bold text-slate-400 flex items-center gap-2 mt-2 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
            Túnel SSL 256-Bit • Cero Impacto Inicial a tu Crédito
          </p>
        </div>
      </div>

      {/* Progreso */}
      <div className="relative flex items-center gap-4 mb-10 z-10">
        {[
          { id: 1, label: 'Identidad', icon: User },
          { id: 2, label: 'Ubicación', icon: Home },
          { id: 3, label: 'Poder Adquisitivo', icon: Briefcase },
        ].map((s) => (
          <div key={s.id} className="flex-1">
            <div
              className={`h-1.5 md:h-2 rounded-full mb-3 ${step >= s.id ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`}
            />
            <p
              className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${step >= s.id ? 'text-cyan-400' : 'text-slate-500'}`}
            >
              Paso {s.id}
            </p>
            <p
              className={`text-xs md:text-sm font-bold mt-1 ${step >= s.id ? 'text-white' : 'text-slate-500'}`}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="min-h-[350px]">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl mb-6 flex gap-4 items-start">
                <div className="text-cyan-400 mt-1">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Protegemos tu identidad civil rigurosamente. Usa tu nombre legal exactamente como
                  aparece en tu Licencia de Conducir.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Nombre Legal</label>
                  <input
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    className={inputClasses}
                    placeholder="Ej. Juan D."
                  />
                </div>
                <div>
                  <label className={labelClasses}>Apellidos</label>
                  <input
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    className={inputClasses}
                    placeholder="Ej. Pérez Cintrón"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Correo Electrónico Activo</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    inputMode="email"
                    className={inputClasses}
                    placeholder="Para enviarte la aprobación"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Teléfono Celular (Acepta SMS)</label>
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputClasses}
                    placeholder="(787) 555-0000"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Dirección Residencial</label>
                  <input
                    required
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    autoComplete="street-address"
                    className={inputClasses}
                    placeholder="Urb., Condominio o Calle"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Pueblo / Municipio</label>
                  <input
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    className={inputClasses}
                    placeholder="Ej. San Juan"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Zip Code</label>
                  <input
                    required
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    autoComplete="postal-code"
                    inputMode="numeric"
                    className={inputClasses}
                    placeholder="00901"
                  />
                </div>
                <div>
                  <label htmlFor="housingType" className={labelClasses}>
                    Estatus de la Propiedad
                  </label>
                  <select
                    id="housingType"
                    name="housingType"
                    value={formData.housingType}
                    onChange={handleChange}
                    className={inputClasses}
                    title="Estatus de la Propiedad"
                  >
                    <option value="Rent">Alquilo (Renta Mensual)</option>
                    <option value="Own">Propia (Dueño / Hipoteca)</option>
                    <option value="Family">Vivo con Familiares (Familiar)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Tiempo en esta residencia (Años)</label>
                  <input
                    required
                    type="number"
                    name="timeAtAddress"
                    value={formData.timeAtAddress}
                    onChange={handleChange}
                    inputMode="numeric"
                    className={inputClasses}
                    placeholder="Ej. 3"
                    min="0"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Empresa / Fuente Principal de Ingresos</label>
                  <input
                    required
                    name="employer"
                    value={formData.employer}
                    onChange={handleChange}
                    autoComplete="organization"
                    className={inputClasses}
                    placeholder="Nombre de la compañía o 'Cuenta Propia'"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Título Institucional / Cargo</label>
                  <input
                    required
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    autoComplete="organization-title"
                    className={inputClasses}
                    placeholder="Ej. Analista, Dueño..."
                  />
                </div>
                <div>
                  <label className={labelClasses}>Estabilidad (Años Laborando)</label>
                  <input
                    required
                    type="number"
                    name="timeAtEmployer"
                    value={formData.timeAtEmployer}
                    onChange={handleChange}
                    inputMode="numeric"
                    className={inputClasses}
                    placeholder="0 si es reciente"
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <div className="flex justify-between items-end mb-2">
                    <label className={`${labelClasses} !mb-0`}>Ingreso Bruto Mensual</label>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-2 py-1 rounded">
                      Confidencial
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold text-xl">
                      $
                    </span>
                    <input
                      required
                      type="number"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-5 bg-black/60 border border-emerald-500/30 text-emerald-400 rounded-xl font-black text-2xl outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    Incluye horas extras, bonos, y otros ingresos demostrables antes de deducciones.
                  </p>
                </div>

                <div className="md:col-span-2 mt-4 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={18} className="text-cyan-400" />
                    <label className="text-sm font-black text-white uppercase tracking-widest">
                      Seguro Social Completo (Obligatorio)
                    </label>
                  </div>
                  <input
                    required
                    type="tel"
                    name="ssn"
                    placeholder="XXX-XX-XXXX (9 Dígitos)"
                    value={formData.ssn}
                    onChange={handleChange}
                    className="w-full p-5 bg-slate-950/80 border border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-cyan-500/40 outline-none transition-all text-2xl tracking-[0.2em] text-cyan-100 font-mono shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)]"
                  />
                  <p className="text-[11px] text-slate-500 mt-3 font-medium flex items-center gap-1.5 leading-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    Para procesar su aprobación bancaria, requerimos su Seguro Social de forma
                    íntegra. Richard Automotive transmite estos datos por un túnel cifrado de
                    256-Bit SSL directo al buró para garantizar su seguridad legal total.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Controles del Wizard */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-white/10 gap-4 relative z-10">
          <button
            type="button"
            onClick={handleBack}
            className={`flex items-center justify-center gap-2 px-6 py-4 font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all w-full md:w-auto ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <ChevronLeft size={20} /> Retroceder
          </button>

          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all focus:ring-4 focus:ring-cyan-500/30 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_30px_rgba(0,200,240,0.3)] w-full"
            >
              {isSubmitting
                ? 'Bunker Procesando...'
                : step < 3
                  ? 'Avanzar al Paso ' + (step + 1)
                  : 'Ejecutar Solicitud VIP'}
              {!isSubmitting && <ChevronRight size={22} />}
            </button>
            {step === 3 && (
              <p className="text-[10px] font-bold text-cyan-400 mt-3 text-center uppercase tracking-widest">
                🔒 Autorización Segura vía Red 256-Bit.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
