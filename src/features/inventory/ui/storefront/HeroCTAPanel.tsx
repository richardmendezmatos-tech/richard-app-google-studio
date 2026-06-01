'use client';

import React from 'react';
import { ArrowRight, BrainCircuit, DollarSign, Sparkles } from 'lucide-react';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import { PremiumCTA } from '@/shared/ui/common/PremiumCTA';

interface HeroCTAPanelProps {
  onBrowseInventory: () => void;
  onNeuralMatch: () => void;
  onSellCar: () => void;
}

export function HeroCTAPanel({ onBrowseInventory, onNeuralMatch, onSellCar }: HeroCTAPanelProps) {
  return (
    <div className="w-full lg:w-[460px]">
      <GlassContainer
        intensity="high"
        opacity={0.07}
        withBrackets
        className="p-10 space-y-8 relative group"
      >
        <div className="absolute inset-0 bg-linear-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <div className="scanline-overlay opacity-20" />

        <div className="space-y-3 relative">
          <p className="font-tech text-xs font-black uppercase tracking-[0.5em] text-slate-400">
            CENTRO DE CONTROL / <span className="text-primary animate-pulse">ACCIÓN DIRECTA</span>
          </p>
          <div className="h-1 w-16 bg-linear-to-r from-primary to-transparent rounded-full shadow-[0_0_10px_#00e5ff]" />
        </div>

        <div className="space-y-4 relative">
          <PremiumCTA
            label="EXPLORAR INVENTARIO"
            tag="BASE DE UNIDADES"
            icon={<ArrowRight size={22} />}
            variant="primary"
            onClick={onBrowseInventory}
          />
          <PremiumCTA
            label="MATCH IDEAL"
            tag="DESCUBRIMIENTO"
            icon={<BrainCircuit size={22} />}
            variant="secondary"
            onClick={onNeuralMatch}
          />
          <PremiumCTA
            label="COTIZAR MI AUTO"
            tag="EVALÚO DE TRADE-IN"
            icon={<DollarSign size={22} />}
            variant="tertiary"
            onClick={onSellCar}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 relative">
          {[
            { val: '500+', lbl: 'FAMILIAS' },
            { val: '4.9%', lbl: 'APR MÍNIMO' },
            { val: '24/7', lbl: 'OPERACIÓN' },
          ].map((s) => (
            <div key={s.lbl} className="text-center group/stat">
              <div className="font-tech text-xl font-black text-white group-hover/stat:text-primary transition-colors">
                {s.val}
              </div>
              <div className="font-tech text-[8px] uppercase tracking-[0.3em] text-slate-500 font-bold">
                {s.lbl}
              </div>
            </div>
          ))}
        </div>

        <Sparkles
          className="absolute bottom-6 right-6 text-primary/10 group-hover:text-primary/30 transition-colors animate-spin-slow"
          size={60}
        />
      </GlassContainer>
    </div>
  );
}
