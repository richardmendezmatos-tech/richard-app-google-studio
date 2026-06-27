'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, MessageCircle, Zap } from 'lucide-react';

const SESSION_KEY = 'ra_exit_intent_shown';
const WHATSAPP_NUMBER = '17872146200';

function buildWhatsAppUrl(): string {
  const text = encodeURIComponent(
    '¡Hola! Vi el Bono Web de $300 y me gustaría reclamarlo. ¿Cuáles son los detalles?',
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

export const ExitIntentModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
      // Trigger only when cursor exits through the top of the viewport
      if (e.clientY <= 10) {
        triggered = true;
        setIsOpen(true);
      }
    };

    // Small delay so the modal doesn't fire on page load blink
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

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

              <div className="p-8 text-center">
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [-8, 8, -8] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 shadow-[0_0_30px_rgba(251,191,36,0.4)] mb-5"
                >
                  <Gift size={28} className="text-white" />
                </motion.div>

                {/* Headline */}
                <div className="mb-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-3">
                    <Zap size={10} fill="currentColor" /> Oferta exclusiva
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-2">
                  ¡Espera! Tu Bono<br />
                  <span className="text-cyan-400">$300 Web</span> te espera
                </h2>
                <p className="text-sm text-white/60 leading-relaxed mb-7">
                  Reclama tu bono de <strong className="text-white">$300</strong> al comprar cualquier
                  vehículo nuevo Ford. Solo disponible para visitantes de esta página web.
                </p>

                {/* WhatsApp CTA */}
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(37,211,102,0.45)] transition-all hover:scale-[1.02] active:scale-95 mb-3"
                >
                  <MessageCircle size={20} />
                  Reclamar Bono $300
                </a>

                <button
                  onClick={dismiss}
                  className="text-[11px] font-medium text-white/30 hover:text-white/50 transition-colors uppercase tracking-widest"
                >
                  No me interesa
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
