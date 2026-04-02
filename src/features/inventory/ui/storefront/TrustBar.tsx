import React from 'react';
import { ShieldCheck, Zap, Globe, BadgeCheck } from 'lucide-react';
import { motion } from 'motion/react';

const TrustBar: React.FC = () => {
    return (
        <section className="ra-trust py-10 md:py-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="font-tech text-xs uppercase tracking-[0.3em] text-cyan-400">
                        TRUST PROTOCOL
                    </h2>
                    <p className="mt-1 text-slate-400 text-sm">Blindaje total y respaldo garantizado en cada unidad.</p>
                </div>
                <div className="flex">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-emerald-400 backdrop-blur-md">
                        <BadgeCheck size={14} className="text-emerald-500" />
                        Verified Premium Dealer
                    </span>
                </div>
            </motion.div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                <TrustItem
                    icon={<ShieldCheck size={28} />}
                    title="Protocolo deBlindaje 150"
                    desc="Inspección neurálgica de 150 puntos críticos para garantizar un estado mecánico impecable."
                    color="steel"
                    delay={0.1}
                />
                <TrustItem
                    icon={<Zap size={28} />}
                    title="Garantía Love Your Car"
                    desc="Vive la experiencia por 24 horas. Si no es el auto de tus sueños, lo devolvemos sin trucos."
                    color="cyan"
                    delay={0.2}
                />
                <TrustItem
                    icon={<Globe size={28} />}
                    title="Logística Richard VIP"
                    desc="Tu tiempo es oro. Te entregamos la unidad en la puerta de tu hogar o coordinamos tu recogida."
                    color="emerald"
                    delay={0.3}
                />
            </div>

            <style>{`
                .ra-trust { position: relative; }
                
                .trust-card {
                    position: relative;
                    overflow: hidden;
                    border-radius: 2.5rem;
                    background: linear-gradient(155deg, rgba(15, 25, 40, 0.4), rgba(5, 10, 20, 0.6));
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 2.5rem 2rem;
                    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .trust-card:hover {
                    border-color: rgba(0, 212, 255, 0.3);
                    background: linear-gradient(155deg, rgba(20, 35, 55, 0.5), rgba(10, 20, 35, 0.7));
                    transform: translateY(-8px);
                    box-shadow: 0 30px 60px -20px rgba(0, 180, 220, 0.25);
                }

                .trust-card__glow {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at var(--x) var(--y), rgba(0, 212, 255, 0.1), transparent 60%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                }
                .trust-card:hover .trust-card__glow { opacity: 1; }

                .trust-card__icon-box {
                    position: relative;
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 1.25rem;
                    margin-bottom: 1.5rem;
                    transition: all 0.5s ease;
                }

                .trust-card:hover .trust-card__icon-box {
                    transform: scale(1.1) rotate(5deg);
                }

                .icon--steel { background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.2); }
                .icon--cyan { background: rgba(0, 212, 255, 0.15); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.2); }
                .icon--emerald { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.2); }

                .trust-card:hover .icon--cyan { box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }
                .trust-card:hover .icon--emerald { box-shadow: 0 0 20px rgba(52, 211, 153, 0.4); }
            `}</style>
        </section>
    );
};

const TrustItem = ({
    icon,
    title,
    desc,
    color,
    delay
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: 'steel' | 'cyan' | 'emerald';
    delay: number;
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="trust-card group"
        >
            <div className={`trust-card__icon-box icon--${color}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-tech text-sm uppercase tracking-[0.16em] text-white group-hover:text-cyan-400 transition-colors">
                    {title}
                </h4>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-slate-400 group-hover:text-slate-200 transition-colors">
                    {desc}
                </p>
            </div>
            <div className="trust-card__glow" style={{ "--x": "50%", "--y": "50%" } as any} />
        </motion.div>
    );
};

export default TrustBar;
