import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const faqData = [
    {
        question: "¿Puedo comprar un auto 100% en línea sin visitar el concesionario?",
        answer: "Sí, absolutamente. Nuestra plataforma 'Richard Automotive Direct' le permite seleccionar su vehículo, personalizar su financiamiento, valorar su trade-in y firmar documentos digitalmente. Entregamos el auto directamente en la puerta de su casa u oficina."
    },
    {
        question: "¿Cómo funciona la aprobación de crédito en línea?",
        answer: "Es instantánea y segura. Complete nuestro formulario de Pre-Cualificación encriptado (SSL 256-bit). Nuestro sistema AI analiza su perfil con múltiples bancos simultáneamente para ofrecerle los términos reales (APR, mensualidad y pronto) en minutos, sin afectar su puntaje crediticio inicial (Soft Pull)."
    },
    {
        question: "¿Aceptan autos en 'Trade-In' aunque deba dinero?",
        answer: "Sí. Aceptamos su auto actual como parte de pago. Si todavía tiene balance pendiente, nosotros nos encargamos de liquidar el préstamo anterior con su banco. Si el valor de su auto es mayor a la deuda, usamos el excedente a favor de su nueva compra."
    },
    {
        question: "¿Qué garantía tienen los vehículos usados certificados?",
        answer: "Todos nuestros vehículos certificados pasan una inspección multipunto y se entregan con garantía limitada. Los detalles varían según el modelo; te mostramos la cobertura exacta antes de comprar."
    }
];

const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.filter(item => item.question && item.answer).map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
        }
    }))
};

const FAQSection: React.FC = () => {
    return (
        <section className="relative overflow-hidden rounded-[32px] border border-cyan-100/15 bg-[linear-gradient(145deg,rgba(7,18,30,0.95),rgba(4,10,18,0.94))] py-16 sm:rounded-[40px] sm:py-20">
            <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full border border-cyan-200/15" />
            <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full border border-white/10" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* SEO Schema Injection */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />

                <div className="text-center mb-16">
                    <span className="font-tech mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-[#00aed9]/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100">
                        <HelpCircle size={14} /> Soporte al Cliente
                    </span>
                    <h2 className="font-cinematic text-4xl uppercase tracking-[0.08em] text-slate-50 md:text-6xl">
                        Preguntas Frecuentes
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-slate-300">
                        Resolvemos sus dudas sobre el proceso de compra digital más avanzado del mercado.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <details
                            key={index}
                            className="group overflow-hidden rounded-2xl border border-white/10 bg-[#071524]/65 transition-all duration-300 hover:border-[#00aed9]/50 open:border-[#00aed9]/35 open:bg-[#091a2c]"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-lg font-bold text-white transition-colors select-none group-hover:bg-white/5">
                                <span>{item.question}</span>
                                <span className="transform group-open:rotate-180 transition-transform duration-300 text-[#00aed9]">
                                    <ChevronDown />
                                </span>
                            </summary>
                            <div className="border-t border-white/10 px-6 pb-6 pt-2 leading-relaxed text-slate-300">
                                {item.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
