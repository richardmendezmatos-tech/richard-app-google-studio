'use client';

import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, Loader2 } from 'lucide-react';

const POPULAR_VEHICLES = [
  'Ford Bronco Sport',
  'Ford F-150',
  'Ford Maverick',
  'Ford Explorer',
  'Ford Escape',
  'Ford Ranger',
  'Ford Edge',
  'Ford Mustang',
  'Otro vehículo...',
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export function InventoryAlertBanner() {
  const [vehicle, setVehicle] = useState('');
  const [customVehicle, setCustomVehicle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const isCustom = vehicle === 'Otro vehículo...';
  const finalVehicle = isCustom ? customVehicle : vehicle;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!finalVehicle || (!phone && !email)) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/leads/inventory-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, vehicle: finalVehicle }),
      });
      if (!res.ok) throw new Error('Error al guardar alerta');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-5">
            <CheckCircle2 size={28} className="text-cyan-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">¡Alerta creada!</h3>
          <p className="text-slate-400 text-sm">
            Te avisaremos en cuanto llegue un <strong className="text-white">{finalVehicle}</strong> al lote.
            Revisa tu teléfono o email.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 border-t border-white/5">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 md:p-10 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Bell size={18} className="text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
              Alertas de Inventario
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
            ¿No encuentras el vehículo que quieres?
          </h2>
          <p className="text-slate-400 text-sm mb-7">
            Dinos qué buscas y te avisamos cuando llegue al lote. Sin compromiso.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vehicle selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Vehículo de interés *
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {POPULAR_VEHICLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVehicle(v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      vehicle === v
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {isCustom && (
                <input
                  type="text"
                  value={customVehicle}
                  onChange={(e) => setCustomVehicle(e.target.value)}
                  placeholder="Ej: Toyota Tacoma 4x4 2023"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              )}
            </div>

            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="787-000-0000"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-600">
              * Al menos teléfono o email es requerido. Solo te contactamos cuando llegue el vehículo.
            </p>

            <button
              type="submit"
              disabled={status === 'loading' || !finalVehicle || (!phone && !email)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95"
            >
              {status === 'loading' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {status === 'loading' ? 'Guardando...' : 'Crear Alerta Gratis'}
            </button>

            {status === 'error' && (
              <p className="text-center text-xs text-red-400">
                Hubo un error. Por favor llámanos al{' '}
                <a href="tel:+17873682880" className="underline">787-368-2880</a>.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
