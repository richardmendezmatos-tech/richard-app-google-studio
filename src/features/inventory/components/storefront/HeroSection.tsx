import React, { useEffect, useState } from 'react';
import { ArrowRight, BrainCircuit, Compass, DollarSign, Sparkles } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';

interface HeroSectionProps {
    onNeuralMatch: () => void;
    onBrowseInventory: () => void;
    onSellCar: () => void;
}

const PSYCHOLOGY_HEADLINES = [
    { preface: 'Coleccion Curada', title: 'INTUICION DE MAQUINA', sub: 'Un showroom editorial donde IA, diseño y data convierten la búsqueda en decisión clara.' },
    { preface: 'Inventario Vivo', title: 'SEÑAL SOBRE RUIDO', sub: 'Precio, estado y contexto en una lectura rápida para comprar con ventaja real.' },
    { preface: 'Trade-In Elite', title: 'MEJORA CON VENTAJA', sub: 'Valora, compara y cierra sin fricción en una experiencia premium de principio a fin.' }
];

const HeroSection: React.FC<HeroSectionProps> = ({ onNeuralMatch, onBrowseInventory, onSellCar }) => {
    const [headlineIndex, setHeadlineIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setHeadlineIndex((prev) => (prev + 1) % PSYCHOLOGY_HEADLINES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const currentHeadline = PSYCHOLOGY_HEADLINES[headlineIndex];

    return (
        <section className="relative min-h-[84vh] w-full overflow-hidden border-b border-cyan-200/20 bg-[#04070d] lg:min-h-[88vh]">
            <div className="absolute inset-0">
                <OptimizedImage
                    src="/hyundai-kona-hero.avif"
                    alt="Richard Automotive Hero"
                    className="h-full w-full object-cover opacity-35 scale-110"
                    priority
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_16%,rgba(241,241,241,0.28),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(2,172,210,0.34),transparent_42%),linear-gradient(180deg,rgba(2,7,14,0.2),rgba(2,7,14,0.95)_74%)]" />
                <div className="absolute inset-0 bg-noise" />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#04070d] to-transparent" />
                <div className="absolute -left-24 top-8 h-48 w-48 rounded-full border border-white/20" />
                <div className="absolute -right-10 bottom-16 h-56 w-56 rounded-full border border-cyan-200/20" />
            </div>

            <div className="relative z-10 mx-auto grid w-full max-w-[1380px] gap-8 px-5 pb-14 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-10 lg:px-12 lg:pb-20 lg:pt-24">
                <div className="max-w-4xl">
                    <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/30 px-5 py-2 backdrop-blur-xl">
                        <Sparkles size={14} className="text-cyan-200" />
                        <span className="font-tech text-[10px] uppercase tracking-[0.28em] text-slate-100">
                            COMMAND CENTER SHOWROOM
                        </span>
                    </div>

                    <p
                        key={currentHeadline.preface}
                        className="font-tech reveal-up mb-5 text-[11px] uppercase tracking-[0.36em] text-cyan-100/90"
                    >
                        {currentHeadline.preface}
                    </p>

                    <h1
                        key={currentHeadline.title}
                        className="font-editorial reveal-up text-[2.4rem] leading-[0.9] text-white sm:text-[3.5rem] md:text-[5.5rem] lg:text-[6.4rem]"
                    >
                        {currentHeadline.title}
                    </h1>

                    <p
                        key={currentHeadline.sub}
                        className="reveal-up mt-8 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-xl"
                    >
                        {currentHeadline.sub}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-300 sm:mt-10 sm:gap-3 sm:text-xs">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2">
                            <Compass size={14} className="text-cyan-200" />
                            Puerto Rico
                        </span>
                        <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Certified Inventory</span>
                        <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2">Financing Intelligence</span>
                    </div>
                </div>

                <div className="reveal-up w-full rounded-[1.8rem] border border-white/15 bg-[linear-gradient(150deg,rgba(8,17,28,0.88),rgba(4,9,16,0.82))] p-2.5 shadow-[0_45px_95px_-55px_rgba(0,172,210,0.85)] backdrop-blur-2xl sm:rounded-[2.2rem] sm:p-3">
                    <div className="grid gap-3 md:grid-cols-3">
                        <button
                            onClick={onBrowseInventory}
                            className="btn-glow flex h-[4.6rem] items-center justify-between rounded-[1.2rem] bg-[linear-gradient(130deg,#00c2ea,#008cb0)] px-5 text-white transition-all hover:scale-[1.01] sm:h-24 sm:rounded-[1.8rem] sm:px-6"
                        >
                            <div className="text-left">
                                <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-cyan-100">Showroom</p>
                                <p className="font-cinematic text-xl leading-none tracking-[0.06em] sm:text-2xl">Inventario</p>
                            </div>
                            <div className="rounded-full bg-white/20 p-3">
                                <ArrowRight size={20} />
                            </div>
                        </button>

                        <button
                            onClick={onNeuralMatch}
                            className="btn-glow flex h-[4.6rem] items-center justify-between rounded-[1.2rem] border border-cyan-200/25 bg-[#0c1f32]/95 px-5 text-white hover:bg-[#13304a] sm:h-24 sm:rounded-[1.8rem] sm:px-6"
                        >
                            <div className="text-left">
                                <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-cyan-300">Richard AI</p>
                                <p className="font-cinematic text-xl leading-none tracking-[0.06em] sm:text-2xl">Neural Match</p>
                            </div>
                            <BrainCircuit size={24} className="text-cyan-200" />
                        </button>

                        <button
                            onClick={onSellCar}
                            className="btn-glow flex h-[4.6rem] items-center justify-between rounded-[1.2rem] border border-emerald-200/25 bg-emerald-950/45 px-5 text-white hover:bg-emerald-900/55 sm:h-24 sm:rounded-[1.8rem] sm:px-6"
                        >
                            <div className="text-left">
                                <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-emerald-300">Trade-in</p>
                                <p className="font-cinematic text-xl leading-none tracking-[0.06em] sm:text-2xl">Oferta Cash</p>
                            </div>
                            <DollarSign size={24} className="text-emerald-200" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
