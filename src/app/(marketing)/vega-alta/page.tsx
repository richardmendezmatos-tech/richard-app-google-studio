import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock, Phone, MessageCircle, ArrowRight, Car, Shield, Award, CheckCircle, Star } from 'lucide-react';
import { BUSINESS_CONTACT } from '@/shared/consts/businessContact';

export const metadata: Metadata = {
  title: 'Dealer Ford Vega Alta Puerto Rico | Central Ford — Richard Automotive',
  description:
    'Concesionario Ford autorizado en Vega Alta, PR. Carr. #2 KM 28.5. Autos Ford nuevos y usados, financiamiento Ford Credit, Bono Web $300. Sirviendo Dorado, Toa Baja, Manatí, Barceloneta y Arecibo.',
  keywords: [
    'dealer ford vega alta',
    'central ford vega alta',
    'concesionario ford vega alta',
    'ford vega alta puerto rico',
    'auto dealer vega alta pr',
    'comprar ford vega alta',
    'ford dealer cerca dorado',
    'ford dealer cerca toa baja',
    'ford dealer cerca manati',
    'richard automotive vega alta',
    'ford credit vega alta',
    'autos nuevos vega alta',
  ],
  alternates: {
    canonical: 'https://www.richard-automotive.com/vega-alta',
  },
  openGraph: {
    title: 'Dealer Ford Vega Alta PR | Central Ford — Richard Automotive',
    description:
      'Concesionario Ford autorizado en Vega Alta. Inventario de autos Ford nuevos y usados, financiamiento, trade-in y Bono Web $300.',
    type: 'website',
    siteName: 'Richard Automotive',
    locale: 'es_PR',
  },
};

const C = BUSINESS_CONTACT;

const NEARBY_CITIES = [
  { name: 'Dorado', km: '12 km' },
  { name: 'Toa Baja', km: '18 km' },
  { name: 'Manatí', km: '20 km' },
  { name: 'Barceloneta', km: '22 km' },
  { name: 'Arecibo', km: '35 km' },
  { name: 'Bayamón', km: '28 km' },
];

const FORD_MODELS = [
  { slug: 'f-150', name: 'F-150', label: 'La camioneta más vendida en PR' },
  { slug: 'explorer', name: 'Explorer', label: 'SUV familiar 7 pasajeros' },
  { slug: 'escape', name: 'Escape', label: 'Compacto eficiente' },
  { slug: 'bronco', name: 'Bronco', label: 'Adventure 4x4' },
  { slug: 'maverick', name: 'Maverick', label: 'Mini-truck eficiente' },
  { slug: 'ranger', name: 'Ranger', label: 'Camioneta mediana' },
];

