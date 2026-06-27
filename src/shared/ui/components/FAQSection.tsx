'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ShieldCheck, Activity, Search, MessageCircle } from 'lucide-react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────
   FAQ DATA  (AEO/GEO-optimised — conversational, complete)
   ───────────────────────────────────────────────────────────── */
const CATEGORIES = ['Todo', 'Financiamiento', 'Ford Nuevo', 'Trade-In', 'Proceso de Compra'] as const;
type Category = (typeof CATEGORIES)[number];

interface FAQItem {
  question: string;
  answer: string;
  category: Exclude<Category, 'Todo'>;
}

const faqData: FAQItem[] = [
  /* ── FINANCIAMIENTO ── */
  {
    category: 'Financiamiento',
    question: '¿Cuánto es el pronto mínimo para comprar un auto en Puerto Rico?',
    answer:
      'El pronto mínimo varía entre el 10 % y el 20 % del precio del vehículo dependiendo de tu historial crediticio y el banco financiero. En Richard Automotive tenemos opciones desde $0 de inicial para clientes calificados a través de Ford Credit. Usa nuestro simulador de pagos para calcular tu pronto ideal en minutos.',
  },
  {
    category: 'Financiamiento',
    question: '¿Puedo obtener financiamiento con crédito bajo o sin historial de crédito?',
    answer:
      'Sí. Trabajamos con más de 15 entidades bancarias y cooperativas en Puerto Rico, incluyendo programas especiales para primeros compradores y personas con historial crediticio limitado. Ford Credit también ofrece el programa "First Time Buyers" que no requiere co-firmante para calificar.',
  },
  {
    category: 'Financiamiento',
    question: '¿Cuánto tiempo tarda la pre-aprobación de crédito?',
    answer:
      'La pre-aprobación en línea toma entre 15 y 30 minutos a través de nuestra plataforma de pre-cualificación. Recibirás una respuesta preliminar de inmediato sin afectar tu puntaje de crédito (soft pull). La aprobación formal con el banco puede completarse el mismo día si entregas todos los documentos.',
  },
  {
    category: 'Financiamiento',
    question: '¿Qué documentos necesito para solicitar financiamiento de auto?',
    answer:
      'Necesitas: (1) licencia de conducir o pasaporte vigente, (2) número de Seguro Social, (3) talonarios de pago de los últimos 30 días o carta de empleo con sueldo, (4) comprobante de residencia reciente (factura de luz, agua o estado de cuenta bancario), y (5) referencias personales. Para trabajadores por cuenta propia, se requieren las últimas 2 declaraciones de IRS.',
  },
  {
    category: 'Financiamiento',
    question: '¿Cuáles son los plazos de financiamiento disponibles?',
    answer:
      'Ofrecemos plazos de 24, 36, 48, 60 y 72 meses. Los plazos más largos (60-72 meses) reducen la mensualidad pero aumentan el costo total de intereses. Para vehículos nuevos Ford, las tasas con Ford Credit pueden comenzar desde el 0 % APR en modelos seleccionados durante promociones especiales.',
  },
  {
    category: 'Financiamiento',
    question: '¿Qué es el Bono Web de $300 y cómo lo reclamo?',
    answer:
      'El Bono Web de $300 es un descuento exclusivo para clientes que inician su compra a través de nuestra página web. Se aplica directamente al precio final del vehículo o como abono al pronto. Para reclamarlo, simplemente menciona que vienes de la web al comunicarte con tu asesor o envíanos un WhatsApp con la palabra "BONO300". No tiene fecha de vencimiento mientras esté publicado en la página.',
  },

  /* ── FORD NUEVO ── */
  {
    category: 'Ford Nuevo',
    question: '¿Cuál es la garantía de un Ford nuevo comprado en Puerto Rico?',
    answer:
      'Todo Ford nuevo incluye la garantía de fábrica Ford: 3 años / 36,000 millas en piezas y mano de obra, y 5 años / 60,000 millas en tren motriz (motor y transmisión). Además, el servicio de garantía es válido en cualquier concesionario Ford autorizado en Puerto Rico y Estados Unidos, respaldado directamente por Central Ford.',
  },
  {
    category: 'Ford Nuevo',
    question: '¿Qué modelos Ford nuevos están disponibles en Richard Automotive?',
    answer:
      'Tenemos inventario disponible de las líneas más populares: Ford F-150 (incluyendo Raptor y Tremor), Ford Bronco, Ford Explorer, Ford Edge, Ford Escape, Ford Maverick y Ford Mustang. El inventario varía semanalmente. Puedes ver disponibilidad en tiempo real en nuestra página de inventario o chatear con un asesor por WhatsApp para buscar tu configuración exacta.',
  },
  {
    category: 'Ford Nuevo',
    question: '¿Puedo ordenar un Ford personalizado con los accesorios que quiero?',
    answer:
      'Sí. A través del programa Ford Order, puedes seleccionar el modelo, color exterior, color interior, paquete tecnológico y accesorios de fábrica. El tiempo de entrega es generalmente de 8 a 12 semanas desde la confirmación del pedido. Nuestros asesores te guían en cada paso y puedes fijar el precio de Ford Credit al momento del pedido.',
  },
  {
    category: 'Ford Nuevo',
    question: '¿Qué diferencia hay entre los planes Ford F-150 XLT, Lariat y Platinum?',
    answer:
      'XLT es el nivel de entrada con más equipamiento estándar que la versión base: incluye cámara de retroceso, pantalla SYNC 4 de 8", control de crucero adaptivo y rines de aluminio. Lariat agrega tapicería de cuero, asientos calefaccionados/ventilados, techo panorámico opcional y tecnología de asistencia avanzada. Platinum es el nivel premium con materiales de lujo, head-up display y sistema de audio Bang & Olufsen. Te recomendamos el Lariat para el mejor equilibrio precio-equipamiento.',
  },

  /* ── TRADE-IN ── */
  {
    category: 'Trade-In',
    question: '¿Aceptan autos en trade-in aunque tenga deuda pendiente (saldo negativo)?',
    answer:
      'Sí. Aceptamos trade-ins con deuda pendiente. Si el valor de mercado de tu auto es menor que el saldo que debes (negative equity), la diferencia se puede incorporar al financiamiento del auto nuevo, sujeto a aprobación bancaria. Nuestros asesores te explicarán opciones para minimizar el impacto en tu mensualidad.',
  },
  {
    category: 'Trade-In',
    question: '¿Cómo se calcula el valor de mi auto en trade-in?',
    answer:
      'Usamos el valor de mercado de Puerto Rico basado en herramientas como KBB (Kelley Blue Book), datos de subastas locales y la condición real del vehículo. Factores que afectan el valor: millas recorridas, historial de accidentes, condición mecánica y estética, y demanda actual del modelo en la isla. Puedes obtener una estimación preliminar en línea en 2 minutos.',
  },
  {
    category: 'Trade-In',
    question: '¿Puedo hacer trade-in de cualquier marca o solo de Ford?',
    answer:
      'Aceptamos cualquier marca y modelo: Toyota, Honda, Hyundai, Kia, Chevrolet, Nissan, y más. El valor del trade-in aplica igualmente independientemente de la marca. Nuestro interés es facilitarte la transición al vehículo que deseas.',
  },

  /* ── PROCESO DE COMPRA ── */
  {
    category: 'Proceso de Compra',
    question: '¿Puedo comprar mi próximo auto 100% en línea sin visitar el concesionario?',
    answer:
      'Sí. Puedes seleccionar el vehículo, calcular tu financiamiento, pre-cualificarte y enviar documentos completamente en línea desde nuestra plataforma. La entrega del vehículo puede coordinarse en nuestro salón o en una dirección designada en Puerto Rico. Sin embargo, la firma del contrato de venta y los documentos de DTOP aún requieren firma física o notarial.',
  },
  {
    category: 'Proceso de Compra',
    question: '¿Cómo puedo agendar una prueba de manejo?',
    answer:
      'Puedes agendar tu test drive directamente desde nuestra página web en la sección "Prueba de Manejo", por WhatsApp al (787) 214-6200, o llamando al (787) 368-2880. Ofrecemos pruebas de manejo de lunes a sábado de 9:00 AM a 5:00 PM. Solo necesitas traer tu licencia de conducir vigente.',
  },
  {
    category: 'Proceso de Compra',
    question: '¿Dónde está ubicado Richard Automotive y cuáles son sus horarios?',
    answer:
      'Estamos ubicados en Vega Alta, Puerto Rico, en la PR-2 km 35.6, frente al centro comercial Plaza Vega Alta. Horario: lunes a viernes de 9:00 AM a 6:00 PM, sábados de 9:00 AM a 5:00 PM. Domingos solo con cita previa. Coordenadas GPS: 18.4166° N, 66.3848° O.',
  },
  {
    category: 'Proceso de Compra',
    question: '¿Qué protección F&I (F and I) ofrecen con la compra del vehículo?',
    answer:
      'Ofrecemos varios productos de protección: (1) Garantía extendida Ford (hasta 8 años/150,000 millas), (2) Seguro GAP que cubre la diferencia entre el valor del auto y lo que debes si el vehículo es pérdida total, (3) Protección de pintura y cuero, (4) Seguro de vida y desempleo sobre el préstamo. Nuestros especialistas F&I te presentan opciones sin presión para que elijas lo que tenga sentido para tu situación.',
  },
];

