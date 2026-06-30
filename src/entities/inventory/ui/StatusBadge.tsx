import React from 'react';
import { Check, Clock, X } from 'lucide-react';

interface StatusBadgeProps {
  status: 'available' | 'reserved' | 'sold' | string;
}

const STATUS_CONFIG = {
  available: {
    label: 'Disponible',
    icon: Check,
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  },
  reserved: {
    label: 'Reservado',
    icon: Clock,
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  },
  sold: {
    label: 'Vendido',
    icon: X,
    className: 'bg-red-500/15 text-red-400 border-red-500/25',
  },
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.available;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}
