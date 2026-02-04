import React, { useState, useEffect } from 'react';
import { ArrowRight, BrainCircuit, DollarSign } from 'lucide-react';
import OptimizedImage from '@/features/inventory/components/common/OptimizedImage';

interface HeroSectionProps {
    onNeuralMatch: () => void;
    onBrowseInventory: () => void;
    onSellCar: () => void;
}

const PSYCHOLOGY_HEADLINES = [
    { text: "FUTURE READY", sub: "La inteligencia artificial al servicio de tu legado." },
    { text: "PURE STATUS", sub: "No es solo un auto. Es una declaración de poder." },
    { text: "SMART MOVE", sub: "Ingeniería financiera para decisiones inteligentes." }
];

const HeroSection: React.FC<HeroSectionProps> = ({ onNeuralMatch, onBrowseInventory, onSellCar }) => {
    const [headlineIndex, setHeadlineIndex] = useState(0);

    // Rotate headlines every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setHeadlineIndex(prev => (prev + 1) % PSYCHOLOGY_HEADLINES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentHeadline = PSYCHOLOGY_HEADLINES[headlineIndex];

    return (
        <section className="relative h-[95vh] min-h-[800px] w-full flex items-center justify-center overflow-hidden rounded-b-[4rem] lg:rounded-b-[6rem] shadow-2xl shadow-black/80 perspective-1000 group bg-slate-950">

            {/* 1. CINEMATIC VIDEO BACKGROUND (Simulated with CSS & Layers) */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Fallback Image / Poster */}
                <div className="absolute inset-0 transition-transform duration-[30s] ease-linear scale-110 group-hover:scale-125">
                    {/* Using a high-end dark car texture/image as base */}
                    <OptimizedImage
                        src="/hero.jpg"
                        alt="Cinematic Background"
                        className="w-full h-full object-cover opacity-40 blur-sm scale-110"
                        priority
                    />
                </div>

                {/* Digital overlay grid - Tron Style */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,174,217,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,174,217,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [perspective:1000px] [transform-style:preserve-3d] opacity-30"></div>

                {/* Animated Spotlights */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#00aed9]/10 via-transparent to-slate-950 mix-blend-overlay"></div>
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_60%)] animate-spin-slow duration-[60s]"></div>
            </div>

            {/* 2. MAIN CONTENT LAYER */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center space-y-12 pt-20">

                {/* Floating "Live" Badge */}
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full animate-in slide-in-from-top-10 duration-1000">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
                        Wolf AI System: <span className="text-[#00aed9]">Online</span>
                    </span>
                </div>

                {/* TITANIC DYNAMIC HEADLINE */}
                <div className="relative min-h-[200px] flex flex-col items-center justify-center">
                    <h1 key={currentHeadline.text} className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white tracking-tighter leading-[0.85] animate-in zoom-in-90 duration-700 fade-in drop-shadow-[0_0_50px_rgba(0,174,217,0.3)]">
                        {currentHeadline.text.split(' ')[0]} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] via-white to-[#00aed9] bg-[length:200%_auto] animate-gradient-x">
                            {currentHeadline.text.split(' ')[1]}
                        </span>
                        <span className="text-[#00aed9]">.</span>
                    </h1>

                    {/* Dynamic Subheadline */}
                    <p key={currentHeadline.sub} className="text-lg md:text-2xl text-slate-300 max-w-2xl font-light mt-8 animate-in slide-in-from-bottom-4 duration-700 fade-in leading-relaxed">
                        {currentHeadline.sub}
                    </p>
                </div>

                {/* ACTION OBELISK (The new Control Deck) */}
                <div className="w-full max-w-5xl mt-12 animate-in slide-in-from-bottom-20 duration-1000 delay-300">
                    <div className="relative bg-gradient-to-b from-white/10 to-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-3 shadow-2xl flex flex-col md:flex-row items-center gap-3 group/deck hover:border-white/20 transition-all">

                        {/* Primary Button */}
                        <button
                            onClick={onBrowseInventory}
                            className="relative flex-1 h-[80px] w-full bg-[#00aed9] hover:bg-[#009ac0] text-white rounded-[2.5rem] flex items-center justify-between px-8 transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(0,174,217,0.3)] group/btn overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                            <div className="flex flex-col items-start gap-1 relative z-10">
                                <span className="text-[10px] uppercase font-black tracking-widest opacity-80">Explorar Showroom</span>
                                <span className="text-xl font-black italic tracking-tighter">VER INVENTARIO</span>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover/btn:rotate-45 transition-transform backdrop-blur-sm">
                                <ArrowRight size={24} className="text-white" />
                            </div>
                        </button>

                        {/* Secondary Button: AI Match */}
                        <button
                            onClick={onNeuralMatch}
                            className="relative flex-1 h-[80px] w-full bg-slate-900/60 hover:bg-slate-800 text-white rounded-[2.5rem] flex items-center justify-between px-8 transition-all hover:scale-[1.02] border border-white/5 group/ai"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#00aed9]">Richard AI</span>
                                <span className="text-xl font-bold tracking-tight">NEURAL MATCH</span>
                            </div>
                            <BrainCircuit size={28} className="text-[#00aed9] group-hover/ai:animate-pulse" />
                        </button>

                        {/* Secondary Button: Sell */}
                        <button
                            onClick={onSellCar}
                            className="relative flex-1 h-[80px] w-full bg-emerald-900/20 hover:bg-emerald-900/40 text-white rounded-[2.5rem] flex items-center justify-between px-8 transition-all hover:scale-[1.02] border border-emerald-500/20 group/sell"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">¿Vendes tu auto?</span>
                                <span className="text-xl font-bold tracking-tight">OFERTA CASH</span>
                            </div>
                            <DollarSign size={28} className="text-emerald-500 group-hover/sell:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Cinematic Footer Stripes */}
            <div className="absolute bottom-0 left-0 w-full h-[200px] bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute bottom-8 w-full text-center animate-bounce duration-[2000ms]">
                <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 italic">Explore Richard Automotive Experience</span>
            </div>

        </section>
    );
};

export default HeroSection;
