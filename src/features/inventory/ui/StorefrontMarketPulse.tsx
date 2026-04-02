"use client";

import React from 'react';
import { Activity, LineChart, ScanSearch, TrendingUp, Cpu, Gauge } from 'lucide-react';
import { motion } from 'motion/react';

interface PulseCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'cyan' | 'slate' | 'emerald';
  trend?: string;
  delay?: number;
}

const PulseCard: React.FC<PulseCardProps> = ({ icon, label, value, tone, trend, delay = 0 }) => {
  const toneStyles = {
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
    slate: 'border-slate-500/20 bg-slate-500/5 text-slate-400',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-[32px] border p-8 backdrop-blur-2xl transition-all hover:scale-[1.02] hover:bg-slate-900/60 shadow-xl ${toneStyles[tone]}`}
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Cpu size={48} />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all group-hover:bg-white/10">
            {icon}
          </div>
          <div>
            <p className="font-tech text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
              {label}
            </p>
            {trend && (
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp size={10} className="text-cyan-400" />
                <span className="font-tech text-[8px] font-bold uppercase tracking-widest text-cyan-400">
                  {trend}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="font-cinematic text-4xl lg:text-5xl text-white tracking-widest leading-none">
            {value}
          </p>
          <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ delay: delay + 0.5, duration: 1 }}
              className={`h-full ${tone === 'cyan' ? 'bg-cyan-500' : tone === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400'}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface StorefrontMarketPulseProps {
  avgPrice: number;
  premiumUnits: number;
  compactUnits: number;
}

const StorefrontMarketPulse: React.FC<StorefrontMarketPulseProps> = ({
  avgPrice,
  premiumUnits,
  compactUnits,
}) => {
  return (
    <section aria-label="Richard Intelligence Dashboard" className="reveal-up grid gap-6 md:grid-cols-3">
      <PulseCard
        icon={<Gauge size={24} />}
        label="RICHARD MARKET INDEX"
        value={`$${avgPrice.toLocaleString('en-US')}`}
        trend="+2.4% EOY"
        tone="cyan"
        delay={0.1}
      />
      <PulseCard
        icon={<Activity size={24} />}
        label="PREMIUM FLOW RATE"
        value={`${premiumUnits} UNITS`}
        trend="HIGH DEMAND"
        tone="slate"
        delay={0.2}
      />
      <PulseCard
        icon={<ScanSearch size={24} />}
        label="STRATEGIC OPPORTUNITY"
        value={`${compactUnits} UNITS`}
        trend="READY TO SHIP"
        tone="emerald"
        delay={0.3}
      />
    </section>
  );
};

export default StorefrontMarketPulse;
