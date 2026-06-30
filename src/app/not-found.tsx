import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página No Encontrada | Richard Automotive',
  description: 'Esta página no existe, pero tenemos más de 99 autos Ford nuevos y usados esperándote en Vega Alta, Puerto Rico.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            RICHARD<span className="text-cyan-400/70">.AUTO</span>
          </span>
        </div>

        {/* 404 */}
        <div
          className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent select-none mb-2"
          style={{ fontFamily: 'var(--font-cinematic)' }}
        >
          404
        </div>

        <h1
          className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4"
          style={{ fontFamily: 'var(--font-cinematic)' }}
        >
          Esta página{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            no existe
          </span>
        </h1>

        <p className="text-slate-400 text-base mb-10 leading-relaxed">
          Puede que la URL cambió o el enlace está roto. Pero no te preocupes —
          tenemos más de <strong className="text-white">99 autos Ford</strong> nuevos y
          usados esperándote en Vega Alta.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/inventario"
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.3)]"
          >
            Ver Inventario →
          </Link>
          <Link
            href="/"
            className="px-8 py-4 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
          >
            Ir al Inicio
          </Link>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { href: '/inventario?type=nuevos', label: 'Autos Nuevos' },
            { href: '/inventario?type=usados', label: 'Autos Usados' },
            { href: '/precualificacion', label: 'Pre-Cualificar' },
            { href: '/blog', label: 'Blog' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-3 rounded-xl border border-white/5 bg-white/[0.03] hover:border-cyan-500/20 hover:bg-white/[0.06] text-xs font-bold text-slate-400 hover:text-white transition-all text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* WhatsApp — no pierdas el lead */}
        <a
          href="https://wa.me/17873682880?text=Hola%2C%20estaba%20buscando%20un%20auto%20en%20su%20p%C3%A1gina%20y%20me%20encontr%C3%A9%20con%20un%20error.%20%C2%BFMe%20pueden%20ayudar%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-6 py-3 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          ¿Te podemos ayudar? Escríbenos
        </a>
      </div>
    </main>
  );
}
