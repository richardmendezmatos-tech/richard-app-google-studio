import React from 'react';
import { Activity, LineChart, ScanSearch } from 'lucide-react';

interface PulseCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'cyan' | 'slate' | 'emerald';
}

const PulseCard: React.FC<PulseCardProps> = ({ icon, label, value, tone }) => {
  const toneStyles = {
    cyan: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100',
    slate: 'border-slate-300/20 bg-slate-500/10 text-slate-100',
    emerald: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100',
  };

  return (
    <div className={`glass-premium p-6 ${toneStyles[tone]}`}>
      <div className="mb-3 inline-flex rounded-xl border border-white/20 bg-black/20 p-2.5">
        {icon}
      </div>
      <p className="font-tech text-[10px] uppercase tracking-[0.2em] opacity-90">{label}</p>
      <p className="mt-2 font-cinematic text-3xl tracking-[0.06em]">{value}</p>
    </div>
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
    <section aria-label="Pulso del Mercado" className="reveal-up grid gap-4 md:grid-cols-3">
      <PulseCard
        icon={<Activity size={18} />}
        label="Valor en el Mercado"
        value={`$${avgPrice.toLocaleString('en-US')}`}
        tone="cyan"
      />
      <PulseCard
        icon={<LineChart size={18} />}
        label="Selección de Lujo"
        value={`${premiumUnits} unidades`}
        tone="slate"
      />
      <PulseCard
        icon={<ScanSearch size={18} />}
        label="Oportunidades de Compra"
        value={`${compactUnits} unidades`}
        tone="emerald"
      />
    </section>
  );
};

export default StorefrontMarketPulse;
