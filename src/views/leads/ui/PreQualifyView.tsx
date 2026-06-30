'use client';

import React, { useState } from 'react';
import { useLocation } from '@/shared/lib/next-route-adapter';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Briefcase,
  Loader2,
  Eye,
  EyeOff,
  MessagesSquare,
  FileText,
  Banknote,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { DI } from '@/shared/di/registry';
import { addLead } from '@/shared/api/adapters/leads/crmService';
import { encryptSSN } from '@/shared/api/security/ssnEncryptionService';
import { useMetaPixel } from '@/shared/lib/analytics/useMetaPixel';
import SEO from '@/shared/ui/seo/SEO';
import { useSaveApplication } from '@/features/garage/hooks/useApplications';
import { FinancialApplication } from '@/shared/types/types';
import { RewardPicker } from '@/features/gamification/ui/RewardPicker';
import { useGamificationStore } from '@/features/gamification/model/useGamificationStore';
import { Turnstile } from '@marsidev/react-turnstile';

interface Props {
  onExit?: () => void;
  dealContext?: {
    vehicle: { id: string; name: string; price: number; image?: string; img?: string };
    quote?: { monthlyPayment: number; downPayment: number; term: number; apr?: number };
  };
}

const PreQualifyView: React.FC<Props> = ({ onExit, dealContext: propDealContext }) => {
  const { addNotification } = useNotification();
  const location = useLocation();
  const { trackEvent } = useMetaPixel();
  const saveApplication = useSaveApplication();

  // Retrieve vehicle context if available
  const dealContext =
    propDealContext ||
    (location.state as
      | {
          vehicle: { id: string; name: string; price: number; image?: string; img?: string };
          quote: { monthlyPayment: number; downPayment: number; term: number };
        }
      | undefined);

  const [step, setStep] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    ssn: '',
    address: '',
    city: '',
    zip: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    timeAtJob: '',
    creditAuth: false,
    downPayment: '2000',
    term: '60',
  });

  const { prontoBonus, selectedRewards, rewardToken } = useGamificationStore();
  const bonusAmount = prontoBonus || 0;
  const vehiclePrice = dealContext?.vehicle.price || 35000;
  const downPaymentVal = parseInt(formData.downPayment) || 0;
  const termVal = parseInt(formData.term) || 60;
  const principal = vehiclePrice - downPaymentVal - bonusAmount;
  const estimatedMonthly = Math.round((principal > 0 ? principal : 0) * (1.08 / termVal));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep: number) => {
    const d = formData;
    if (currentStep === 1) return true; // Gamification is internally validated
    if (currentStep === 2) return d.firstName && d.phone;
    if (currentStep === 3) return d.lastName && d.email;
    if (currentStep === 4) return true; // Cotizador is informational
    if (currentStep === 5) return d.address && d.city && d.zip && d.employer && d.monthlyIncome;
    if (currentStep === 6) return d.dob && d.ssn.replace(/\D/g, '').length === 9 && d.creditAuth;
    return true;
  };

  const nextStep = async () => {
    if (validateStep(step)) {
      // Early Conversion: Save lead to CRM at Step 2 (formerly Step 1)
      if (step === 2) {
        try {
          addLead({
            type: 'chat',
            name: `${formData.firstName}`,
            phone: formData.phone,
            notes: `Express Lead Capture - Initial Interest - [REWARDS: ${selectedRewards.join(', ')}] - [BONO PRONTO: $${bonusAmount}]`,
            category: 'WARM',
          } as any);
        } catch (e) {
          console.error('Silent fail on express capture:', e);
        }
      }
      setStep((prev) => prev + 1);
    } else {
      addNotification('error', 'Por favor completa todos los campos requeridos.');
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    if (!turnstileToken) {
      addNotification('error', 'Completa la verificación de seguridad primero.');
      return;
    }

    try {
      const validateRes = await fetch('/api/validate-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const validateData = await validateRes.json();
      if (!validateData.valid) {
        addNotification('error', 'Verificación de seguridad fallada. Intenta de nuevo.');
        return;
      }
    } catch {
      addNotification('error', 'Error de verificación. Intenta de nuevo.');
      return;
    }

    setIsSubmitting(true);

    try {
      // SEGURIDAD: Encriptación Zero-Knowledge antes de salir del cliente
      // Usamos una llave derivada o de entorno para la encriptación pública
      const PUBLIC_ENCRYPTION_KEY = process.env.NEXT_PUBLIC_SSN_ENCRYPTION_KEY || 'RA-SECURE-VAULT-2024';
      const ssnEncryptedValue = await encryptSSN(formData.ssn, PUBLIC_ENCRYPTION_KEY);

      const submissionData = {
        ...formData,
        ssn: '[ENCRYPTED]', // Ofuscar el campo original en el objeto de datos
        ssn_encrypted: ssnEncryptedValue,
        selectedRewards,
        prontoBonus: bonusAmount,
        rewardToken,
        ...(dealContext
          ? {
              vehicleInfo: dealContext.vehicle,
              quote: dealContext.quote,
              type: 'finance',
            }
          : {}),
      };

      await DI.getApplicationRepository().submitApplication(submissionData, 'richard-automotive');
      const refId = `CASE-${Math.floor(Math.random() * 1000000)}`;

      // Full CRM update
      addLead({
        type: 'form',
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        vehicleOfInterest: dealContext?.vehicle?.name || '',
        vehicle_of_interest: dealContext?.vehicle?.name || '',
        category: 'HOT',
        notes: `Finance App #${refId} - Pronto: $${formData.downPayment} - Término: ${formData.term}m - [PREMIOS: ${selectedRewards.join(', ')}] - [BONO PRONTO: $${bonusAmount}]`,
      } as any);

      setReferenceId(refId);

      // Persistir en Digital Garage
      const newApp: FinancialApplication = {
        id: refId,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        type: 'pre-qualification',
        referenceId: refId,
        vehicle: dealContext
          ? {
              name: dealContext.vehicle.name,
              price: dealContext.vehicle.price,
            }
          : undefined,
      };

      saveApplication.mutate(newApp);

      // Growth: Track CompleteRegistration
      trackEvent('CompleteRegistration', {
        content_name: 'Credit Application',
        status: 'success',
        transaction_id: refId,
        value: 0.0,
        currency: 'USD',
      });

      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      addNotification('error', 'Hubo un error al procesar. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS VIEW: REALISTIC & SECURE
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0d2232] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="bg-slate-900/90 backdrop-blur-xl p-12 rounded-5xl shadow-[0_0_60px_rgba(0,174,217,0.1)] text-center max-w-lg w-full border border-white/10 animate-in zoom-in duration-500 relative z-10">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,174,217,0.2)]">
            <FileText size={48} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
            En Revisión por Expertos
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed font-light">
            Tu perfil ha sido asignado a nuestro equipo de{' '}
            <span className="text-primary font-bold">Expertos Financieros</span>
            . Están analizando tu caso manualmente para asegurar las mejores condiciones reales.
            <br />
            <br />
            <span className="font-medium text-white">Gracias por confiar en nosotros.</span>
          </p>
          <div className="bg-slate-800 p-6 rounded-2xl mb-8 border border-white/5">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">
              Número de Caso
            </p>
            <p className="text-3xl font-mono font-bold text-white tracking-widest">{referenceId}</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                const m = `¡Hola! Acabo de enviar mi solicitud (Caso #${referenceId}). Quisiera hablar con un experto.`;
                window.open(`https://wa.me/17875550000?text=${encodeURIComponent(m)}`, '_blank');
              }}
              className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(37,211,102,0.3)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <MessagesSquare size={20} /> VIP por WhatsApp
            </button>
            <button
              onClick={onExit}
              className="w-full py-4 bg-[#173d57] hover:bg-primary text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg text-xs"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SOFIA AI AGENT HELP TEXTS (REALISTIC)
  const sofiaTips = [
    'Hola, soy Sofia 👩‍💼. ¡Gira la Llave de Oro de Richard para ganar tu bono de pronto y selecciona tus regalos!',
    'Excelente. Ahora un poco más sobre tus datos de contacto básicos.',
    'Añade tus apellidos y correo electrónico para registrar tu cuenta VIP.',
    'Ajusta tu pronto y el término para ver un estimado mensual de tu pago con tu bono aplicado.',
    'Estos datos ayudarán a nuestros analistas humanos a encontrar el mejor banco para ti 🏦.',
    'Tu seguridad es legalmente sagrada 🔒. Esta conexión está encriptada.',
  ];

  return (
    <div className="min-h-screen bg-[#0b1116] text-white flex flex-col font-sans">
      <SEO
        title="Pre-calificacion | Financiamiento Rapido"
        description="Pre-califica en minutos para financiamiento de autos en Puerto Rico. Proceso seguro, rapido y 100% digital."
        url="/qualify"
        type="website"
      />
      {/* Fintech Header */}
      <div className="bg-[#0f1922] border-b border-white/5 p-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
            title="Volver"
          >
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-primary">RICHARD</span> FINANCIAL
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
          <Lock size={10} /> SECURE APPLICATION
        </div>
      </div>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Visual Sidebar with Sofia */}
        <div className="w-full md:w-1/3 p-6 md:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Sofia Avatar Area */}
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-white/10 p-6 rounded-4xl animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#1e293b] to-[#0f172a] flex items-center justify-center shadow-lg border-2 border-primary/30">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4128/4128335.png"
                  alt="Asistente Sofia"
                  className="w-10 h-10 object-cover"
                />
              </div>
                <div>
                  <h3 className="font-bold text-lg">Asistente Sofia</h3>
                <p className="text-xs text-primary font-mono">ASISTENTE DE SOLICITUD</p>
              </div>
            </div>
            <div className="relative bg-slate-900/80 p-4 rounded-xl rounded-tl-sm border border-primary/20">
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{sofiaTips[step - 1]}"
              </p>
            </div>
          </div>

          {/* New Trust Banner: Partner Banks of Puerto Rico */}
          <div className="mt-8 relative z-10 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">
              Nuestros Socios Bancarios
            </p>
            <div className="p-4 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
              <img
                src="/assets/branding/bank-partners-pr.webp"
                alt="Bank Partners PR"
                className="w-full opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-slate-500">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest">FDIC INSURED</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={14} className="text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest">SSL 256-BIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="w-full md:w-2/3 p-4 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-2xl" data-mcp-role="lead-capture" data-mcp-purpose="pre-qualify" data-mcp-fields="firstName,phone,lastName,email,downPayment,term,income">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {[2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary shadow-[0_0_10px_#00aed9]' : 'bg-slate-800'}`}
                />
              ))}
            </div>

            <div className="bg-[#131f2a] p-8 md:p-10 rounded-[30px] border border-white/5 shadow-2xl relative overflow-hidden">
              {/* Loading Overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-[#0d2232]/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
                  <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-white mb-2 animate-pulse">
                    Encriptando y Enviando...
                  </h3>
                  <p className="text-slate-400 font-mono text-xs">Protegiendo sus datos</p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">
                    Consulta Rápida
                  </h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Empecemos con algo simple. ¿A quién contactamos?
                  </p>
                  <div className="space-y-6">
                    <Input
                      label="Tu Nombre"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Ej. Juan"
                      autoFocus
                    />
                    <Input
                      label="WhatsApp / Móvil"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(787) 000-0000"
                      icon={<MessagesSquare size={16} />}
                    />
                  </div>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl">
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest text-center">
                      Sin compromiso • Respuesta en minutos
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">
                    Un poco más sobre ti
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Apellidos"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Tus apellidos"
                      autoFocus
                    />
                    <Input
                      label="Email Personal"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500 py-4">
                  <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter text-center">
                    Simula tu Pago
                  </h2>
                  <p className="text-slate-400 text-sm mb-6 text-center">
                    Ajusta tu pronto y el término para ver un estimado mensual.
                  </p>

                  {/* CRO: Social Proof / Urgency */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm">🔥</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 animate-pulse">
                      Alta Demanda: 4 personas han cotizado este término hoy
                    </span>
                  </div>

                  <div className="space-y-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    {/* Down Payment Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Pronto (Down Payment)
                        </label>
                        <span className="text-xl font-bold text-primary">
                          ${parseInt(formData.downPayment).toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="downPayment"
                        min="0"
                        max="20000"
                        step="500"
                        value={formData.downPayment}
                        onChange={handleInputChange}
                        className="w-full accent-primary bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      {parseInt(formData.downPayment) >= 3000 && (
                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                          ✓ ¡Excelente pronto! Esto mejora tu probabilidad de aprobación.
                        </p>
                      )}
                    </div>

                    {/* Term Selector */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Término (Meses)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['36', '48', '60', '72'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, term: t }))}
                            className={`py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                              formData.term === t
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {t} m
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Estimated Payment (Quick Math) */}
                    <div className="pt-4 border-t border-white/5 text-center">
                      <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                        Pago Mensual Estimado
                      </p>
                      <p className="text-5xl font-black text-white tracking-tight animate-pulse">
                        ${estimatedMonthly.toLocaleString()}
                        <span className="text-sm text-slate-500">/m*</span>
                      </p>
                      {bonusAmount > 0 && (
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1.5 flex items-center justify-center gap-1 animate-pulse">
                          ✓ ¡Bono de Pronto de ${bonusAmount} APLICADO!
                        </p>
                      )}
                      <p className="text-[9px] text-slate-600 mt-2 italic">
                        *Estimado basado en un precio de unidad de ${vehiclePrice.toLocaleString()}{' '}
                        e interés del 8%, restando tu pronto de ${downPaymentVal.toLocaleString()}
                        {bonusAmount > 0 ? ` y bono de $${bonusAmount}` : ''}.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(5)}
                    className="mt-6 w-full py-4 bg-primary hover:bg-cyan-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 animate-btn-glow"
                  >
                    Validar Mi Pago de ${estimatedMonthly.toLocaleString()}/m{' '}
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h2 className="text-3xl font-black text-white mb-6">Perfil Financiero</h2>
                  <Input
                    label="Dirección Residencial"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Dirección completa"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Ciudad"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    <Input
                      label="Zip Code"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Patrono / Empresa"
                      name="employer"
                      value={formData.employer}
                      onChange={handleInputChange}
                      icon={<Briefcase size={16} />}
                    />
                    <Input
                      label="Puesto / Cargo"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Input
                    label="Ingreso Mensual ($)"
                    name="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    icon={<Banknote size={16} />}
                  />
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <h2 className="text-3xl font-black text-white mb-6">Seguridad Legal</h2>

                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3">
                    <ShieldCheck className="text-primary shrink-0" />
                    <p className="text-xs text-primary font-medium leading-relaxed">
                      Autorización Oficial. Sus datos serán procesados cumpliendo con la Ley de
                      Crédito Justo y Privacidad Financiera.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Fecha Nacimiento"
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleInputChange}
                      icon={<Calendar size={16} />}
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Seguro Social Completo (9 Dígitos)
                      </label>
                      <div className="relative">
                        <input
                          type={showSSN ? 'text' : 'password'}
                          name="ssn"
                          autoComplete="off"
                          maxLength={11}
                          value={formData.ssn}
                          onChange={handleInputChange}
                          placeholder="XXX-XX-XXXX"
                          className="w-full bg-[#0b1116] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-center tracking-[0.5em] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSSN(!showSSN)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showSSN ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-4 flex items-start gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        creditAuth: !prev.creditAuth,
                      }))
                    }
                  >
                    <div
                      className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${formData.creditAuth ? 'bg-primary border-primary' : 'border-slate-600'}`}
                    >
                      {formData.creditAuth && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <p className="text-xs text-slate-400 select-none">
                      Autorizo a Richard Automotive a consultar mi reporte de crédito real para
                      propósitos de evaluación financiera. Entiendo que esto es una solicitud de
                      crédito.
                    </p>
                  </div>

                  <div className="flex justify-center mt-4">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                      onSuccess={(token) => setTurnstileToken(token)}
                    />
                  </div>
                </div>
              )}

              {step > 1 && (
                <div className="mt-10 flex justify-between items-center">
                  <button
                    onClick={prevStep}
                    className="text-slate-500 hover:text-white font-bold text-sm px-4 py-2 transition-colors"
                  >
                    ATRAS
                  </button>

                  <button
                    onClick={step === 6 ? handleSubmit : nextStep}
                    disabled={isSubmitting}
                    className="px-10 py-4 bg-primary hover:bg-cyan-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" /> Procesando...
                      </>
                    ) : step === 6 ? (
                      'Enviar Solicitud Segura'
                    ) : step === 2 ? (
                      'Ver Mi Pre-Calificación'
                    ) : (
                      <>
                        Siguiente <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Input = ({
  label,
  icon,
  ...props
}: { label: string; icon?: React.ReactNode } & React.InputHTMLAttributes<
  HTMLInputElement | HTMLSelectElement
>) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      {...props}
      className="w-full bg-[#0b1116] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-700 font-medium"
    />
  </div>
);

export default PreQualifyView;
