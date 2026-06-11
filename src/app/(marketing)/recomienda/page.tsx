import React from 'react';
import type { Metadata } from 'next';
import { RecomiendaForm } from './RecomiendaForm';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Recomienda y Gana $200 | Richard Automotive — Programa de Referidos en PR',
  description:
    'Invita a tus amigos y gana $200 por cada compra. Ellos reciben $100 de descuento. Sin límite de referidos.',
  alternates: {
    canonical: 'https://www.richard-automotive.com/recomienda',
  },
  openGraph: {
    title: 'Recomienda y Gana $200 | Richard Automotive',
    description:
      'Programa de referidos: recomienda a un amigo, ambos ganan. Tú recibes $200, tu amigo recibe $100.',
    type: 'website',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
  },
};

export default function RecomiendaPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Programa de Referidos
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            Recomienda y{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
              Gana $200
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Invita a tus amigos y familiares a comprar en Richard Automotive. Tú ganas $200 y ellos
            reciben $100 de descuento. Sin límite de referidos.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl font-black text-emerald-400">1</span>
            </div>
            <h3 className="font-black text-lg">Comparte tu Código</h3>
            <p className="text-sm text-slate-400">
              Comparte tu enlace o código de referido con amigos y familiares por WhatsApp o redes
              sociales.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl font-black text-cyan-400">2</span>
            </div>
            <h3 className="font-black text-lg">Tu Amigo Compra</h3>
            <p className="text-sm text-slate-400">
              Cuando tu referido compre un vehículo en Richard Automotive, ambos reciben su beneficio.
            </p>
          </div>
          <div className="bg-amber-500/20 border border-white/10 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl font-black text-amber-400">3</span>
            </div>
            <h3 className="font-black text-lg">Ambos Ganan</h3>
            <p className="text-sm text-slate-400">
              Tú recibes $200 de descuento en tu próxima compra o en efectivo. Tu amigo recibe $100
              de descuento.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-3xl font-black text-emerald-400">$200</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Para ti por cada referido
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-3xl font-black text-cyan-400">$100</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              De descuento para tu amigo
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-3xl font-black text-white">∞</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Sin límite de referidos
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-black mb-2">Recomienda a un Amigo</h2>
          <p className="text-slate-400 text-sm mb-8">
            Ingresa tus datos y los de tu amigo. Le enviaremos su código de descuento de $100.
          </p>
          <RecomiendaForm />
        </div>

        {/* Terms */}
        <div className="mt-12 text-center text-xs text-slate-600 max-w-xl mx-auto">
          <p className="mb-2">
            * Aplica para compra de vehículo nuevo o usado en Richard Automotive. El descuento del
            referido se aplica al precio de compra. El beneficio del referidor se entrega al completar
            la compra del referido. No acumulable con otras ofertas.
          </p>
          <p>
            Richard Automotive — Central Ford, Vega Alta, Puerto Rico.
          </p>
        </div>
      </div>
    </div>
  );
}
