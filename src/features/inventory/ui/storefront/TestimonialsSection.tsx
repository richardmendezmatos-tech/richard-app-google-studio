"use client";

import React from 'react';
import { Star, ShieldCheck, Quote, BadgeCheck, Zap } from 'lucide-react';
import OptimizedImage from '@/shared/ui/common/OptimizedImage';
import { motion } from 'motion/react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Carlos Rodríguez',
      role: 'DUEÑO DE SANTA FE 2024',
      comment:
        'La experiencia con Richard Automotive fue de otro nivel. El motor de IA Sentinel me ayudó a elegir la SUV perfecta con una precisión absoluta.',
      rating: 5,
      location: 'Bayamón, PR',
      img: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Sofía Méndez',
      role: 'DUEÑA DE IONIQ 5',
      comment:
        "El 'Neural Match' de Richard es increíble. Acertó con mi estilo de vida eléctrico de forma quirúrgica. Proceso 100% digital y sin trucos.",
      rating: 5,
      location: 'San Juan, PR',
      img: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 3,
      name: 'Miguel Ángel',
      role: 'DUEÑO DE GENESIS GV80',
      comment:
        'Plenitud total. Me trajeron el auto a la oficina para el briefing final y cerramos en tiempo récord. Autoridad absoluta en el mercado.',
      rating: 5,
      location: 'Guaynabo, PR',
      img: 'https://randomuser.me/api/portraits/men/85.jpg',
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/5 bg-slate-950 py-24">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse [animation-delay:3s]" />
        <div className="absolute inset-0 mesh-bg-elite opacity-5 pointer-events-none" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mb-20 space-y-6 text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-cyan-500/50" />
            <span className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
              MISSION SATISFIED
            </span>
            <div className="h-px w-8 bg-cyan-500/50" />
          </div>
          <h2 className="font-cinematic text-5xl md:text-7xl text-white tracking-widest leading-none">
            HISTORIAS DE <span className="text-cyan-400">AUTORIDAD</span>
          </h2>
          <p className="font-tech text-xs uppercase tracking-widest text-slate-500">
            Voces de nuestra comunidad de élite en Puerto Rico.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="group relative rounded-[42px] border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-slate-900/70 shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote size={64} className="text-cyan-400" />
              </div>

              <div className="mb-8 flex gap-1 text-cyan-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" stroke="none" className="rotate-3" />
                ))}
              </div>

              <p className="relative z-10 mb-10 text-sm md:text-base font-medium leading-relaxed text-slate-400 group-hover:text-slate-200 transition-colors">
                "{t.comment}"
              </p>

              <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                <div className="relative">
                  <OptimizedImage
                    src={t.img}
                    alt={t.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-1 ring-white/10 p-0.5"
                    width={56}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1 border-2 border-slate-950">
                    <BadgeCheck size={10} className="text-slate-950" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1.5">{t.name}</h4>
                  <p className="font-tech text-[9px] font-black uppercase tracking-widest text-cyan-500">
                    {t.role}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-10 right-10 flex items-center gap-2 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                <Zap size={10} className="text-cyan-400 animate-pulse" />
                <span className="font-tech text-[8px] font-black tracking-widest text-slate-600">{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .mesh-bg-elite {
          background: linear-gradient(-45deg, #00e5ff11, #7000ff11, #ff007005, #00ffaa05);
          background-size: 400% 400%;
          animation: meshGradient 20s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
