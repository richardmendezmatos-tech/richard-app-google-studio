import React from 'react';
import { ChevronDown, Cpu, Activity, ShieldCheck } from 'lucide-react';

const faqData = [
  {
    question: '¿Puedo comprar un auto 100% en línea sin visitar el concesionario?',
    answer:
      "Sí, absolutamente. Nuestra plataforma 'Richard Automotive Direct' le permite seleccionar su vehículo, personalizar su financiamiento, valorar su trade-in y firmar documentos digitalmente. Entregamos el auto directamente en la ubicación que nos indique.",
  },
  {
    question: '¿Cómo funciona la aprobación de crédito en línea?',
    answer:
      'Es rápida y sencilla. Conectamos con nuestros bancos afiliados para ofrecerle los mejores términos (APR, mensualidad y pronto) en minutos, sin afectar su puntaje crediticio inicial.',
  },
  {
    question: "¿Aceptan autos en 'Trade-In' aunque deba dinero?",
    answer:
      'Sí. Ejecutamos liquidaciones estratégicas de balances pendientes. Si el valor de su activo supera el gravamen, aplicamos el equity a favor de su nueva unidad Richard de forma inmediata.',
  },
  {
    question: '¿Qué garantía tienen los vehículos usados certificados?',
    answer:
      'Cada unidad de Richard pasa una inspección técnica completa de 150 puntos. Se entregan con garantía limitada y 72 horas de prueba de satisfacción total. Si no es su sueño, el retorno es sin costo.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const FAQSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-[50px] border border-white/5 bg-slate-950 py-24 mx-6">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-cyan-500/50" />
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-cyan-400 animate-pulse" />
              <span className="font-tech text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">
                CENTRO DE AYUDA
              </span>
            </div>
            <div className="h-px w-8 bg-cyan-500/50" />
          </div>

          <h2 className="font-cinematic text-5xl md:text-7xl text-white tracking-widest leading-none">
            PREGUNTAS <span className="text-cyan-400">FRECUENTES</span>
          </h2>
          <p className="mx-auto max-w-xl font-tech text-xs uppercase tracking-widest text-slate-400">
            Respuestas claras sobre tu próxima compra.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <details
              key={index}
              className="group overflow-hidden rounded-4xl border border-white/5 bg-slate-900/30 backdrop-blur-3xl transition-all duration-500 hover:border-cyan-500/20 hover:bg-slate-900/50 open:border-cyan-500/40 open:bg-slate-900/60"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-8 text-base md:text-lg font-bold text-white transition-colors select-none">
                <span className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-cyan-500/20 group-open:bg-cyan-400 transition-colors shadow-[0_0_8px_transparent] group-open:shadow-[0_0_8px_#22d3ee]" />
                  {item.question}
                </span>
                <span className="transform group-open:rotate-180 transition-transform duration-500 text-cyan-500">
                  <ChevronDown />
                </span>
              </summary>
              <div className="border-t border-white/5 px-8 pb-8 pt-4 text-sm md:text-base leading-relaxed text-slate-400">
                {item.answer}
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-cyan-400">
                    <ShieldCheck size={10} /> Verificado
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500">
                    <Activity size={10} /> Soporte Activo
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
