import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronRight, CheckCircle, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { leadService } from '@/entities/lead';

interface ApprovalSimulatorWidgetProps {
  vehicleId?: string;
  vehicleName?: string;
  basePrice?: number;
  dealerId?: string;
  onSuccess?: () => void;
}

type CreditTier = 'excellent' | 'good' | 'fair' | 'poor' | null;

const CREDIT_RATES: Record<string, number> = {
  excellent: 5.9,
  good: 8.9,
  fair: 14.5,
  poor: 21.9,
};

const CREDIT_LABELS: Record<string, string> = {
  excellent: 'Excelente (720+)',
  good: 'Bueno (680-719)',
  fair: 'Regular (620-679)',
  poor: 'Reconstruyendo (<619)',
};

export const ApprovalSimulatorWidget: React.FC<ApprovalSimulatorWidgetProps> = ({
  vehicleId,
  vehicleName = 'tu próximo vehículo',
  basePrice = 25000,
  dealerId = 'richard-automotive',
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [price, setPrice] = useState<number>(basePrice);
  const [downPayment, setDownPayment] = useState<number>(basePrice * 0.1); // 10% down by default
  const [tier, setTier] = useState<CreditTier>('good');
  const [term, setTerm] = useState<number>(72); // months
  
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  
  // Lead Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simple monthly calculation
  useEffect(() => {
    const principal = price - downPayment;
    if (principal <= 0) {
      setMonthlyPayment(0);
      return;
    }
    
    const rate = tier ? CREDIT_RATES[tier] : 10;
    const monthlyRate = (rate / 100) / 12;
    // M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
    setMonthlyPayment(Math.max(0, payment));
  }, [price, downPayment, tier, term]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await leadService.saveLead({
        firstName,
        lastName,
        phone,
        email,
        vehicleId,
        vehicleOfInterest: vehicleName,
        type: 'finance',
        status: 'new',
        aiAnalysis: {
          score: tier === 'excellent' ? 95 : tier === 'good' ? 80 : tier === 'fair' ? 60 : 40,
          category: 'finance_pre_qual',
          insights: [
            `Financing Simulator Completed`,
            `Credit Tier: ${tier}`,
            `Down Payment: $${downPayment} (${((downPayment/price)*100).toFixed(0)}%)`,
            `Target Monthly: $${monthlyPayment.toFixed(0)} / ${term}mos`
          ],
          nextAction: 'Llamar y ofrecer pre-aprobación del banco',
          reasoning: 'Usuario validó su pago cómodamente antes de enviarlo.',
          unidad_interes: vehicleName
        },
        closureProbability: tier === 'excellent' ? 85 : tier === 'good' ? 70 : 45,
      });
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit finance lead', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-1 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black/20 to-purple-900/40 z-0"></div>
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2.5 bg-indigo-500/20 rounded-xl">
            <Calculator className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Simulador FlexDrive™</h2>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Precio Estimado ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-white/50">$</span>
                  <input 
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-lg"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-white/70 block">Pronto / Down Payment</label>
                  <span className="text-sm font-bold text-indigo-400">${downPayment.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={price} 
                  step={500}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-3 block">¿Cómo evalúas tu crédito?</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(CREDIT_RATES) as CreditTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        tier === t 
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                        : 'bg-black/30 border-white/10 text-white/60 hover:bg-black/50 hover:border-white/20'
                      }`}
                    >
                      {CREDIT_LABELS[t!]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-white/50 mb-1 uppercase tracking-wider font-semibold">Pago Mensual Estimado</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-black text-white">${Math.round(monthlyPayment)}</span>
                    <span className="text-white/50 font-medium">/ mes</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center space-x-2 group"
                >
                  <span>Pre-cualificar Ahora</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-xl p-4 mb-6 flex space-x-4 items-center">
                <ShieldCheck className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                  Tranquilo, esto <strong>no impactará tu historial crediticio</strong>. Solo necesitamos unos datos para blindar tu oferta de ${Math.round(monthlyPayment)}/mes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Nombre</label>
                  <input required placeholder="Richard" value={firstName} onChange={e=>setFirstName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-white/60 mb-1.5 block">Apellidos</label>
                  <input required placeholder="Mendez" value={lastName} onChange={e=>setLastName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Teléfono Móvil (Recibirás la confirmación por SMS)</label>
                <input required type="tel" placeholder="(787) 555-5555" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1.5 block">Correo Electrónico</label>
                <input required type="email" placeholder="richard@example.com" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setStep(1)} className="px-5 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors font-medium">
                  Volver
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity flex justify-center items-center">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    'Revelar mi Aprobación Flex'
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">¡Pre-cualificación Recibida!</h3>
              <p className="text-white/70 leading-relaxed mb-6">
                Hemos asegurado tu simulación de <strong className="text-white">${Math.round(monthlyPayment)}/mes</strong> para {vehicleName}. Nuestro equipo de finanzas premium te contactará en breve vía WhatsApp con los próximos pasos, sin fricción y 100% transparente.
              </p>
              
              <div className="p-4 bg-black/30 rounded-xl border border-white/10 inline-flex items-center space-x-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-white/90">Prioridad asignada bajo VIP Fast-Track.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
