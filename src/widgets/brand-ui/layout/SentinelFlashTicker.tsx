"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, CheckCircle2, ShieldCheck } from 'lucide-react';

const TICKER_ITEMS = [
  { icon: <Users size={12} />, text: "3 personas viendo Ford F-150 Raptor ahora mismo" },
  { icon: <TrendingUp size={12} />, text: "Demanda alta: 12 tasaciones completadas esta mañana" },
  { icon: <CheckCircle2 size={12} />, text: "Unidad vendida: Hyundai Tucson en Bayamón hace 45m" },
  { icon: <ShieldCheck size={12} />, text: "Garantía Richard: 24h de prueba sin compromiso activa" },
  { icon: <Users size={12} />, text: "Consultor VIP disponible para cierre inmediato" },
];

const SentinelFlashTicker = () => {
  return (
    <div className="relative h-9 w-full overflow-hidden border-y border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-slate-950 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-950 to-transparent" />
      
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 35,
            ease: "linear",
          },
        }}
        className="flex h-full items-center whitespace-nowrap"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 px-8">
            <span className="text-cyan-400 opacity-80">{item.icon}</span>
            <span className="font-tech text-[9px] uppercase tracking-[0.25em] text-slate-300">
              {item.text}
            </span>
            <span className="mx-4 h-1 w-1 rounded-full bg-slate-700" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default SentinelFlashTicker;
