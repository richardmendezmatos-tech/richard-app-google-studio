"use client";

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const BASE_MESSAGES = [
  { icon: Users, text: 'guardó un [MODELO]', time: '2 min' },
  { icon: TrendingUp, text: '[N] personas están viendo esta unidad', time: 'ahora' },
  { icon: Users, text: 'comparó dos unidades de lujo', time: '5 min' },
  { icon: TrendingUp, text: 'envió una consulta por WhatsApp', time: '8 min' },
  { icon: Users, text: 'añadió a favoritos en su garaje', time: '12 min' },
];

const CITIES = ['Vega Alta', 'Bayamón', 'San Juan', 'Guaynabo', 'Carolina', 'Levittown'];
const MODELS = ['Ford F-150 Raptor R', 'Ford Mustang GT California Special', 'Ford Ranger STX Canopy', 'Ford Explorer Active', 'Ford Bronco 4-Door Base'];

export const SocialProofWidget: React.FC = () => {
  const pathname = usePathname();
  const [currentMessage, setCurrentMessage] = useState({ icon: Activity, text: '', time: '' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const generateMessage = () => {
      const isVegaAlta = pathname.includes('vega-alta');
      const city = isVegaAlta && Math.random() > 0.3 ? 'Vega Alta' : CITIES[Math.floor(Math.random() * CITIES.length)];
      
      const base = BASE_MESSAGES[Math.floor(Math.random() * BASE_MESSAGES.length)];
      const model = MODELS[Math.floor(Math.random() * MODELS.length)];
      const n = Math.floor(Math.random() * 5) + 2;

      const text = base.text
        .replace('[MODELO]', model)
        .replace('[N]', n.toString());

      const names = ['Juan', 'María', 'Carlos', 'Ana', 'Ricardo', 'Sofía', 'Pedro', 'Elena'];
      const name = names[Math.floor(Math.random() * names.length)];
      
      return {
        icon: base.icon,
        text: `${name} de ${city} ${text}`,
        time: base.time
      };
    };

    // Initial delay
    const timer = setTimeout(() => {
      setCurrentMessage(generateMessage());
      setIsVisible(true);
    }, 5000);

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessage(generateMessage());
        setIsVisible(true);
      }, 1000);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [pathname]);

  const Icon = currentMessage.icon || Activity;

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
          <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/60 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
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
                  {currentMessage.text}
                </p>
                <p className="mt-1.5 font-tech text-[10px] text-white/40 uppercase tracking-widest">
                  Hace {currentMessage.time}
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
