import React from 'react';
import SEO from '@/shared/ui/seo/SEO';
import { Phone, MapPin, Clock, MessageCircle, Mail, ChevronRight } from 'lucide-react';

const WHATSAPP_LINK = 'https://wa.me/17873682880?text=Hola%2C%20me%20gustaría%20más%20información';
const PHONE_NUMBER = '+1 (787) 368-2880';
const EMAIL = 'info@richard-automotive.com';

const ContactoPage: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'Richard Automotive',
    description:
      'Dealer de autos nuevos y usados de lujo en Bayamón, Puerto Rico. Financiamiento expreso, trade-in y entrega inmediata.',
    telephone: '+1-787-368-2880',
    email: EMAIL,
    url: 'https://www.richard-automotive.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bayamón',
      addressLocality: 'Bayamón',
      addressRegion: 'PR',
      postalCode: '00961',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.399,
      longitude: -66.1573,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    areaServed: {
      '@type': 'State',
      name: 'Puerto Rico',
    },
    priceRange: '$$',
    sameAs: [
      'https://www.facebook.com/richardautomotive1',
      'https://www.instagram.com/richardoneal_/',
    ],
  };

  return (
    <>
      <SEO
        title="Contacto — Richard Automotive Bayamón Puerto Rico | (787) 368-2880"
        description="Contacta a Richard Automotive en Bayamón, Puerto Rico. Llámanos al (787) 368-2880 o escríbenos por WhatsApp. Atendemos toda la isla — Lunes a Sábado 9AM a 6PM."
        url="/contacto"
        type="website"
        schema={schema}
      />

      <div className="min-h-screen bg-[#0a0f1e] text-white">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 px-6">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-900/20 via-[#0a0f1e] to-purple-900/10 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                Bayamón, Puerto Rico — Servicio a toda la isla
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
              Contáctanos
            </h1>

            <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10">
              Estamos listos para ayudarte a encontrar tu próximo auto. Escríbenos o llámanos — respondemos rápido.
            </p>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-linear-to-r from-green-500 to-green-400 text-slate-900 font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
              <MessageCircle size={18} />
              Escribir por WhatsApp
            </a>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone */}
            <a
              href={`tel:${PHONE_NUMBER.replace(/\s|\(|\)|-/g, '')}`}
              className="group bg-slate-800/50 border border-white/5 rounded-3xl p-8 flex gap-5 hover:border-cyan-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                <Phone size={22} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Teléfono</p>
                <p className="text-xl font-black text-white">{PHONE_NUMBER}</p>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                  Llamar ahora <ChevronRight size={14} />
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-slate-800/50 border border-white/5 rounded-3xl p-8 flex gap-5 hover:border-green-500/30 transition-all"
            >
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                <MessageCircle size={22} className="text-green-400" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-xl font-black text-white">17873682880</p>
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                  Escribir ahora <ChevronRight size={14} />
                </p>
              </div>
            </a>

            {/* Location */}
            <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-8 flex gap-5">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin size={22} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Ubicación</p>
                <p className="text-xl font-black text-white">Bayamón, Puerto Rico</p>
                <p className="text-sm text-slate-400 mt-1">Con servicio a toda la isla</p>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-slate-800/50 border border-white/5 rounded-3xl p-8 flex gap-5">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                <Clock size={22} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Horario</p>
                <p className="text-xl font-black text-white">Lun — Sáb</p>
                <p className="text-sm text-slate-400 mt-1">9:00 AM a 6:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Questions */}
        <section className="py-16 px-6 bg-slate-900/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">
              ¿Tienes alguna pregunta rápida?
            </h2>
            <p className="text-slate-400 mb-8">
              Nuestro equipo responde consultas de inventario, financiamiento y trade-in por WhatsApp.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-10">
              {[
                { q: '¿Tienen este modelo?', hint: 'Consulta de inventario' },
                { q: '¿Me aprueban con mi crédito?', hint: 'Pre-calificación' },
                { q: '¿Cuánto vale mi carro?', hint: 'Valoración trade-in' },
              ].map(({ q, hint }) => (
                <a
                  key={q}
                  href={`https://wa.me/17873682880?text=${encodeURIComponent(q)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800/60 border border-white/5 rounded-2xl px-5 py-4 hover:border-cyan-500/20 transition-all group"
                >
                  <p className="font-bold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">
                    "{q}"
                  </p>
                  <p className="text-xs text-slate-500">{hint}</p>
                </a>
              ))}
            </div>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-linear-to-r from-cyan-500 to-purple-500 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:scale-105 transition-transform"
            >
              <MessageCircle size={18} />
              Empezar Conversación
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default ContactoPage;
