import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/shared/ui/seo/SEO';
import { CheckCircle, Clock, FileText, Phone, ChevronRight, Zap, Shield, TrendingDown } from 'lucide-react';
import { CreditCalculator } from '@/features/loans/ui/CreditCalculator';

const WHATSAPP_LINK = 'https://wa.me/17873682880?text=Hola%2C%20quiero%20información%20sobre%20financiamiento';

const faqs = [
  {
    question: '¿Qué necesito para solicitar financiamiento?',
    answer: 'Identificación válida (licencia de conducir o pasaporte), comprobante de ingresos (talonario o carta de empleo), comprobante de residencia y número de seguro social.',
  },
  {
    question: '¿Cuánto tiempo tarda la aprobación?',
    answer: 'Nuestra pre-aprobación en línea toma solo 24 horas. Con documentos completos, la aprobación final puede ser el mismo día.',
  },
  {
    question: '¿Aceptan personas con crédito bajo o sin historial?',
    answer: 'Sí. Trabajamos con múltiples entidades financieras en Puerto Rico para encontrar la opción que mejor se adapte a tu situación crediticia.',
  },
  {
    question: '¿Puedo hacer trade-in como parte del pago inicial?',
    answer: 'Absolutamente. Tasamos tu vehículo actual a precio justo de mercado y lo aplicamos directamente al enganche de tu próximo auto.',
  },
  {
    question: '¿Cuáles son los plazos de financiamiento disponibles?',
    answer: 'Ofrecemos plazos flexibles de 24, 36, 48, 60 y hasta 72 meses para que tu pago mensual se ajuste a tu presupuesto.',
  },
];

const benefits = [
  { icon: Zap, title: 'Pre-Aprobación en 24h', desc: 'Respuesta rápida sin salir de casa' },
  { icon: TrendingDown, title: 'Tasas Competitivas', desc: 'Negociamos las mejores opciones para ti' },
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

  return (
    <>
      <SEO
        title="Financiamiento de Autos en Puerto Rico | Richard Automotive Bayamón"
        description="Aplica para financiamiento de autos nuevos y usados en Bayamón, PR. Pre-aprobación en 24h, tasas competitivas y crédito flexible. Dealer de autos líder en Puerto Rico."
        url="/financiamiento"
        type="website"
        schema={schema}
      />

      <div className="min-h-screen bg-[#0a0f1e] text-white">
        <section className="relative min-h-[60vh] flex items-center overflow-hidden py-24 px-6">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/seo/financing-hero.png" 
              alt="Luxury car financing in Puerto Rico" 
              className="w-full h-full object-cover opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e]/80 via-[#0a0f1e]/60 to-[#0a0f1e]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e] via-[#0a0f1e]/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Richard Automotive — Bayamón</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Financiamiento
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                de Autos de Lujo
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">
              Pre-aprobación en <strong className="text-white">24 horas</strong>, tasas competitivas y proceso 100% digital.
              Hacemos que el camino hacia tu próximo auto sea tan premium como el vehículo mismo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,174,217,0.4)]"
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
                  className="bg-slate-800/50 border border-white/5 rounded-3xl p-6 flex flex-col gap-3 hover:border-cyan-500/20 transition-all"
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
                <div key={req} className="flex items-center gap-3 bg-slate-800/30 border border-white/5 rounded-2xl px-5 py-4">
                  <CheckCircle size={18} className="text-cyan-400 shrink-0" />
                  <span className="text-slate-200">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Schema */}
        <section className="py-16 px-6 bg-slate-900/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 text-center">
              Preguntas Frecuentes — Financiamiento PR
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group bg-slate-800/50 border border-white/5 rounded-3xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-bold text-white list-none">
                    {faq.question}
                    <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black uppercase tracking-widest px-10 py-5 rounded-3xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(0,174,217,0.3)]"
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
