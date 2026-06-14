'use client';
import React, { useState } from 'react';
import { Calculator, ArrowRight, Zap, ShieldCheck, Loader2, User, Phone, Mail, CheckCircle, X } from 'lucide-react';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';

interface Props {
  tag?: string;
  postTitle?: string;
  specs?: any[];
}

interface LeadForm {
  name: string;
  phone: string;
  email: string;
}

export const PostConversionWidget: React.FC<Props> = ({ tag, postTitle, specs }) => {
  const { addNotification } = useNotification();
  const [isCapturing, setIsCapturing] = useState(false);
  const [price, setPrice] = useState<number>(38000);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [months, setMonths] = useState<number>(60);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: '', phone: '', email: '' });

  const calculatePayment = () => {
    const principal = Math.max(0, price - downPayment);
    const monthlyRate = interestRate / 100 / 12;
    if (monthlyRate === 0) return (principal / months).toFixed(2);
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    return isNaN(payment) ? '0.00' : payment.toFixed(2);
  };

  const handleNurtureTrigger = async () => {
    setShowLeadModal(true);
  };

  const handleLeadSubmit = async () => {
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      addNotification('error', 'Nombre y teléfono son requeridos.');
      return;
    }
    setIsCapturing(true);
    try {
      const context = `Interés vía blog: "${postTitle}" — Calculó pago mensual de $${calculatePayment()}/mes para vehículo de $${price.toLocaleString()} con $${downPayment.toLocaleString()} de pronto a ${months} meses al ${interestRate}% APR. Tag: ${tag || 'General'}.`;

      const res = await fetch('/api/leads/blog-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          source: 'blog_calculator',
          message: context,
          vehicle_of_interest: tag || 'General',
          monthly_payment_estimated: calculatePayment(),
          vehicle_price: price,
          down_payment: downPayment,
          term_months: months,
          apr: interestRate,
        }),
      });

      if (!res.ok) throw new Error('Error al procesar la solicitud');

      setLeadSuccess(true);
      addNotification('success', '¡Houston AI recibió tu simulación! Te contactaremos pronto.');
    } catch (err) {
      console.error('[PostConversionWidget] Error:', err);
      addNotification('error', 'Error al enviar. Intenta de nuevo o llámanos directamente.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleWhatsApp = () => {
    const payment = calculatePayment();
    const msg = encodeURIComponent(
      `Hola Richard Automotive 👋 Me interesa saber sobre financiamiento.\n\n📊 *Calculé en su blog:*\n• Vehículo: ~$${price.toLocaleString()}\n• Pronto: $${downPayment.toLocaleString()}\n• Plazo: ${months} meses\n• APR: ${interestRate}%\n• *Pago estimado: $${payment}/mes*\n\nPost: "${postTitle || 'Blog Richard Automotive'}"\n\n¿Cuándo podemos hablar?`
    );
    window.open(
      `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_CONTACT || '17878001234'}?text=${msg}`,
      '_blank'
    );
  };

  return (
    <>
      <div className="mt-20 p-[1px] bg-linear-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 rounded-[3rem] shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.9rem] p-10 md:p-16 overflow-hidden relative">
          {/* Background decorators */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <Zap className="text-cyan-400 animate-pulse" size={18} />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  FlexDrive™ Simulator
                </span>
              </div>

              <h4 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter italic">
                Pre-calcula tu <br />
                <span className="text-cyan-400">Pago Mensual</span>
              </h4>

              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                No compres a ciegas. Usa las tasas de Ford Credit para Puerto Rico y calcula tu pago ideal antes de visitarnos en{' '}
                <strong className="text-white">Central Ford, Vega Alta</strong>.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> Tasas Preferenciales Ford Credit
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> Bono Web $300 Incluido
                </div>
              </div>
            </div>

            {/* Right: calculator / actions */}
            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 space-y-6">
              {!showCalculator ? (
                <div className="space-y-4">
                  <div
                    onClick={() => setShowCalculator(true)}
                    className="p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-cyan-400/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-400/10 rounded-xl">
                          <Calculator className="text-cyan-400" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-white uppercase tracking-widest">
                            Simulador de Financiamiento
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                            Haz clic para iniciar el pre-desking
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-700 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>

                  <div
                    onClick={handleNurtureTrigger}
                    className="p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-purple-400/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                          <Zap className="text-purple-400" size={20} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-white uppercase tracking-widest">
                            Notificar a Houston AI
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                            Solicita aprobación rápida por WhatsApp
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-slate-700 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                      Precio Estimado de la Unidad
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                      Pronto de Pago (Down Payment)
                    </label>
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Meses</label>
                      <select
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                      >
                        <option value={48}>48 meses</option>
                        <option value={60}>60 meses</option>
                        <option value={72}>72 meses</option>
                        <option value={84}>84 meses</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Tasa APR %</label>
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-cyan-400/50"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pago Mensual Estimado</p>
                    <p className="text-4xl font-black text-cyan-400 mt-1 italic">
                      ${calculatePayment()}<span className="text-xs text-white/40">/mes</span>
                    </p>
                    <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest">
                      Incluye Bono Web $300 aplicable
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCalculator(false)}
                      className="w-1/3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all cursor-pointer"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleNurtureTrigger}
                      className="w-2/3 py-4 bg-cyan-400 text-black hover:bg-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-400/20 cursor-pointer"
                    >
                      Enviar Simulación a Houston
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleWhatsApp}
                className="w-full py-5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-black rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all border border-[#25D366]/20 hover:border-[#25D366] flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hablar con un Experto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3rem] p-10 w-full max-w-lg border border-white/10 shadow-2xl relative">
            <button
              onClick={() => { setShowLeadModal(false); setLeadSuccess(false); }}
              className="absolute top-6 right-6 p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {leadSuccess ? (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle className="text-emerald-400" size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">
                    ¡Houston te tiene!
                  </h3>
                  <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                    Tu simulación fue recibida. Un especialista de <strong className="text-white">Central Ford Vega Alta</strong> te contactará vía WhatsApp en menos de 2 horas.
                  </p>
                </div>
                <div className="px-6 py-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                  <p className="text-xs font-black text-cyan-400 uppercase tracking-widest">Pago Estimado Calculado</p>
                  <p className="text-3xl font-black text-white italic mt-1">${calculatePayment()}<span className="text-sm text-white/40">/mes</span></p>
                </div>
                <button
                  onClick={() => { setShowLeadModal(false); setLeadSuccess(false); }}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-400/10 rounded-lg border border-cyan-400/20 mb-4">
                    <Zap size={12} className="text-cyan-400 animate-pulse" />
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Houston AI Activado</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-tight">
                    Envía tu Simulación<br />a un Especialista
                  </h3>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                    Pago calculado: <strong className="text-cyan-400">${calculatePayment()}/mes</strong> — Completa tu info para recibir confirmación por WhatsApp y reclamar tu <strong className="text-cyan-400">Bono Web $300</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="TU NOMBRE COMPLETO"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="787-XXX-XXXX"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      placeholder="TU CORREO (OPCIONAL)"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((f) => ({ ...f, email: e.target.value }))}
                      className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-400/50 transition-all font-black uppercase tracking-widest"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLeadSubmit}
                  disabled={isCapturing}
                  className="w-full h-16 bg-linear-to-r from-cyan-400 to-cyan-500 text-black hover:from-white hover:to-white transition-all rounded-2xl flex items-center justify-center font-black uppercase text-xs tracking-[0.3em] shadow-xl shadow-cyan-400/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCapturing ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>Enviar a Houston AI <ArrowRight size={14} className="ml-2" /></>
                  )}
                </button>

                <p className="text-center text-[9px] text-slate-600 uppercase tracking-widest">
                  Tu información es 100% privada. Solo la usamos para contactarte.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