function VegaAltaJsonLd() {
  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': ['AutoDealer', 'LocalBusiness'],
    name: 'Richard Automotive - Central Ford Vega Alta',
    alternateName: ['Central Ford Vega Alta', 'Richard Automotive PR'],
    description:
      'Concesionario Ford autorizado en Vega Alta, Puerto Rico. Autos Ford nuevos y usados, financiamiento Ford Credit, servicio técnico certificado.',
    url: 'https://www.richard-automotive.com',
    telephone: C.phone,
    email: C.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: C.address.street,
      addressLocality: C.address.city,
      addressRegion: C.address.state,
      postalCode: C.address.zip,
      addressCountry: C.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: C.geo.latitude,
      longitude: C.geo.longitude,
    },
    hasMap: `https://maps.google.com/?q=${C.geo.latitude},${C.geo.longitude}`,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Credit Card, Ford Credit Financing',
    areaServed: [
      { '@type': 'City', name: 'Vega Alta', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
      { '@type': 'City', name: 'Dorado', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
      { '@type': 'City', name: 'Toa Baja', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
      { '@type': 'City', name: 'Manatí', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
      { '@type': 'City', name: 'Barceloneta', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
      { '@type': 'City', name: 'Arecibo', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
      { '@type': 'City', name: 'Bayamón', containedIn: { '@type': 'State', name: 'Puerto Rico' } },
    ],
    sameAs: [C.social.facebook, C.social.instagram],
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.richard-automotive.com' },
      { '@type': 'ListItem', position: 2, name: 'Dealer Ford Vega Alta', item: 'https://www.richard-automotive.com/vega-alta' },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Dónde está ubicado el dealer Ford en Vega Alta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Estamos ubicados en Carr. #2 KM 28.5, Bo. Espinosa, Vega Alta, PR 00692. Puedes llegar fácilmente por la Carretera #2 desde cualquier dirección. Teléfono: 787-368-2880.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuál es el horario del dealer Ford Vega Alta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Lunes a Viernes: 9:00 AM – 6:00 PM. Sábado: 9:00 AM – 5:00 PM. Domingo: Cerrado. También puedes contactarnos por WhatsApp al 787-368-2880 fuera del horario regular.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Ofrecen financiamiento en el dealer Ford Vega Alta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, somos distribuidores autorizados Ford Credit. Ofrecemos tasas preferenciales, aprobación el mismo día y opciones para todos los perfiles de crédito. Puedes precalificar en línea en nuestra página de precualificación.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Sirven a clientes fuera de Vega Alta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutamente. Servimos toda la región norte de Puerto Rico: Dorado, Toa Baja, Manatí, Barceloneta, Arecibo, Bayamón y más. Muchos clientes vienen desde Bayamón y San Juan para aprovechar nuestro inventario y precios.',
        },
      },
    ],
  };

  return [localBusiness, breadcrumb, faqSchema].map((schema, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  ));
}

export default function VegaAltaPage() {
  const waUrl = `https://wa.me/1${C.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, estoy buscando un Ford en el dealer de Vega Alta. ¿Pueden ayudarme?')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <VegaAltaJsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
              <MapPin size={12} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                Carr. #2 KM 28.5 · Vega Alta, PR 00692
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Dealer Ford Autorizado
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Vega Alta, Puerto Rico
              </span>
            </h1>

            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-2xl">
              Más de 99 vehículos Ford nuevos y usados en inventario. Financiamiento Ford Credit, aprobación el mismo día, y el <strong className="text-white">Bono Web $300</strong> exclusivo para compradores en línea.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#25D366] hover:bg-[#20c05b] text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-green-900/30"
              >
                <MessageCircle size={18} />
                WhatsApp Directo
              </a>
              <Link
                href="/inventario"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/25"
              >
                Ver Inventario <ArrowRight size={18} />
              </Link>
              <a
                href={`tel:${C.phone}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
              >
                <Phone size={16} />
                {C.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-3">
            <MapPin className="text-cyan-400" size={28} />
            <h2 className="font-black text-lg">Cómo Llegar</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{C.address.full}</p>
            <a
              href={`https://maps.google.com/?q=${C.geo.latitude},${C.geo.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 font-bold text-xs hover:underline"
            >
              Abrir en Google Maps <ArrowRight size={12} />
            </a>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-3">
            <Clock className="text-cyan-400" size={28} />
            <h2 className="font-black text-lg">Horario</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Lunes – Viernes</span>
                <span className="font-bold">{C.hours.weekdays}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Sábado</span>
                <span className="font-bold">{C.hours.saturday}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Domingo</span>
                <span>{C.hours.sunday}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">WhatsApp disponible fuera de horario</p>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-3">
            <Phone className="text-cyan-400" size={28} />
            <h2 className="font-black text-lg">Contacto</h2>
            <div className="space-y-2 text-sm">
              <a href={`tel:${C.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-white">
                <Phone size={14} className="text-cyan-400" /> {C.phone}
              </a>
              <a href={`tel:${C.locationPhone}`} className="flex items-center gap-2 text-slate-300 hover:text-white">
                <Phone size={14} className="text-cyan-400" /> {C.locationPhone}
              </a>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-[#25D366]/20 transition-all"
            >
              <MessageCircle size={14} /> Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Map Embed */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-3xl overflow-hidden border border-white/5 h-72 md:h-96">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD_placeholder&q=${C.geo.latitude},${C.geo.longitude}`}
            style={{ border: 0, width: '100%', height: '100%', filter: 'invert(90%) hue-rotate(180deg)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Central Ford Vega Alta"
          />
        </div>
        <p className="text-center mt-3 text-slate-500 text-xs">
          Carr. #2 KM 28.5, Bo. Espinosa, Vega Alta, PR 00692 ·{' '}
          <a
            href={`https://maps.google.com/?q=${C.geo.latitude},${C.geo.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Abrir en Maps
          </a>
        </p>
      </section>

      {/* Nearby Cities */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black mb-2">Servimos toda la Región Norte de PR</h2>
          <p className="text-slate-400 text-sm">A pocos minutos por la Carretera #2</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {NEARBY_CITIES.map((city) => (
            <div key={city.name} className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
              <MapPin className="text-cyan-400 mx-auto mb-2" size={20} />
              <p className="font-black text-sm">{city.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{city.km}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ford Models */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black mb-8">
          Modelos Ford Disponibles en{' '}
          <span className="text-cyan-400">Vega Alta</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FORD_MODELS.map((m) => (
            <Link
              key={m.slug}
              href={`/ford/${m.slug}`}
              className="group bg-slate-900/50 border border-white/5 rounded-2xl p-5 hover:border-cyan-400/30 transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-black text-lg">Ford {m.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
              </div>
              <ArrowRight size={16} className="text-cyan-400 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/inventario"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
          >
            Ver Todo el Inventario <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-black mb-8 text-center">
          ¿Por qué elegir el dealer Ford de Vega Alta?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Shield className="text-cyan-400" size={28} />,
              title: 'Dealer Autorizado Ford',
              desc: 'Somos distribuidores Ford certificados con acceso completo a inventario nuevo y CPO.',
            },
            {
              icon: <Award className="text-cyan-400" size={28} />,
              title: 'Ford Credit',
              desc: 'Tasas preferenciales, aprobación el mismo día. Servimos todos los perfiles de crédito.',
            },
            {
              icon: <CheckCircle className="text-cyan-400" size={28} />,
              title: 'Bono Web $300',
              desc: '$300 adicionales al precio al comprar tu Ford mencionando el bono web.',
            },
            {
              icon: <Star className="text-cyan-400" size={28} />,
              title: 'Garantía 10 Años',
              desc: 'Ford Motor Company respaldo total en modelos nuevos: 10 años / 100,000 millas.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-3">
              {item.icon}
              <h3 className="font-black">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-black mb-8 text-center">
          Preguntas Frecuentes — Dealer Vega Alta
        </h2>
        <div className="space-y-3">
          {[
            {
              q: '¿Dónde está ubicado el dealer Ford en Vega Alta?',
              a: `Estamos en ${C.address.full}. Por la Carretera #2, fácil acceso desde Dorado, Toa Baja, Manatí y Arecibo. Llama al ${C.phone} para indicaciones.`,
            },
            {
              q: '¿Cuál es el horario del dealer Ford Vega Alta?',
              a: `Lunes a Viernes ${C.hours.weekdays}. Sábado ${C.hours.saturday}. Domingo cerrado. También puedes contactarnos por WhatsApp fuera del horario.`,
            },
            {
              q: '¿Ofrecen financiamiento en el dealer Ford Vega Alta?',
              a: 'Sí, somos distribuidores autorizados Ford Credit con tasas preferenciales y aprobación el mismo día. Puedes precalificar en línea sin impacto crediticio.',
            },
            {
              q: '¿Sirven a clientes fuera de Vega Alta?',
              a: 'Absolutamente. Servimos Dorado, Toa Baja, Manatí, Barceloneta, Arecibo, Bayamón y toda la región norte. Muchos clientes vienen desde San Juan por nuestro inventario y precios.',
            },
            {
              q: '¿Qué es el Bono Web $300?',
              a: 'Es un descuento exclusivo de $300 para clientes que contactan o compran a través de nuestra página web. Válido en vehículos Ford nuevos y usados certificados.',
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden"
            >
              <summary className="p-5 font-bold cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between text-sm">
                <span>{faq.q}</span>
                <span className="text-cyan-400 shrink-0 ml-4 group-open:rotate-180 transition-transform text-xs">▼</span>
              </summary>
              <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/20 rounded-3xl p-10 space-y-6">
          <h2 className="text-3xl font-black">
            Visítanos en Vega Alta o escríbenos ahora
          </h2>
          <p className="text-slate-400">
            Más de 99 Fords en inventario. Financiamiento Ford Credit el mismo día.
            Bono Web <strong className="text-white">$300</strong> esperándote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20c05b] text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              <MessageCircle size={18} /> WhatsApp Ahora
            </a>
            <Link
              href="/precualificacion"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              Precalifica Online <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
