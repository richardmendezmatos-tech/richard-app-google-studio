
import React from 'react';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

const TrustBar: React.FC = () => {
    return (
        <section className="py-8 md:py-10">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                <TrustItem
                    icon={<ShieldCheck size={24} />}
                    title="Certificación 150 Puntos"
                    desc="Cada auto pasa una inspección rigurosa antes de ser listado."
                    color="steel"
                />
                <TrustItem
                    icon={<Zap size={24} />}
                    title="Love Your Car Guarantee"
                    desc="Pruébalo por 24 horas. Si no te enamora, devuélvelo."
                    color="cyan"
                />
                <TrustItem
                    icon={<Globe size={24} />}
                    title="Entrega o Recogido"
                    desc="Tú eliges: te lo llevamos a casa o vienes a nuestro centro."
                    color="emerald"
                />
            </div>
        </section>
    );
};

const TrustItem = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: 'steel' | 'cyan' | 'emerald' }) => {
    const colorClasses = {
        steel: 'bg-slate-200/20 text-slate-200 border border-white/10',
        cyan: 'bg-cyan-500/20 text-[#4fe4ff] border border-cyan-200/30',
        emerald: 'bg-emerald-500/15 text-emerald-200 border border-emerald-200/30'
    };

    return (
        <div className="group flex cursor-default items-start gap-4 rounded-3xl border border-white/10 bg-[linear-gradient(155deg,rgba(12,26,39,0.75),rgba(7,16,28,0.8))] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/30">
            <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-tech text-xs uppercase tracking-[0.16em] text-white">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{desc}</p>
            </div>
        </div>
    );
};

export default TrustBar;
