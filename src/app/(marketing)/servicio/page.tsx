import type { Metadata } from 'next';
import { ServiceForm } from './ServiceForm';

export const metadata: Metadata = {
  title: 'Servicio Automotriz | Richard Automotive — Citas de Mantenimiento en PR',
  description:
    'Agenda tu cita de servicio automotriz en Richard Automotive. Cambio de aceite, frenos, A/C, inspección y más. Vega Alta, Puerto Rico.',
  alternates: {
    canonical: 'https://richard-automotive.com/servicio',
  },
  openGraph: {
    title: 'Servicio Automotriz | Richard Automotive',
    description: 'Agenda tu cita de servicio en Richard Automotive. Mantenimiento y reparación de confianza en Vega Alta, PR.',
    type: 'website',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
  },
};

const SERVICE_OPTIONS = [
  { id: 'oil-change', label: 'Cambio de Aceite', desc: 'Incluye filtro y verificación de niveles' },
  { id: 'brakes', label: 'Frenos', desc: 'Pastillas, rotores y revisión completa' },
  { id: 'ac', label: 'A/C', desc: 'Recarga, reparación y diagnóstico' },
  { id: 'inspection', label: 'Inspección Vehicular', desc: 'Revisión completa de 50 puntos' },
  { id: 'tires', label: 'Gomas', desc: 'Cambio, rotación y alineación' },
  { id: 'battery', label: 'Batería', desc: 'Diagnóstico y reemplazo' },
  { id: 'suspension', label: 'Suspensión', desc: 'Amortiguadores y dirección' },
  { id: 'transmission', label: 'Transmisión', desc: 'Servicio y reparación' },
  { id: 'other', label: 'Otro', desc: 'Describe el servicio que necesitas' },
];

export default function ServicioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-6xl font-black leading-tight mb-4"
            style={{ fontFamily: 'var(--font-cinematic)' }}
          >
            Agenda tu <span className="text-cyan-400">Servicio</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Mantenimiento profesional para tu vehículo en Vega Alta, Puerto Rico.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 md:p-12">
          <ServiceForm options={SERVICE_OPTIONS} />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-2xl font-black text-cyan-400">+500</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Servicios Realizados</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-2xl font-black text-cyan-400">Garantía</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">En Todo Servicio</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-2xl font-black text-cyan-400">1 Hr</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cambio de Aceite</p>
          </div>
        </div>
      </div>
    </div>
  );
}
