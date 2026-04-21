import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, ChevronRight, CheckCircle, CreditCard, 
  ShieldCheck, Zap, ArrowRightLeft, TrendingUp,
  Building2, Landmark, Wallet, Sparkles, CreditCard as CardIcon
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

const PROBABILITY_BY_TIER: Record<string, { percent: number; color: string; label: string; glow: string }> = {
  excellent: { percent: 98, color: 'text-emerald-400', label: 'Aprobación Inmediata', glow: 'bg-emerald-500' },
  good: { percent: 85, color: 'text-cyan-400', label: 'Alta Probabilidad', glow: 'bg-cyan-500' },
  fair: { percent: 65, color: 'text-amber-400', label: 'Aprobación Táctica', glow: 'bg-amber-500' },
  poor: { percent: 45, color: 'text-orange-400', label: 'Segunda Oportunidad', glow: 'bg-orange-500' },
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

  // Financial calculation
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
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-[3rem] bg-slate-950/40 backdrop-blur-3xl border border-white/5 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.8)] p-0.5 group/sim">
      {/* Neural Background Glows */}
      <div className={`absolute -top-32 -right-32 w-80 h-80 blur-[120px] opacity-20 rounded-full transition-all duration-1000 ${currentProb.glow}`}></div>
      <div className={`absolute -bottom-32 -left-32 w-80 h-80 blur-[120px] opacity-10 rounded-full transition-all duration-1000 ${currentProb.glow}`}></div>
      
      <div className="relative z-10 p-10 md:p-12">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-12">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="absolute inset-0 bg-ra-primary blur-lg opacity-20 animate-pulse"></div>
              <div className="relative p-4 bg-white/5 border border-white/10 rounded-2xl shadow-inner backdrop-blur-xl">
                <Calculator className="w-8 h-8 text-ra-primary" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white tracking-tighter italic">FlexDrive™</h2>
                <span className="px-2 py-0.5 bg-ra-primary/20 border border-ra-primary/30 rounded text-[9px] font-black text-ra-primary uppercase tracking-widest">Ultra</span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold mt-1">Intelligence Layer v4.2</p>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col items-end">
             <div className="flex items-center space-x-3 px-4 py-2 bg-white/[0.03] rounded-full border border-white/5 backdrop-blur-md">
                <div className={`w-2.5 h-2.5 rounded-full animate-ping ${currentProb.glow.replace('bg', 'bg')}`}></div>
                <div className={`absolute w-2.5 h-2.5 rounded-full ${currentProb.glow}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentProb.color}`}>{currentProb.label}</span>
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Main Inputs Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Precio Estimado</label>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity rounded-2xl blur-md"></div>
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-ra-primary transition-colors font-black">$</span>
                      <input 
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-ra-primary/50 rounded-2xl pl-12 pr-6 text-xl font-black text-white outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">Término de Pago</label>
                    <div className="relative">
                      <select 
                        value={term}
                        onChange={(e) => setTerm(Number(e.target.value))}
                        className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-ra-primary/50 rounded-2xl px-6 text-lg font-black text-white outline-none transition-all appearance-none cursor-pointer"
                      >
                        {[36, 48, 60, 72, 84].map(m => <option key={m} value={m} className="bg-slate-900">{m} meses</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                        <ChevronRight className="rotate-90" size={18} />
                      </div>
                    </div>
                  </div>
              </div>

              {/* Financial Dashboard */}
              <div className="p-8 glass-premium rounded-[2.5rem] border border-white/5 space-y-10 relative overflow-hidden group/dash">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <TrendingUp size={120} />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-ra-primary/10 rounded-lg">
                          <Wallet className="w-4 h-4 text-ra-primary" />
                        </div>
                        <label className="text-xs font-black text-white/60 uppercase tracking-widest">Inversión Inicial</label>
                      </div>
                      <span className="text-2xl font-black text-white tracking-tighter">${downPayment.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" min={0} max={price * 0.5} step={100} value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="ra-range-premium"
                    />
                  </div>

                  {!showTradeIn ? (
                    <button 
                      onClick={() => setShowTradeIn(true)}
                      className="flex items-center space-x-3 text-[10px] font-black text-ra-primary/50 hover:text-ra-primary transition-all uppercase tracking-[0.2em] p-3 bg-ra-primary/5 border border-dashed border-ra-primary/20 rounded-xl w-full justify-center group-hover/dash:border-ra-primary/40"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>¿Integrar valor de Trade-in?</span>
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-white/5">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-ra-accent/10 rounded-lg">
                            <Sparkles className="w-4 h-4 text-ra-accent" />
                          </div>
                          <label className="text-xs font-black text-white/60 uppercase tracking-widest">Valor de tu Auto</label>
                        </div>
                        <span className="text-2xl font-black text-ra-accent tracking-tighter">${tradeIn.toLocaleString()}</span>
                      </div>
                      <input 
                        type="range" min={0} max={price * 0.6} step={100} value={tradeIn}
                        onChange={(e) => setTradeIn(Number(e.target.value))}
                        className="ra-range-premium accent-ra-accent"
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Credit Tier Matrix */}
              <div>
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2 mb-4 block">Estatus de Crédito</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(Object.keys(CREDIT_RATES) as CreditTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t)}
                      className={`relative py-6 px-4 rounded-[1.5rem] border text-[9px] font-black uppercase tracking-widest transition-all overflow-hidden group ${
                        tier === t 
                        ? 'bg-ra-primary/10 border-ra-primary/40 text-white shadow-[0_0_40px_rgba(0,242,255,0.1)]' 
                        : 'bg-white/[0.02] border-white/5 text-white/30 hover:bg-white/5'
                      }`}
                    >
                      {tier === t && (
                        <motion.div 
                          layoutId="active-tier-glow" 
                          className="absolute inset-0 bg-ra-primary/5 z-0" 
                        />
                      )}
                      <span className="relative z-10">{CREDIT_LABELS[t!].split(' (')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Projection Section */}
              <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-3">Inversión Mensual Proyectada</p>
                  <div className="flex items-baseline justify-center md:justify-start space-x-3">
                    <span className="text-6xl font-black text-white tracking-tighter italic">
                      ${Math.round(monthlyPayment)}
                    </span>
                    <span className="text-ra-primary font-black text-xs tracking-[0.3em] uppercase">/ mes*</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full md:w-auto px-12 py-6 bg-white text-black hover:bg-ra-primary transition-all rounded-full font-black text-sm uppercase tracking-widest shadow-[0_24px_48px_-12px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-4 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10">Activar Aprobación</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </button>
              </div>

              {/* Partners Footer */}
              <div className="pt-10 flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-3 opacity-20">
                  <div className="h-px w-8 bg-white"></div>
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.5em]">Digital Banking Hub</span>
                  <div className="h-px w-8 bg-white"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-8 opacity-20 hover:opacity-50 transition-opacity">
                  <Landmark size={18} className="text-white" />
                  <Building2 size={18} className="text-white" />
                  <CardIcon size={18} className="text-white" />
                  <ShieldCheck size={18} className="text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              <div className="bg-ra-primary/5 border border-ra-primary/20 rounded-[2rem] p-8 flex space-x-6 items-center backdrop-blur-xl">
                <div className="w-16 h-16 bg-ra-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                  <div className="absolute inset-0 bg-ra-primary blur-md opacity-20 animate-pulse"></div>
                  <ShieldCheck className="w-8 h-8 text-ra-primary relative z-10" />
                </div>
                <div>
                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">Reserva Digital Sentinel</h4>
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase font-bold tracking-wider">
                    Certificación de privacidad RSA-2048. Sin impacto crediticio inmediato.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Nombre" value={firstName} onChange={setFirstName} placeholder="Ej. Richard" />
                <InputField label="Apellidos" value={lastName} onChange={setLastName} placeholder="Ej. Mendez" />
              </div>

              <InputField label="WhatsApp VIP (Requerido)" type="tel" value={phone} onChange={setPhone} placeholder="+1 (787) 000-0000" />
              <InputField label="Email Corporativo" type="email" value={email} onChange={setEmail} placeholder="richard@automotive.com" />

              <div className="pt-8 flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="px-10 py-5 rounded-full border border-white/10 text-white/30 hover:bg-white/5 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  Regresar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="flex-1 py-5 bg-ra-primary text-black rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,242,255,0.3)] hover:bg-white transition-all flex justify-center items-center group overflow-hidden relative"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">Validar Identidad</span>
                      <Zap className="w-4 h-4 ml-3 relative z-10 group-hover:scale-125 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative w-32 h-32 mx-auto mb-10">
                <div className="absolute inset-0 bg-ra-primary blur-[40px] opacity-30 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full bg-ra-primary/10 border border-ra-primary/30 rounded-[3rem] flex items-center justify-center backdrop-blur-xl">
                  <CheckCircle className="w-14 h-14 text-ra-primary" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-white mb-6 tracking-tighter italic">¡Sentinel High-Intent!</h3>
              <p className="text-white/40 leading-relaxed mb-12 max-w-sm mx-auto text-sm font-bold uppercase tracking-wider">
                Reserva confirmada por <strong className="text-ra-primary">${Math.round(monthlyPayment)}/mes</strong>. Jules ha notificado a nuestro equipo VIP para tu atención inmediata.
              </p>
              
              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 backdrop-blur-md group-hover/sim:border-ra-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-ra-primary animate-bounce" />
                  <span className="text-xs font-black text-white uppercase tracking-[0.4em]">Fast Track Activado</span>
                </div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Espera un mensaje en breve</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2">{label}</label>
      <input 
        required type={type} placeholder={placeholder} value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full h-16 bg-white/[0.03] border border-white/5 focus:border-ra-primary/50 rounded-2xl px-6 text-sm font-black text-white outline-none transition-all placeholder:text-white/5" 
      />
    </div>
  );
}
