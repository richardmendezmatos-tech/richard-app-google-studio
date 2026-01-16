
import React from 'react';
import { Sparkles, ArrowRight, BrainCircuit, DollarSign } from 'lucide-react';

interface HeroSectionProps {
    onNeuralMatch: () => void;
    onBrowseInventory: () => void;
    onSellCar: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNeuralMatch, onBrowseInventory, onSellCar }) => {
    return (
        <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden rounded-b-[60px] lg:rounded-b-[100px] shadow-2xl shadow-cyan-900/40">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0 bg-slate-900">
                <img
                    src="https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2940&auto=format&fit=crop"
                    alt="Luxury Car Background"
                    className="w-full h-full object-cover opacity-60 scale-105 animate-in fade-in zoom-in duration-[2s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/60 to-transparent" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center text-center space-y-10">

                {/* Badge */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full animate-in slide-in-from-bottom-5 duration-700 fade-in">
                    <Sparkles size={16} className="text-[#00aed9] fill-[#00aed9]" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">Experiencia Automotriz 2025</span>
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-5 duration-1000 fade-in delay-100">
                    FUTURE <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] to-cyan-200">READY.</span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-slate-300 max-w-2xl font-medium leading-relaxed animate-in slide-in-from-bottom-5 duration-1000 fade-in delay-200">
                    Compra tu próximo auto 100% online. Sin vendedores, sin sorpresas, y con la garantía de Richard Automotive.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 animate-in slide-in-from-bottom-5 duration-1000 fade-in delay-300">

                    <button
                        onClick={onBrowseInventory}
                        className="group relative px-8 py-4 bg-[#00aed9] text-white rounded-full font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,174,217,0.4)]"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Ver Inventario <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>

                    <button
                        onClick={onNeuralMatch}
                        className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3"
                    >
                        <BrainCircuit size={20} className="text-[#00aed9]" />
                        Neural Match
                    </button>

                    <button
                        onClick={onSellCar}
                        className="group px-8 py-4 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 rounded-full font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-3"
                    >
                        <DollarSign size={20} />
                        Vender mi Auto
                    </button>

                </div>
            </div>

            {/* Floating Trust Indicators */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-8 md:gap-16 text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest animate-in fade-in delay-700">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#00aed9] rounded-full" /> 7-Day Money Back</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#00aed9] rounded-full" /> 150-Point Inspection</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#00aed9] rounded-full" /> Home Delivery</span>
            </div>
        </section>
    );
};

export default HeroSection;
