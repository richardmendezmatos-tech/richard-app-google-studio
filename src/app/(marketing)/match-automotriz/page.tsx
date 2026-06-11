import React from 'react';
import type { Metadata } from 'next';
import { DealMatcherWidget } from '@/features/deal-matcher/ui/DealMatcherWidget';

export const dynamic = 'force-static';
import { Compass, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Encuentra tu Auto Ideal | Match Inteligente | Richard Automotive',
  description:
    'Descubre tu próximo carro o guagua en Puerto Rico. Filtra por tu pronto disponible y cuota mensual para encontrar el vehículo ideal en Vega Alta.',
  keywords: [
    'deal matcher puerto rico',
    'tinder de autos vega alta',
    'guagua matcher',
    'autos usados puerto rico financiamiento',
    'richard automotive match',
    'autos de show puerto rico',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/match-automotriz',
  },
};

function DealMatcherJsonLd() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.richard-automotive.com' },
      { '@type': 'ListItem', position: 2, name: 'Match Automotriz', item: 'https://www.richard-automotive.com/match-automotriz' },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
    />
  );
}

export default function DealMatcherPage() {
  return (
    <>
      <DealMatcherJsonLd />
      <main className="relative min-h-screen bg-[#07111b] text-white pt-16 pb-24 overflow-x-hidden">
        
        {/* Futuristic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Breadcrumb & Tag */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Richard Automotive Match</span>
            </div>
          </div>

          {/* Centered Pitch Intro */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-tight italic">
              ¿Listo para tu próxima <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-500">
                Máquina de Show?
              </span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-bold uppercase tracking-wider max-w-xl mx-auto">
              Ajusta tu pronto, define tu presupuesto mensual y desliza las cartas para descubrir tu auto ideal en segundos.
            </p>
          </div>

          {/* Core Interactive Swiper Widget */}
          <DealMatcherWidget />

          {/* Value Highlights Grid */}
          <section className="mt-24 pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-4xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-cyan-400 font-black text-lg italic block">01 / Sin Papeleo Inicial</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Pre-cualificación Expresa</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wider">
                Haz match y solicita la aprobación en menos de 60 segundos directamente desde tu WhatsApp.
              </p>
            </div>
            <div className="p-8 rounded-4xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-cyan-400 font-black text-lg italic block">02 / Inteligencia de Mercado</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Matemática Actuarial</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wider">
                Las cuotas mensuales y porcentajes de compatibilidad se calculan usando tasas reales del mercado bancario local.
              </p>
            </div>
            <div className="p-8 rounded-4xl bg-white/[0.02] border border-white/5 space-y-3">
              <span className="text-cyan-400 font-black text-lg italic block">03 / Garantía de Show</span>
              <h4 className="text-white font-black text-xs uppercase tracking-widest">Unidades Certificadas</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wider">
                Cada auto o guagua que ves en el matcher ha sido minuciosamente inspeccionado por nuestros mecánicos en Central Ford.
              </p>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
