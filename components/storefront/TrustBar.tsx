
import React from 'react';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

const TrustBar: React.FC = () => {
    return (
        <section className="py-12 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <TrustItem
                    icon={<ShieldCheck size={24} />}
                    title="Certificación 150 Puntos"
                    desc="Cada auto pasa una inspección rigurosa antes de ser listado."
                    color="blue"
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
                    color="purple"
                />
            </div>
        </section>
    );
};

const TrustItem = ({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: 'blue' | 'cyan' | 'purple' }) => {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-500',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/20 text-[#00aed9]',
        purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-500'
    };

    return (
        <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-default">
            <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
};

export default TrustBar;
