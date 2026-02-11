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
        <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6">
                {/* SEO Schema Injection */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
                />

                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00aed9]/10 text-[#00aed9] font-bold text-xs uppercase tracking-widest mb-4">
                        <HelpCircle size={14} /> Soporte al Cliente
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                        Preguntas Frecuentes
                    </h2>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                        Resolvemos sus dudas sobre el proceso de compra digital más avanzado del mercado.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <details
                            key={index}
                            className="group bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-[#00aed9] open:border-[#00aed9]/30 transition-all duration-300 overflow-hidden"
                        >
                            <summary className="flex justify-between items-center p-6 cursor-pointer list-none text-slate-800 dark:text-white font-bold text-lg select-none group-hover:bg-white dark:group-hover:bg-slate-700/50 transition-colors">
                                <span>{item.question}</span>
                                <span className="transform group-open:rotate-180 transition-transform duration-300 text-[#00aed9]">
                                    <ChevronDown />
                                </span>
                            </summary>
                            <div className="px-6 pb-6 pt-2 text-slate-500 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
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
