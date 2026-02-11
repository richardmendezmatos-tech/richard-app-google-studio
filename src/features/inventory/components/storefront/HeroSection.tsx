import React, { useEffect, useState } from 'react';
import { ArrowRight, BrainCircuit, DollarSign } from 'lucide-react';
import OptimizedImage from '@/components/common/OptimizedImage';

interface HeroSectionProps {
    onNeuralMatch: () => void;
    onBrowseInventory: () => void;
    onSellCar: () => void;
}

const PSYCHOLOGY_HEADLINES = [
    { text: 'FIND YOUR EDGE', sub: 'Inventario curado con IA para comprar rápido y con ventaja.' },
    { text: 'DRIVE WITH SIGNAL', sub: 'Datos, no ruido: precio, estado y financiamiento claro.' },
    { text: 'UPGRADE INTELLIGENTLY', sub: 'Trade-in y oferta cash con experiencia premium de principio a fin.' }
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
    const [mainWord, accentWord] = currentHeadline.text.split(' ');

    return (
        <section className="relative min-h-[84vh] w-full overflow-hidden rounded-b-[3rem] lg:rounded-b-[4rem] bg-[#050d15] border-b border-cyan-400/20">
            <div className="absolute inset-0">
                <OptimizedImage
                    src="/hyundai-kona-hero.avif"
                    alt="Cinematic Background"
                    className="h-full w-full object-cover opacity-25 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(49,210,255,0.32),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(20,39,59,0.6),transparent_42%),linear-gradient(180deg,rgba(4,12,20,0.2),rgba(4,12,20,0.92))]" />
                <div className="absolute inset-0 bg-noise" />
                <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#050d15] to-transparent" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-20 pt-24 text-center lg:px-12">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-black/35 px-5 py-2 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100/90">
                        Live Inventory Intelligence
                    </span>
                </div>

                <h1
                    key={currentHeadline.text}
                    className="font-cinematic animate-in fade-in zoom-in text-[4.2rem] leading-[0.82] text-white sm:text-[5.8rem] md:text-[7.2rem]"
                >
                    {mainWord}
                    <br />
                    <span className="bg-gradient-to-r from-cyan-200 via-[#31d2ff] to-cyan-300 bg-[length:220%_220%] bg-clip-text text-transparent animate-gradient-x">
                        {accentWord}
                    </span>
                    <span className="text-[#31d2ff]">.</span>
                </h1>

                <p
                    key={currentHeadline.sub}
                    className="animate-in fade-in mt-6 max-w-3xl text-base font-medium leading-relaxed text-slate-200/90 sm:text-lg md:text-2xl"
                >
                    {currentHeadline.sub}
                </p>

                <div className="mt-12 w-full max-w-5xl rounded-[2.2rem] border border-white/10 bg-white/[0.04] p-2 backdrop-blur-2xl shadow-[0_30px_80px_-45px_rgba(0,174,217,0.55)]">
                    <div className="grid gap-2 md:grid-cols-3">
                        <button
                            onClick={onBrowseInventory}
                            className="btn-glow flex h-20 items-center justify-between rounded-[1.8rem] bg-[#00aed9] px-7 text-white transition-colors hover:bg-[#0098bc]"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-100">Showroom</p>
                                <p className="text-lg font-extrabold uppercase tracking-wide">Ver Inventario</p>
                            </div>
                            <div className="rounded-full bg-white/20 p-3">
                                <ArrowRight size={20} />
                            </div>
                        </button>

                        <button
                            onClick={onNeuralMatch}
                            className="btn-glow flex h-20 items-center justify-between rounded-[1.8rem] border border-cyan-300/20 bg-[#0b1b2a] px-7 text-white hover:bg-[#10263a]"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">Richard AI</p>
                                <p className="text-lg font-bold uppercase tracking-wide">Neural Match</p>
                            </div>
                            <BrainCircuit size={24} className="text-cyan-300" />
                        </button>

                        <button
                            onClick={onSellCar}
                            className="btn-glow flex h-20 items-center justify-between rounded-[1.8rem] border border-emerald-300/20 bg-emerald-900/20 px-7 text-white hover:bg-emerald-800/30"
                        >
                            <div className="text-left">
                                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">Trade-in</p>
                                <p className="text-lg font-bold uppercase tracking-wide">Oferta Cash</p>
                            </div>
                            <DollarSign size={24} className="text-emerald-300" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
