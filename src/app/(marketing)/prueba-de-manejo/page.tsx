import type { Metadata } from 'next';
import { PruebaDeManejoForm } from './PruebaDeManejoForm';

export const metadata: Metadata = {
  title: 'Prueba de Manejo | Richard Automotive — Agenda tu Test Drive en PR',
  description:
    'Agenda una prueba de manejo sin compromiso en Richard Automotive. Ford, SUV, pickups y más. Te esperamos en Vega Alta, Puerto Rico.',
  alternates: {
    canonical: 'https://www.richard-automotive.com/prueba-de-manejo',
  },
  openGraph: {
    title: 'Prueba de Manejo | Richard Automotive',
    description:
      'Agenda tu test drive en Richard Automotive. Vehículos nuevos y usados disponibles para prueba en Vega Alta, PR.',
    type: 'website',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
  },
};

export default function PruebaDeManejoPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-4"
            style={{ fontFamily: 'var(--font-cinematic)' }}
          >
            Agenda tu <span className="text-cyan-400">Prueba de Manejo</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Sin compromiso. Conduce el vehículo que te gusta y siente la diferencia Richard Automotive.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
          <PruebaDeManejoForm />
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p className="mb-2">📍 Richard Automotive — Vega Alta, Puerto Rico</p>
          <p>¿Preguntas? Escríbenos al <span className="text-cyan-400">787-555-1234</span></p>
        </div>
      </div>
    </div>
  );
}
