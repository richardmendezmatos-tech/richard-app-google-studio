import React from 'react';
import { Link } from '@/shared/lib/next-route-adapter';
import SEO from '@/shared/ui/seo/SEO';
import {
  CheckCircle,
  Clock,
  FileText,
  Phone,
  Zap,
  Shield,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { CreditCalculator } from '@/features/loans/ui/CreditCalculator';
import { ApprovalSimulatorWidget } from '@/features/loans/ui/ApprovalSimulatorWidget';
import { FinanciamientoFAQ } from './FinanciamientoFAQ';

const WHATSAPP_LINK =
  'https://wa.me/17873682880?text=Hola%2C%20quiero%20información%20sobre%20financiamiento';

const faqs = [
  {
    question: '¿Qué documentos necesito para solicitar financiamiento de auto en Puerto Rico?',
    answer:
      'Necesitas: (1) licencia de conducir o pasaporte vigente, (2) número de Seguro Social, (3) talonarios de pago de los últimos 30 días o carta de empleo con sueldo, (4) comprobante de residencia reciente (factura de servicios o estado de cuenta bancario), y (5) referencias personales. Para trabajadores independientes o por cuenta propia, se requieren las últimas 2 declaraciones de IRS.',
  },
  {
    question: '¿Cuánto tiempo tarda la aprobación de financiamiento?',
    answer:
      'La pre-aprobación en línea tarda entre 15 y 30 minutos y no afecta tu puntaje de crédito (soft pull). Con todos los documentos completos en mano, la aprobación formal con el banco puede completarse el mismo día. Ford Credit es especialmente rápido — respuesta en menos de 2 horas en la mayoría de los casos.',
  },
  {
    question: '¿Aceptan personas con crédito bajo o sin historial crediticio?',
    answer:
      'Sí. Trabajamos con más de 15 entidades bancarias y cooperativas en Puerto Rico, incluyendo programas especiales para primeros compradores ("First Time Buyers") y personas con historial limitado. No te descartamos sin antes explorar todas las opciones disponibles para tu situación.',
  },
  {
    question: '¿Cuánto es el pronto mínimo y puedo usar mi auto de trade-in como inicial?',
    answer:
      'El pronto mínimo varía entre 0 % y 20 % del precio del vehículo según tu perfil crediticio. Sí aceptamos tu auto actual como parte del pago inicial (trade-in). Tasamos tu vehículo a precio justo de mercado y aplicamos ese valor directamente al enganche de tu próximo auto, reduciendo el monto a financiar.',
  },
  {
    question: '¿Cuáles son los plazos de financiamiento y cuál me conviene más?',
    answer:
      'Ofrecemos plazos de 24, 36, 48, 60 y 72 meses. Los plazos cortos (24-36 meses) tienen mensualidades más altas pero pagas menos intereses en total. Los plazos largos (60-72 meses) reducen la mensualidad mensual pero aumentan el costo total. Para autos nuevos Ford, Ford Credit ofrece ocasionalmente 0 % APR a 60 meses en modelos seleccionados — pregunta por las promociones vigentes.',
  },
  {
    question: '¿Qué APR (tasa de interés) puedo esperar para mi auto en Puerto Rico?',
    answer:
      'Las tasas en Puerto Rico varían entre 3.9 % y 18 % APR dependiendo de tu puntaje FICO, plazo, tipo de vehículo (nuevo vs. usado) y el banco financiero. Los clientes con FICO 720+ suelen calificar para las mejores tasas. Con Ford Credit en vehículos nuevos, las promociones regulares ofrecen tasas desde 0 % hasta 5.9 % APR.',
  },
  {
    question: '¿El financiamiento cubre autos usados también?',
    answer:
      'Sí. Financiamos tanto vehículos nuevos como usados certificados. Para autos usados, las tasas son ligeramente más altas y el plazo máximo generalmente es 60 meses. El vehículo debe tener menos de 100,000 millas y no más de 7-8 años de antigüedad para calificar en la mayoría de los bancos.',
  },
];

const benefits = [
  { icon: Zap, title: 'Pre-Aprobación en 24h', desc: 'Respuesta rápida sin salir de casa' },
  {
    icon: TrendingDown,
    title: 'Tasas Competitivas',
    desc: 'Negociamos las mejores opciones para ti',
  },
  { icon: Shield, title: 'Sin Penalidad de Pago', desc: 'Paga antes sin costos adicionales' },
  { icon: Clock, title: 'Proceso 100% Digital', desc: 'Aplica desde tu teléfono en minutos' },
];

const FinanciamientoPage: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'Financiamiento de Autos — Richard Automotive',
    description:
      'Financiamiento de autos nuevos y usados en Bayamón, Puerto Rico. Pre-aprobación en 24 horas, tasas competitivas y proceso 100% digital.',
    provider: {
      '@type': 'AutoDealer',
      name: 'Richard Automotive',
      telephone: '+1-787-368-2880',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bayamón',
        addressRegion: 'PR',
        postalCode: '00961',
        addressCountry: 'US',
      },
    },
    areaServed: {
      '@type': 'State',
      name: 'Puerto Rico',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <SEO
        title="Financiamiento de Autos en Puerto Rico | Richard Automotive Bayamón"
        description="Aplica para financiamiento de autos nuevos y usados en Bayamón, PR. Pre-aprobación en 24h, tasas competitivas y crédito flexible. Dealer de autos líder en Puerto Rico."
        url="/financiamiento"
        type="website"
        schema={[schema, faqSchema]}
      />

      <div className="min-h-screen bg-[#0a0f1e] text-white">
        <section className="relative min-h-[60vh] flex items-center overflow-hidden py-24 px-6">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/assets/seo/financing-hero.webp"
              alt="Luxury car financing in Puerto Rico"
              className="w-full h-full object-cover opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-b from-[#0a0f1e]/80 via-[#0a0f1e]/60 to-[#0a0f1e]" />
            <div className="absolute inset-0 bg-linear-to-r from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                Richard Automotive — Bayamón
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Financiamiento
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                de Autos de Lujo
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">
              Pre-aprobación en <strong className="text-white">24 horas</strong>, tasas competitivas
              y proceso 100% digital. Hacemos que el camino hacia tu próximo auto sea tan premium
              como el vehículo mismo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-cyan-500 to-cyan-400 text-slate-900 font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,174,217,0.4)]"
              >
                <Phone size={18} />
                Aplicar por WhatsApp
              </a>
              <Link
                to="/apply"
                className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-white/10 transition-all"
              >
                <FileText size={18} />
                Aplicación en Línea
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Calculator Section */}
        <CreditCalculator />

        {/* F&I Approval Simulator — FlexDrive™ */}
        <section className="py-20 px-6" id="simulador">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-5">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                Simulador FlexDrive™ — F&I Premium
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              Calcula tu Pago{' '}
              <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Mensual Ahora
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Sin impacto a tu crédito. Sin presión. Selecciona tu perfil crediticio, ajusta el
              pronto y descubre exactamente cuánto pagas al mes — en segundos.
            </p>
          </div>
          <ApprovalSimulatorWidget dealerId="richard-automotive" />
        </section>

        {/* Benefits */}
        <section className="py-16 px-6 bg-slate-900/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-center uppercase tracking-tight mb-10">
              ¿Por qué elegir nuestro financiamiento?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-slate-800/50 border border-white/5 rounded-4xl p-6 flex flex-col gap-3 hover:border-cyan-500/20 transition-all"
                >
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <h3 className="font-black text-white">{title}</h3>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-center">
              Requisitos para Aplicar
            </h2>
            <div className="space-y-4">
              {[
                'Identificación válida (licencia o pasaporte)',
                'Comprobante de ingresos (talonario o carta de empleo)',
                'Comprobante de residencia actual',
                'Número de seguro social',
                'Carta de referencia bancaria (opcional, pero mejora la tasa)',
              ].map((req) => (
                <div
                  key={req}
                  className="flex items-center gap-3 bg-slate-800/30 border border-white/5 rounded-2xl px-5 py-4"
                >
                  <CheckCircle size={18} className="text-cyan-400 shrink-0" />
                  <span className="text-slate-200">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-slate-900/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-center">
              Preguntas Frecuentes — Financiamiento en Puerto Rico
            </h2>
            <p className="text-slate-400 text-sm text-center mb-10">
              {faqs.length} respuestas sobre APR, documentos, plazos y más.
            </p>
            <FinanciamientoFAQ faqs={faqs} />
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-10 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: ShieldCheck, label: 'Ford Authorized Dealer', sub: 'Central Ford PR' },
                { icon: Shield, label: 'DTOP Licenciado', sub: 'Puerto Rico' },
                { icon: CheckCircle, label: 'Sin costo de pre-aprobación', sub: 'Soft pull únicamente' },
                { icon: FileText, label: 'Proceso 100 % transparente', sub: 'Sin letra pequeña' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-4 rounded-2xl border border-white/5 bg-slate-900/40 gap-2">
                  <Icon size={18} className="text-cyan-400" />
                  <p className="text-[10px] font-black text-white leading-tight">{label}</p>
                  <p className="text-[9px] text-slate-500">{sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-5">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong className="text-slate-400">Aviso legal:</strong> Las tasas APR, plazos y mensualidades presentadas son estimados con fines educativos y pueden variar según el historial crediticio del solicitante, el banco financiero seleccionado y las condiciones del mercado al momento de la transacción. El financiamiento está sujeto a aprobación crediticia. Richard Automotive opera como franquiciado de Central Ford bajo licencia de Ford Motor Company y está licenciado por el DTOP de Puerto Rico. Para información sobre sus derechos como consumidor de crédito, visita{' '}
                <a href="https://www.consumerfinance.gov" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                  consumerfinance.gov
                </a>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
              ¿Listo para manejar tu próximo auto?
            </h2>
            <p className="text-slate-400 mb-8">
              Contáctanos hoy. Atendemos toda Puerto Rico — Lunes a Sábado, 9AM a 6PM.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-500 to-purple-500 text-white font-black uppercase tracking-widest px-10 py-5 rounded-4xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,174,217,0.3)]"
            >
              <Phone size={20} />
              Hablar con un Asesor Ahora
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default FinanciamientoPage;
