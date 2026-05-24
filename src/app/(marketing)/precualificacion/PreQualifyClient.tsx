'use client';

import React from 'react';
import { MiniDeskerClient } from '@/features/deal-desker/ui/MiniDeskerClient';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function PreQualifyClient() {
  return (
    <div className="py-8 space-y-6">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto px-4 space-y-3">
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-900/50">
          Soft Pull • Sin Afectar tu Crédito
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Precualificación Express
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Descubre en segundos tu presupuesto mensual real, tu pronto pago ideal y las unidades físicas disponibles en nuestro lote de Vega Alta que se ajustan a ti.
        </p>
      </div>

      {/* Interactive Tool */}
      <MiniDeskerClient />
    </div>
  );
}
