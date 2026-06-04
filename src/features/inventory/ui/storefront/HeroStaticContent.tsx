import React from 'react';
import Link from 'next/link';

export default function HeroStaticContent() {
  return (
    <div
      className="fixed inset-0 min-h-screen pointer-events-none"
      style={{ zIndex: 30 }}
    >
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] font-tech">
              Central Ford — Vega Alta, Puerto Rico
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.85] text-white font-cinematic">
              Tu Próximo
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                Ford
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl text-slate-400 font-manrope font-normal not-uppercase tracking-normal block mt-2">
                Te Espera en Central Ford — Vega Alta
              </span>
            </h1>

            <div className="flex flex-wrap gap-3 pt-4 pointer-events-auto">
              <Link
                href="/inventario"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/25"
              >
                Ver Inventario Ford
              </Link>
              <Link
                href="/precualificacion"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
              >
                Precalifica Ahora
              </Link>
              <Link
                href="/bono-300"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
              >
                Bono Web $300
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-slate-500 font-bold uppercase tracking-widest pointer-events-auto">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Ford Credit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Garantía 10 Años / 100k
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Trade-In Aceptado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
