import React from 'react';
import { ShieldCheck, Zap, Sparkles, BadgeCheck, Activity } from 'lucide-react';

const TrustBar: React.FC = () => {
  return (
    <section id="trust-protocol" className="relative py-24 overflow-hidden bg-slate-950/20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="container relative mx-auto px-6">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-up">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-cyan-500/50" />
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-cyan-400 animate-pulse" />
                <span className="font-tech text-[10px] uppercase tracking-[0.5em] text-cyan-400">
                  SISTEMA DE CONFIANZA V2
                </span>
              </div>
            </div>
            <h3 className="font-cinematic text-4xl md:text-6xl text-white tracking-tight leading-[0.9]">
              Protección de <span className="text-cyan-400">Alto Nivel.</span> <br />
              <span className="text-slate-400 italic">Garantía Richard Automotive.</span>
            </h3>
          </div>

          <div className="flex group hover:scale-105 transition-transform duration-300">
            <div className="relative overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/5 px-6 py-3 backdrop-blur-3xl transition-all hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                <BadgeCheck size={16} className="text-emerald-500" />
                Concesionario Certificado Richard Automotive
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <TrustItem
            icon={<ShieldCheck size={32} />}
            title="PROTOCOLO 150+"
            desc="Cada unidad es auditada bajo los estándares de Richard para una confiabilidad total."
            color="cyan"
            delay={1}
          />
          <TrustItem
            icon={<Zap size={32} />}
            title="ENTREGA EXPRÉS"
            desc="Manejamos la logística con guante blanco. Entrega en 24h a cualquier punto de la isla con precisión certificada."
            color="primary"
            delay={3}
          />
          <TrustItem
            icon={<Sparkles size={32} />}
            title="GARANTÍA RICHARD"
            desc="72 horas de prueba real. Si no sientes que es el auto de tus sueños, ejecutamos el retorno sin fricciones."
            color="emerald"
            delay={5}
          />
        </div>
      </div>

      <style>{`
        .animate-fade-in-up {
          opacity: 1;
          transform: translateY(0);
        }
        .trust-card {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

interface TrustItemProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'cyan' | 'primary' | 'emerald';
  delay: number;
}

const TrustItem: React.FC<TrustItemProps> = ({ icon, title, desc, color, delay }) => {
  const colors = {
    cyan: 'text-cyan-400 group-hover:text-cyan-300',
    primary: 'text-primary group-hover:text-cyan-200',
    emerald: 'text-emerald-400 group-hover:text-emerald-300',
  };

  return (
    <div
      className="group relative h-full rounded-5xl border border-white/5 bg-slate-900/40 p-10 backdrop-blur-3xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-slate-900/70 shadow-2xl trust-card"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="relative z-10">
        <div
          className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${colors[color]}`}
        >
          {icon}
        </div>

        <h4 className="mb-4 font-tech text-base font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
          {title}
          <div className="h-1 w-1 bg-cyan-500 rounded-full animate-pulse" />
        </h4>

        <p className="text-sm font-medium leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
          {desc}
        </p>

        <div className="mt-8 flex items-center gap-2 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
          <Activity size={10} className="text-cyan-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400">
            Verificado Richard
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;
