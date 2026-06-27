'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, MessageCircle, Zap, Phone, User, CheckCircle } from 'lucide-react';

const SESSION_KEY = 'ra_exit_intent_shown';
const WHATSAPP_NUMBER = '17872146200';

function buildWhatsAppUrl(name: string): string {
  const greeting = name.trim() ? `¡Hola! Soy ${name.trim()}. ` : '¡Hola! ';
  const text = encodeURIComponent(
    `${greeting}Vi el Bono Web de $300 y me gustaría reclamarlo. ¿Cuáles son los detalles?`,
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export const ExitIntentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const dismiss = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // sessionStorage unavailable (SSR or private mode) — ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    let triggered = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      if (e.clientY <= 10) {
        triggered = true;
        setIsOpen(true);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Ingresa tu número de teléfono');
      return;
    }
    setError('');
    setSubmitting(true);

    // Fire-and-forget lead capture — don't block UX on network
    fetch('/api/leads/exit-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    }).catch(() => {});

    setSubmitted(true);
    setSubmitting(false);

    // Open WhatsApp after brief success moment
    setTimeout(() => {
      window.open(buildWhatsAppUrl(name), '_blank', 'noopener,noreferrer');
      dismiss();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="exit-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="exit-modal"
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative pointer-events-auto w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={dismiss}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>

              {/* Glowing gradient top bar */}
              <div className="h-1 w-full bg-linear-to-r from-cyan-400 via-blue-500 to-purple-500" />

              <div className="p-8">
                {submitted ? (
                  /* ── Success state ── */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366]/20 mb-4">
                      <CheckCircle size={32} className="text-[#25D366]" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">¡Listo!</h3>
                    <p className="text-sm text-white/60">
                      Abriendo WhatsApp con Richard…
                    </p>
                  </motion.div>
                ) : (
                  /* ── Form state ── */
                  <>
                    {/* Icon */}
                    <div className="text-center mb-6">
                      <motion.div
                        animate={{ rotate: [-8, 8, -8] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-5"
                      >
                        <Gift size={28} className="text-white" />
                      </motion.div>

                      <div className="mb-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3">
                          <Zap size={10} fill="currentColor" /> Oferta exclusiva
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white leading-tight mb-2">
                        ¡Espera! Tu Bono<br />
                        <span className="text-cyan-400">$300 Web</span> te espera
                      </h2>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Déjanos tu nombre y teléfono y te reclamamos el bono{' '}
                        <strong className="text-white">ahora mismo por WhatsApp</strong>.
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <User
                          size={15}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder="Tu nombre"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 transition-colors"
                        />
                      </div>

                      <div className="relative">
                        <Phone
                          size={15}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                        />
                        <input
                          type="tel"
                          placeholder="Teléfono (787-xxx-xxxx)"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 transition-colors"
                        />
                      </div>

                      {error && (
                        <p className="text-[11px] text-red-400 pl-1">{error}</p>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] disabled:opacity-70 text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(37,211,102,0.45)] transition-all hover:scale-[1.02] active:scale-95"
                      >
                        <MessageCircle size={20} />
                        {submitting ? 'Un momento…' : 'Reclamar Bono $300 en WhatsApp'}
                      </button>
                    </form>

                    <button
                      onClick={dismiss}
                      className="mt-4 w-full text-[11px] font-medium text-white/30 hover:text-white/50 transition-colors uppercase tracking-widest"
                    >
                      No me interesa
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
