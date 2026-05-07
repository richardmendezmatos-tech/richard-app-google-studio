'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Gauge, Fuel, Zap, Settings2 } from 'lucide-react';

interface Spec {
  label: string;
  value: string;
  icon: 'engine' | 'fuel' | 'performance' | 'transmission';
}

interface Props {
  specs: Spec[];
}

export const SpecCard: React.FC<Props> = ({ specs }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'engine': return <Settings2 className="text-primary" size={18} />;
      case 'fuel': return <Fuel className="text-primary" size={18} />;
      case 'performance': return <Gauge className="text-primary" size={18} />;
      default: return <Zap className="text-primary" size={18} />;
    }
  };

  return (
    <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      {specs.map((spec, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 hover:border-primary/30 transition-all group"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {getIcon(spec.icon)}
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{spec.label}</p>
          <p className="text-lg font-black text-white italic tracking-tighter">{spec.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