/* ─────────────────────────────────────────────────────────────
   JSON-LD  (all questions, not filtered by category)
   ───────────────────────────────────────────────────────────── */
const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────── */
const FAQSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('Todo');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return faqData.filter((item) => {
      const matchCat = activeCategory === 'Todo' || item.category === activeCategory;
      const matchSearch =
        !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950 py-24 mx-6">
      {/* Background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-cyan-500/50" />
            <span className="font-tech text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">
              CENTRO DE AYUDA
            </span>
            <div className="h-px w-8 bg-cyan-500/50" />
          </div>
          <h2 className="font-cinematic text-5xl md:text-7xl text-white tracking-widest leading-none">
            PREGUNTAS <span className="text-cyan-400">FRECUENTES</span>
          </h2>
          <p className="mx-auto max-w-xl font-tech text-xs uppercase tracking-widest text-slate-400">
            {faqData.length} respuestas claras sobre tu próxima compra de auto en Puerto Rico.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search
            size={16}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="search"
            placeholder="Busca tu pregunta... (ej. pronto, garantía, trade-in)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
            className="w-full bg-slate-900/60 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-cyan-500 border-cyan-400 text-slate-900 shadow-[0_0_16px_rgba(34,211,238,0.35)]'
                  : 'border-white/10 text-slate-400 hover:border-cyan-500/40 hover:text-white bg-slate-900/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-12 font-tech text-sm">
            No encontramos resultados. Pregúntanos por WhatsApp.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`overflow-hidden rounded-3xl border transition-all duration-300 ${
                    isOpen
                      ? 'border-cyan-500/40 bg-slate-900/70'
                      : 'border-white/5 bg-slate-900/30 hover:border-cyan-500/20 hover:bg-slate-900/50'
                  }`}
                >
                  <button
                    onClick={() => handleToggle(idx)}
                    className="w-full flex items-center justify-between gap-4 p-7 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-4 flex-1 min-w-0">
                      <span
                        className={`shrink-0 h-2 w-2 rounded-full transition-all duration-300 ${
                          isOpen
                            ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                            : 'bg-cyan-500/20'
                        }`}
                      />
                      <span className="text-sm md:text-base font-bold text-white leading-snug">
                        {item.question}
                      </span>
                    </span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-cyan-500 transition-transform duration-400 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/5 px-7 pb-7 pt-4">
                      <p className="text-sm md:text-base leading-relaxed text-slate-300 whitespace-pre-line">
                        {item.answer}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-500/20">
                          <ShieldCheck size={10} /> Verificado
                        </span>
                        <span className="flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-white/5">
                          <Activity size={10} /> {item.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-14 rounded-3xl border border-white/5 bg-slate-900/40 p-8 text-center">
          <p className="text-white font-bold text-lg mb-1">¿No encontraste lo que buscabas?</p>
          <p className="text-slate-400 text-sm mb-6">
            Un asesor Richard está disponible ahora mismo para responder cualquier pregunta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/17872146200?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20%E2%80%A6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(37,211,102,0.35)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle size={16} /> Chatear por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/10 text-white/70 hover:text-white hover:border-cyan-500/40 font-bold text-xs uppercase tracking-widest transition-all"
            >
              Otras formas de contacto →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
