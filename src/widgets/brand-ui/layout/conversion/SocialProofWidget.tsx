"use client";

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIVITY_MESSAGES = [
  { icon: Users, text: 'Juan de Santo Domingo guardó un Toyota Corolla', time: '2 min' },
  { icon: TrendingUp, text: '3 personas están viendo este vehículo', time: 'ahora' },
  { icon: Users, text: 'María de Santiago comparó este auto', time: '5 min' },
  { icon: TrendingUp, text: 'Carlos de San Pedro contactó por WhatsApp', time: '8 min' },
  { icon: Users, text: 'Ana de La Vega guardó en su garaje', time: '12 min' },
  { icon: TrendingUp, text: '5 personas vieron este auto hoy', time: '1 hora' },
];

export const SocialProofWidget: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ACTIVITY_MESSAGES.length);
        setIsVisible(true);
      }, 500);
    }, 12000); // 12s per message for better readability

    return () => clearInterval(interval);
  }, []);

  const currentActivity = ACTIVITY_MESSAGES[currentIndex];
  const Icon = currentActivity.icon;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="ra-social-proof fixed right-6 top-24 z-40 hidden sm:block w-fit max-w-[340px]"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-900 to-black border border-cyan-500/30">
                  <Icon size={18} className="text-cyan-400" />
                </div>
                <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan-400 blur-[2px]" 
                />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                    <Activity size={10} className="text-cyan-500/70" />
                    <span className="font-tech text-[9px] uppercase tracking-[0.16em] text-cyan-500/70">
                        Live Activity Protocol
                    </span>
                </div>
                <p className="text-[0.85rem] font-medium leading-tight text-white/90">
                  {currentActivity.text}
                </p>
                <p className="mt-1.5 font-tech text-[10px] text-white/40 uppercase tracking-widest">
                  Hace {currentActivity.time}
                </p>
              </div>

              <div className="shrink-0 pt-1">
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse" />
              </div>
            </div>

            {/* Subtle scanning light effect */}
            <motion.div 
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent skew-x-12"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
