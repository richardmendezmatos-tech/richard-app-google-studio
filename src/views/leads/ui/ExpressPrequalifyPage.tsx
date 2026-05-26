'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from '@/shared/lib/next-route-adapter';
import {
  Timer,
  CheckCircle2,
  Gift,
  User,
  Phone,
  Mail,
  ChevronRight,
  Send,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Loader2,
} from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { getWhatsAppDeepLink } from '@/shared/api/messaging/whatsappClient';
import { logInventoryVelocityEvent } from '@/entities/inventory/api/adapters/inventoryService';

export const ExpressPrequalifyPage: React.FC = () => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const vin = searchParams.get('vin');

  // --- Scarcity Timer State ---
  const [timeLeft, setTimeLeft] = useState(86399); // 24 horas en segundos

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  // --- Form State ---
  const [expressForm, setExpressForm] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [isSubmittingExpress, setIsSubmittingExpress] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<string | null>(null);
  const [expressError, setExpressError] = useState<string | null>(null);
  const [isKnownUser, setIsKnownUser] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Load from localStorage for frictionless re-entry
  useEffect(() => {
    const saved = localStorage.getItem('sentinel_user_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExpressForm(parsed);
        setIsKnownUser(true);
      } catch (e) {
        console.error('Error loading saved info', e);
      }
    }
  }, []);

  const handleExpressSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!expressForm.name || !expressForm.phone) {
      setExpressError('Por favor ingresa tu Nombre y Teléfono/WhatsApp.');
      return;
    }

    if (!turnstileToken) {
      setExpressError('Por favor completa la verificación de seguridad.');
      return;
    }

    setIsSubmittingExpress(true);
    setExpressError(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turnstileToken,
          name: expressForm.name,
          phone: expressForm.phone,
          email: expressForm.email || undefined,
          type: 'chat',
          source: 'bono-300',
          notes: `[BONO_300_ACTIVO] Pre-cualificación Express desde Ruta Dedicada (/bono-300).${vin ? ` [VIN: ${vin}]` : ''}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit');
      }

      // Si hay un VIN, registrar evento de velocidad (Inteligencia Sentinel)
      if (vin) {
        logInventoryVelocityEvent(vin, 'BONO_CLAIM', 5);
      }

      // Generar código de cupón único
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const voucherCode = `RA-BONO-24H-${randomSuffix}`;

      // Persistir para futuras sesiones
      localStorage.setItem('sentinel_user_info', JSON.stringify(expressForm));

      setGeneratedVoucher(voucherCode);
    } catch (err: any) {
      console.error('Error procesando lead express:', err);
      setExpressError('Hubo un error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsSubmittingExpress(false);
    }
  };

  const handleWhatsAppClaim = () => {
    const url = getWhatsAppDeepLink({
      phone: '17875550000', // Real dealer WhatsApp
      text: `¡Hola Richard! 👋 Acabo de asegurar mi Bono de Acción Rápida ($300) en el Command Center.${vin ? ` Estoy interesado en el vehículo con VIN: ${vin}.` : ''} Mi código de cupón es: ${generatedVoucher}. Favor de aplicarlo a mi expediente.`,
      source: 'Sentinel_Express_Bono300',
      campaign: 'BONO_ACCION_RAPIDA_24H',
    });
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a1622] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Glow cinemático de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />

      {/* Barra de Navegación Minimalista */}
      <header className="w-full max-w-4xl mx-auto px-4 py-6 flex items-center justify-between relative z-10 border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-bold font-tech text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={16} /> Volver al Inventario
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-tighter">
            RICHARD <span className="text-amber-500">AUTOMOTIVE</span>
          </span>
          <span className="text-[9px] font-tech text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/20">
            Oferta Oficial
          </span>
        </div>
      </header>

      {/* Contenido Central Inmersivo */}
      <main className="flex-1 w-full max-w-xl mx-auto px-4 py-8 flex flex-col justify-center relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-black uppercase tracking-wider mb-4 animate-bounce">
            <Gift size={14} /> Bono de Acción Rápida Activado
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
            Ahorra <span className="text-amber-400">$300.00</span> en Gastos de Cierre
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light max-w-md mx-auto">
            Regístrate ahora y al completar tu compra te cubrimos el 100% del costo de{' '}
            <span className="text-white font-bold underline decoration-amber-500 decoration-2">
              Tablilla, Marbete y Registro
            </span>
            .
          </p>
        </div>

        {/* Bloque del Temporizador en Cuenta Regresiva */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-2xl">
          <span className="text-[10px] font-tech text-slate-400 uppercase tracking-widest block text-center mb-2 flex items-center justify-center gap-1">
            <Timer size={12} className="text-rose-500 animate-spin" /> Tiempo Restante de la Oferta
          </span>
          <div className="flex items-center justify-center gap-3">
            <div className="w-20 py-2 bg-slate-900 rounded-xl border border-white/5 text-center">
              <span className="font-cinematic text-2xl md:text-3xl font-black text-white block">
                {hours}
              </span>
              <span className="text-[8px] font-tech text-slate-500 uppercase tracking-wider">
                Horas
              </span>
            </div>
            <span className="font-cinematic text-2xl font-black text-amber-500 animate-pulse">
              :
            </span>
            <div className="w-20 py-2 bg-slate-900 rounded-xl border border-white/5 text-center">
              <span className="font-cinematic text-2xl md:text-3xl font-black text-white block">
                {minutes}
              </span>
              <span className="text-[8px] font-tech text-slate-500 uppercase tracking-wider">
                Mins
              </span>
            </div>
            <span className="font-cinematic text-2xl font-black text-amber-500 animate-pulse">
              :
            </span>
            <div className="w-20 py-2 bg-slate-900 rounded-xl border border-white/5 text-center">
              <span className="font-cinematic text-2xl md:text-3xl font-black text-rose-400 block">
                {seconds}
              </span>
              <span className="text-[8px] font-tech text-slate-500 uppercase tracking-wider">
                Segs
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta del Formulario / Resultado */}
        <div className="relative rounded-3xl border border-white/10 bg-slate-900/90 p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.1)] overflow-hidden">
          <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

          {generatedVoucher ? (
            <div className="text-center py-2 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <span className="text-[10px] font-tech text-slate-500 uppercase tracking-widest block mb-1">
                Tu Código Exclusivo de Exención
              </span>
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 mb-4 inline-block">
                <span className="text-2xl font-mono font-black tracking-widest text-amber-400 select-all">
                  {generatedVoucher}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 max-w-sm mx-auto">
                ¡Expediente asegurado con éxito! Envía tu código por WhatsApp para que nuestros
                asesores apliquen el crédito directo a tu compra.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppClaim}
                  className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                >
                  <Send size={16} /> Enviar Cupón a WhatsApp
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Explorar Vehículos Disponibles
                </button>
              </div>
            </div>
          ) : isKnownUser ? (
            <div className="text-center py-4 animate-in fade-in duration-500">
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">
                  ¡Hola de nuevo,{' '}
                  <span className="text-amber-400">{expressForm.name.split(' ')[0]}</span>!
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Detectamos tu perfil Sentinel. Puedes reclamar tu bono instantáneamente.
                </p>
              </div>

              <button
                onClick={() => handleExpressSubmit()}
                disabled={isSubmittingExpress}
                className="w-full py-5 bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-widest transition-all shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mb-6"
              >
                {isSubmittingExpress ? (
                  <span className="animate-pulse">Procesando Flash...</span>
                ) : (
                  <>
                    Reclamar Bono Flash ($300) <Zap size={18} fill="currentColor" />
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('sentinel_user_info');
                  setIsKnownUser(false);
                  setExpressForm({ name: '', phone: '', email: '' });
                }}
                className="text-[10px] font-tech text-slate-500 hover:text-slate-300 uppercase tracking-widest underline decoration-slate-700 underline-offset-4 transition-colors"
              >
                No soy {expressForm.name.split(' ')[0]} / Usar otros datos
              </button>
            </div>
          ) : (
            <form onSubmit={handleExpressSubmit} data-mcp-role="lead-capture" data-mcp-purpose="bono-300" data-mcp-fields="name,phone,email" className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg font-black text-white">Congela tu Bono Inmediatamente</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingresa tus datos para enlazar el código de $300
                </p>
              </div>

              {expressError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
                  {expressError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-tech font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} className="text-amber-400" /> Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Rivera"
                  value={expressForm.name}
                  onChange={(e) => setExpressForm({ ...expressForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-tech font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone size={12} className="text-amber-400" /> WhatsApp / Teléfono Móvil
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(787) 000-0000"
                  value={expressForm.phone}
                  onChange={(e) => setExpressForm({ ...expressForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-tech font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} className="text-slate-500" /> Correo Electrónico{' '}
                  <span className="text-slate-600 font-normal">(Opcional)</span>
                </label>
                <input
                  type="email"
                  placeholder="carlos@email.com"
                  value={expressForm.email}
                  onChange={(e) => setExpressForm({ ...expressForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                />
              </div>

              <div ref={turnstileRef} className="flex justify-center mb-3">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                  onSuccess={(token) => setTurnstileToken(token)}
                  options={{ theme: 'dark', size: 'flexible' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingExpress || !turnstileToken}
                className="w-full mt-2 py-4 bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingExpress ? (
                  <span className="animate-pulse flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Asegurando Código...</span>
                ) : (
                  <>
                    Reclamar Descuento de $300 <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-tech">
                <ShieldCheck size={14} className="text-emerald-500" /> Transmisión Cifrada de
                Extremo a Extremo
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Pie de Página Sencillo */}
      <footer className="w-full py-4 text-center border-t border-white/5 text-[11px] text-slate-600 relative z-10">
        © {new Date().getFullYear()} Richard Automotive • Certificado Oficial de Ahorro
      </footer>
    </div>
  );
};

export default ExpressPrequalifyPage;
