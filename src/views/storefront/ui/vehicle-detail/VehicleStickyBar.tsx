'use client';

import React from 'react';
import { Gift, MessageCircle } from 'lucide-react';
import { Car } from '@/entities/inventory';

interface Props {
  car: Car;
  whatsappUrl: string;
}

/**
 * Sticky CTA Bar (mobile y desktop) extraída de VehicleDetail.
 * Muestra precio/pago estimado, pill del Bono $300 y los CTAs de WhatsApp
 * y scroll al deal builder.
 */
export default function VehicleStickyBar({ car, whatsappUrl }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-5 bg-[#020617]/95 backdrop-blur-3xl border-t border-white/10 shadow-2xl z-50 flex items-center gap-4">
      {/* Info */}
      <div className="hidden sm:block shrink-0 space-y-0.5">
        <p className="font-tech text-[9px] text-slate-500 font-black uppercase tracking-widest truncate max-w-[160px]">
          {car.year} {car.name}
        </p>
        <p className="text-xl lg:text-2xl font-black text-white leading-none tracking-tighter">
          ${car.price.toLocaleString()}
        </p>
        <p className="text-[9px] font-bold text-emerald-400">
          ~${Math.round((car.price - 2000) * (1.049 / 60)).toLocaleString()}/mes
        </p>
      </div>

      {/* Mobile price (xs only) */}
      <div className="sm:hidden shrink-0">
        <p className="text-lg font-black text-white leading-none">${car.price.toLocaleString()}</p>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px h-12 bg-white/10 shrink-0" />

      {/* Bono pill */}
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full shrink-0">
        <Gift size={12} className="text-amber-400" />
        <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Bono $300</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-5 py-3.5 lg:px-6 lg:py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,211,102,0.35)] transition-all active:scale-90 whitespace-nowrap"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Scroll to deal builder */}
      <button
        onClick={() => {
          document.getElementById('deal-builder-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="flex-1 lg:flex-none lg:px-10 bg-primary hover:bg-primary/90 text-slate-900 px-5 py-3.5 lg:py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,229,255,0.3)] transition-all active:scale-95 whitespace-nowrap"
      >
        Quiero Éste
      </button>
    </div>
  );
}
