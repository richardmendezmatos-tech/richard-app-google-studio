'use client';

import React, { useState } from 'react';
import { ArrowRight, BrainCircuit, DollarSign, Sparkles, Phone, CheckCircle } from 'lucide-react';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import { PremiumCTA } from '@/shared/ui/common/PremiumCTA';

interface HeroCTAPanelProps {
  onBrowseInventory: () => void;
  onNeuralMatch: () => void;
  onSellCar: () => void;
}

export function HeroCTAPanel({ onBrowseInventory, onNeuralMatch, onSellCar }: HeroCTAPanelProps) {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 7) return;
    setLoading(true);
    try {
      await fetch('/api/leads/exit-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hero Lead', phone: clean }),
      });
      setSubmitted(true);
      const waUrl = `https://wa.me/1${clean}?text=${encodeURIComponent('¡Hola! Vi tu número en Richard Automotive. ¿Te puedo ayudar a encontrar tu próximo vehículo? 🚗')}`;
      setTimeout(() => window.open(waUrl, '_blank'), 600);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Mini lead capture form */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="font-tech text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mb-3">
            ¿LISTO? UN ASESOR TE LLAMA HOY
          </p>
          {submitted ? (
            <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-400 shrink-0" />
              <span className="font-tech text-xs font-bold text-emerald-400">
                ¡Recibido! Te contactamos en minutos.
              </span>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="787-000-0000"
                  className="w-full pl-8 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length < 7}
                className="px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.03] active:scale-95 whitespace-nowrap"
              >
                {loading ? '...' : 'HABLAR'}
              </button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10 relative">
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
