import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, ChevronRight, CheckCircle, CreditCard, 
  ShieldCheck, Zap, ArrowRightLeft, TrendingUp,
  Building2, Landmark, Wallet
} from 'lucide-react';
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

const PROBABILITY_BY_TIER: Record<string, { percent: number; color: string; label: string }> = {
  excellent: { percent: 98, color: 'text-emerald-400', label: 'Probabilidad Altísima' },
  good: { percent: 85, color: 'text-cyan-400', label: 'Alta Probabilidad' },
  fair: { percent: 65, color: 'text-amber-400', label: 'Aprobación Táctica' },
  poor: { percent: 45, color: 'text-orange-400', label: 'Segunda Oportunidad' },
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
  const [downPayment, setDownPayment] = useState<number>(basePrice * 0.1);
  const [tradeIn, setTradeIn] = useState<number>(0);
  const [showTradeIn, setShowTradeIn] = useState(false);
  const [tier, setTier] = useState<CreditTier>('good');
  const [term, setTerm] = useState<number>(72);
  
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  
  // Lead Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Financial calculation with Trade-in
  useEffect(() => {
    const principal = price - downPayment - tradeIn;
    if (principal <= 0) {
      setMonthlyPayment(0);
      return;
    }
    
    const rate = tier ? CREDIT_RATES[tier] : 10;
    const monthlyRate = (rate / 100) / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
    setMonthlyPayment(Math.max(0, payment));
  }, [price, downPayment, tradeIn, tier, term]);

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
          category: 'finance_pre_qual_v2',
          insights: [
            `Simulador FlexDrive™ v2 Completado`,
            `Crédito: ${tier}`,
            `Pronto: $${downPayment}`,
            `Trade-in: $${tradeIn}`,
            `Pago Estimado: $${monthlyPayment.toFixed(0)} / ${term} meses`
          ],
          nextAction: 'Confirmar documentos de ingreso para aprobación final',
          reasoning: 'Usuario interactuó con el simulador avanzado incluyendo trade-in.',
          unidad_interes: vehicleName
        },
        closureProbability: PROBABILITY_BY_TIER[tier || 'good'].percent,
      });
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to submit finance lead', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentProb = useMemo(() => PROBABILITY_BY_TIER[tier || 'good'], [tier]);

  return (
    <div className="relative w-full max-w-xl mx-auto overflow-hidden rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] p-0.5 font-sans">
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 rounded-full transition-colors duration-1000 ${
        tier === 'excellent' ? 'bg-amber-400' : 'bg-cyan-500'
      }`}></div>
      
      <div className="relative z-10 p-8 md:p-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-inner">
              <Calculator className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter italic">FlexDrive™ <span className="text-cyan-400">PRO</span></h2>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">Sentinel Finance v4.0</p>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col items-end">
             <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <div className={`w-2 h-2 rounded-full animate-pulse ${currentProb.color.replace('text', 'bg')}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${currentProb.color}`}>{currentProb.label}</span>
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Price and Term Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="ra-label-base">Precio de la Unidad</label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-ra-primary transition-colors">$</span>
                      <input 
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="ra-input-base pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="ra-label-base">Término (Meses)</label>
                    <select 
                      value={term}
                      onChange={(e) => setTerm(Number(e.target.value))}
                      className="ra-input-base appearance-none"
                    >
                      {[36, 48, 60, 72, 84].map(m => <option key={m} value={m} className="bg-slate-900">{m} meses</option>)}
                    </select>
                  </div>
                </div>

                {/* Financial Inputs: Pronto and Trade-in */}
                <div className="space-y-6">
                  <div className="p-6 glass-premium rounded-[2rem] border border-white/5 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <Wallet className="w-4 h-4 text-white/40" />
                          <label className="text-sm font-semibold text-white/80">Pronto / Down Payment</label>
                        </div>
                        <span className="text-xl font-black text-white">${downPayment.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min={0} max={price * 0.5} step={100} value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ra-primary"
                      />
                    </div>

                    {!showTradeIn ? (
                      <button 
                        onClick={() => setShowTradeIn(true)}
                        className="flex items-center space-x-2 text-xs font-bold text-ra-primary/70 hover:text-ra-primary transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>¿TIENES UN AUTO PARA TRADE-IN?</span>
                      </button>
                    ) : (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-ra-accent/60" />
                            <label className="text-sm font-semibold text-white/80">Valor de tu Trade-in</label>
                          </div>
                          <span className="text-xl font-black text-ra-accent">${tradeIn.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" min={0} max={price * 0.6} step={100} value={tradeIn}
                          onChange={(e) => setTradeIn(Number(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-ra-accent"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Credit Tier Selector */}
                <div>
                  <label className="ra-label-base">Perfil de Crédito</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(CREDIT_RATES) as CreditTier[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(t)}
                        className={`relative py-5 px-4 rounded-2xl border text-sm font-bold transition-all overflow-hidden group ${
                          tier === t 
                          ? 'bg-ra-primary/10 border-ra-primary/50 text-white shadow-[0_0_20px_rgba(0,242,255,0.15)]' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                        }`}
                      >
                        {tier === t && <motion.div layoutId="active-tier" className="absolute inset-0 bg-ra-primary/5 z-0" />}
                        <span className="relative z-10">{CREDIT_LABELS[t!]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary and CTA */}
                <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <p className="ra-label-base mb-2">Tu Inversión Mensual</p>
                    <div className="flex items-baseline justify-center md:justify-start space-x-2">
                      <span className="text-5xl font-black text-white tracking-tighter animate-pulse-slow">${Math.round(monthlyPayment)}</span>
                      <span className="text-white/30 font-bold text-sm tracking-widest">/MES*</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full md:w-auto px-10 py-5 bg-white text-black hover:bg-ra-primary transition-all rounded-full font-black text-sm uppercase tracking-widest shadow-[0_20px_40px_-12px_rgba(255,255,255,0.2)] flex items-center justify-center space-x-3 group"
                  >
                    <span>Bloquear Oferta</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              {/* Trust Bar */}
              <div className="pt-8 flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-3 h-3 text-white/20" />
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Banking Partners</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                  <TrustBank logo={<Landmark className="w-4 h-4" />} name="Popular" />
                  <TrustBank logo={<Landmark className="w-4 h-4" />} name="FirstBank" />
                  <TrustBank logo={<Landmark className="w-4 h-4" />} name="Oriental" />
                  <TrustBank logo={<Landmark className="w-4 h-4" />} name="Cooperativas" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-3xl p-6 mb-8 flex space-x-4 items-center">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Privacidad Certificada</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Tus datos están protegidos por **Richard Automotive Sentinel**. No impactamos tu historial de crédito en esta fase.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nombre" value={firstName} onChange={setFirstName} placeholder="Richard" />
                <InputField label="Apellidos" value={lastName} onChange={setLastName} placeholder="Mendez" />
              </div>

              <InputField label="Teléfono (Para WhatsApp VIP)" type="tel" value={phone} onChange={setPhone} placeholder="(787) 555-5555" />
              <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="richard@centralford.com" />

              <div className="pt-6 flex space-x-4">
                <button type="button" onClick={() => setStep(1)} className="px-8 py-4 rounded-full border border-white/10 text-white/50 hover:bg-white/5 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
                  Atrás
                </button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-ra-primary text-black rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-white transition-all flex justify-center items-center">
                  {isLoading ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> : 'Obtener mi Pre-Aprobación'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full"></div>
                <div className="relative w-full h-full bg-green-500/10 border border-green-500/20 rounded-[2.5rem] flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">¡Sentinel VIP Activado!</h3>
              <p className="text-white/50 leading-relaxed mb-10 max-w-sm mx-auto">
                Hemos reservado tu pago de <strong className="text-white">${Math.round(monthlyPayment)}/mes</strong>. Richard o un especialista de **Central Ford** se comunicará contigo de inmediato vía WhatsApp.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-center space-x-4">
                <Zap className="w-6 h-6 text-ra-accent" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Prioridad: High-Intent Fast Track</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function TrustBank({ logo, name }: { logo: React.ReactNode; name: string }) {
  return (
    <div className="flex items-center space-x-2 grayscale hover:grayscale-0 transition-all cursor-default group">
      <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20">
        {logo}
      </div>
      <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">{name}</span>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="space-y-2">
      <label className="ra-label-base">{label}</label>
      <input 
        required type={type} placeholder={placeholder} value={value} 
        onChange={e => onChange(e.target.value)} 
        className="ra-input-base text-sm placeholder:text-white/10" 
      />
    </div>
  );
}
