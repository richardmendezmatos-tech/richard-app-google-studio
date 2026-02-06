
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
        <section className="py-20 relative">
            <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none md:block hidden">
                <Heart size={300} className="text-[#00aed9]" />
            </div>

            <div className="text-center mb-16 space-y-4 relative z-10">
                <span className="text-[#00aed9] font-black uppercase tracking-widest text-sm">Nuestros Clientes</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                    Historias de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] to-cyan-400">Éxito</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 relative z-10">
                {testimonials.map((t) => (
                    <div key={t.id} className="bg-white dark:bg-slate-800/80 p-8 rounded-[30px] border border-slate-100 dark:border-slate-700 relative hover:transform hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">

                        <div className="flex gap-1 mb-6 text-amber-400">
                            {[...Array(t.rating)].map((_, i) => (
                                <Heart key={i} size={16} fill="currentColor" stroke="none" />
                            ))}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8 relative z-10">
                            "{t.comment}"
                        </p>

                        <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-6">
                            <OptimizedImage
                                src={t.img}
                                alt={t.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00aed9]/20"
                                width={48}
                            />
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{t.name}</h4>
                                <p className="text-xs text-[#00aed9] font-bold uppercase tracking-wide">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TestimonialsSection;
