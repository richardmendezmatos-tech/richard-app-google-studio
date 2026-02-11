
import React from 'react';
import { Heart } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            id: 1,
            name: "Carlos Rodríguez",
            role: "Dueño de Santa Fe 2024",
            comment: "La experiencia con Richard Automotive fue increíble. La IA me ayudó a elegir la SUV perfecta para mi familia y el proceso fue totalmente transparente.",
            rating: 5,
            img: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        {
            id: 2,
            name: "Sofía Méndez",
            role: "Dueña de IONIQ 5",
            comment: "Nunca pensé que comprar un auto eléctrico fuera tan fácil. El 'Neural Match' acertó totalmente con mi estilo de vida. ¡Estoy enamorada de mi IONIQ!",
            rating: 5,
            img: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
            id: 3,
            name: "Miguel Ángel",
            role: "Dueño de Genesis GV80",
            comment: "Atención de primera clase. Me trajeron el auto a la oficina para probarlo y cerramos el trato en menos de una hora. Eficiencia pura.",
            rating: 5,
            img: "https://randomuser.me/api/portraits/men/85.jpg"
        }
    ];

    return (
        <section className="relative overflow-hidden rounded-[32px] border border-cyan-100/15 bg-[linear-gradient(140deg,rgba(6,16,28,0.95),rgba(2,8,14,0.94))] py-16 sm:rounded-[40px] sm:py-20">
            <div className="pointer-events-none absolute right-0 top-0 hidden p-20 opacity-5 md:block">
                <Heart size={300} className="text-[#00aed9]" />
            </div>

            <div className="relative z-10 mb-16 space-y-4 text-center">
                <span className="font-tech text-sm uppercase tracking-[0.24em] text-cyan-200">Nuestros Clientes</span>
                <h2 className="font-cinematic text-5xl uppercase tracking-[0.08em] text-slate-50 md:text-6xl">
                    Historias de <span className="bg-gradient-to-r from-[#00aed9] to-cyan-300 bg-clip-text text-transparent">Éxito</span>
                </h2>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-6 px-4 sm:gap-8 md:grid-cols-3">
                {testimonials.map((t) => (
                    <div key={t.id} className="group rounded-[30px] border border-white/10 bg-[#081a2b]/80 p-8 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-200/30">

                        <div className="flex gap-1 mb-6 text-amber-400">
                            {[...Array(t.rating)].map((_, i) => (
                                <Heart key={i} size={16} fill="currentColor" stroke="none" />
                            ))}
                        </div>

                        <p className="relative z-10 mb-8 leading-relaxed text-slate-300">
                            "{t.comment}"
                        </p>

                        <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                            <OptimizedImage
                                src={t.img}
                                alt={t.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00aed9]/20"
                                width={48}
                            />
                            <div>
                                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                                <p className="font-tech text-xs uppercase tracking-[0.16em] text-[#00aed9]">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
