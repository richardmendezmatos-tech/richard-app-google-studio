import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getDistinctFordModels } from '@/entities/inventory/api/adapters/fordModelService';
import { ArrowRight, Fuel, Gauge } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vehículos Ford en Puerto Rico | Richard Automotive — Central Ford Vega Alta',
  description:
    'Explora todos los modelos Ford disponibles en Puerto Rico: F-150, Explorer, Escape, Bronco, Maverick, Ranger y más. Precios, fotos y financiamiento en Central Ford, Vega Alta.',
  keywords: [
    'ford puerto rico',
    'vehiculos ford',
    'ford central ford vega alta',
    'autos ford puerto rico',
    'camionetas ford pr',
    'suv ford pr',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/ford',
  },
  openGraph: {
    title: 'Vehículos Ford en Puerto Rico | Richard Automotive',
    description:
      'Modelos Ford nuevos y usados en Central Ford, Vega Alta. F-150, Explorer, Escape, Bronco, Maverick y más.',
    type: 'website',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
  },
};

export const revalidate = 3600;

export default async function FordHubPage() {
  const models = await getDistinctFordModels();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-cyan-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Central Ford — Vega Alta
          </p>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            Vehículos{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
              Ford
            </span>{' '}
            en Puerto Rico
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Nuevos, usados certificados y financiamiento Ford Credit. Encuentra el Ford ideal para ti
            en Central Ford, Vega Alta.
          </p>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No hay modelos Ford disponibles actualmente.</p>
            <Link
              href="/inventario"
              className="inline-block mt-4 text-cyan-400 font-bold hover:underline"
            >
              Ver Inventario Completo →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {models.map((m) => (
              <Link
                key={m.model}
                href={`/ford/${m.model.toLowerCase()}`}
                className="group bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="aspect-video relative bg-slate-800 flex items-center justify-center p-6">
                  <Image
                    src={m.image}
                    alt={`Ford ${m.model}`}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-black">Ford {m.model}</h2>

                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="px-3 py-1.5 bg-white/5 rounded-full text-slate-400">
                      {m.count} unidades
                    </span>
                    {m.years.slice(0, 2).map((y) => (
                      <span key={y} className="px-3 py-1.5 bg-white/5 rounded-full text-slate-400">
                        {y}
                      </span>
                    ))}
                    {m.bodyStyles.slice(0, 2).map((s) => (
                      <span key={s} className="px-3 py-1.5 bg-white/5 rounded-full text-slate-400 capitalize">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Desde
                      </p>
                      <p className="text-2xl font-black text-white">
                        ${m.minPrice.toLocaleString()}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-cyan-400 text-sm font-bold group-hover:gap-2 transition-all">
                      Ver Modelo <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-3xl font-black text-cyan-400 mb-2">Ford Credit</p>
            <p className="text-sm text-slate-400">
              Tasas preferenciales y aprobación rápida para tu Ford nuevo o usado.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-3xl font-black text-cyan-400 mb-2">Garantía 10 Años</p>
            <p className="text-sm text-slate-400">
              100,000 millas de cobertura en modelos Ford nuevos. La mejor garantía del mercado.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <p className="text-3xl font-black text-cyan-400 mb-2">Bono Web $300</p>
            <p className="text-sm text-slate-400">
              Recibe $300 de descuento adicional al comprar tu Ford con nosotros.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/25"
          >
            Ver Todo el Inventario
          </Link>
        </div>
      </div>
    </div>
  );
}
