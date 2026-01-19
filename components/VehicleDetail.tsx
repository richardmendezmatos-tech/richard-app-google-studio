
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Car } from '../types';
import { ChevronLeft, Share2, Calculator, Sparkles, Banknote, Calendar, CreditCard, AlertCircle, ChevronRight, Loader2, ShieldCheck, Zap, Globe, MessageCircle } from 'lucide-react';
import { generateCarPitch } from '../services/geminiService';
import { incrementCarView } from '../services/firebaseService';
import DealBuilder from './deal/DealBuilder';

interface Props {
    inventory: Car[];
}

const VehicleDetail: React.FC<Props> = ({ inventory }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [car, setCar] = useState<Car | null>(null);

    // AI State
    const [aiPitch, setAiPitch] = useState<string>('');
    const [loadingPitch, setLoadingPitch] = useState(false);

    useEffect(() => {
        if (id && inventory.length > 0) {
            const found = inventory.find(c => c.id === id);
            if (found) {
                setCar(found);
                if (found.price) {
                    // Auto-calculations now handled in DealBuilder
                }
                // Track View (Analytics)
                incrementCarView(found.id);
            } else {
                // Verify if inventory is loaded. If loaded and not found, redirect.
                // For now, we wait.
            }
        }
    }, [id, inventory]);


    // Generate AI Pitch on load
    useEffect(() => {
        if (car && !aiPitch) {
            setLoadingPitch(true);
            generateCarPitch(car)
                .then(text => setAiPitch(text))
                .catch(() => setAiPitch("No pudimos conectar con Richard IA en este momento."))
                .finally(() => setLoadingPitch(false));
        }
    }, [car]);

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-10 h-10 text-[#00aed9] animate-spin" />
            </div>
        );
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: car.name,
                    text: `Mira este ${car.name} en Richard Automotive`,
                    url: window.location.href
                });
            } catch (err) { /* Share cancelled */ }
        } else {
            alert('Enlace copiado al portapapeles');
            // fallback copy to clipboard logic here
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-20 lg:pt-0">

            {/* Navigation Bar (Mobile) / Breadcrumb */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 z-40 flex justify-between items-center lg:hidden border-b border-slate-200 dark:border-slate-800">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="text-slate-800 dark:text-white" />
                </button>
                <span className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[200px]">{car.name}</span>
                <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="text-slate-800 dark:text-white" size={20} />
                </button>
            </div>

            {/* Desktop Back Button */}
            <div className="hidden lg:block max-w-7xl mx-auto px-8 py-6">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-[#00aed9] font-bold transition-colors">
                    <ChevronLeft size={20} /> Volver al Inventario
                </button>
            </div>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Media Gallery */}
                <div className="space-y-6">
                    <div className="aspect-[4/3] bg-white dark:bg-slate-900 rounded-[40px] shadow-xl overflow-hidden relative group">
                        {/* Bages */}
                        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                            {car.badge && (
                                <span className="bg-[#00aed9] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    {car.badge}
                                </span>
                            )}
                        </div>

                        <img
                            src={car.img}
                            alt={car.name}
                            className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                        />

                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/20 to-transparent" />
                    </div>

                    {/* AI Insight Card */}
                    <div className="bg-[#00aed9]/5 border border-[#00aed9]/20 rounded-[30px] p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="text-[#00aed9]" />
                            <h3 className="font-black text-[#173d57] dark:text-cyan-400 uppercase tracking-widest text-sm">Richard's AI Insight</h3>
                        </div>
                        {loadingPitch ? (
                            <div className="h-20 flex items-center justify-center text-[#00aed9] animate-pulse font-bold text-sm uppercase tracking-widest">
                                Analizando auto...
                            </div>
                        ) : (
                            <div
                                className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: aiPitch.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00aed9]">$1</strong>').replace(/\n/g, '<br/>') }}
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Details & Finance */}
                <div className="space-y-8">

                    {/* Header */}
                    <div>
                        <span className="text-[#00aed9] font-black uppercase tracking-[0.2em] text-xs">{car.type} • 2025</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mt-2 leading-none">{car.name}</h1>
                        <div className="mt-4 flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">${car.price.toLocaleString()}</span>
                            <span className="text-sm text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full">Precio Online</span>
                        </div>
                    </div>

                    {/* Trust Badges Simple */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <ShieldCheck size={16} className="text-emerald-500" /> Garantía Incluida
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <Zap size={16} className="text-amber-500" /> Entrega Rápida
                        </div>
                    </div>

                    <div className="h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Deal Builder Engine */}
                    <DealBuilder
                        vehicleId={car.id}
                        vehiclePrice={car.price}
                        vehicleName={car.name}
                        vehicleImage={car.img}
                    />

                </div>
            </main>
        </div>
    );
};

export default VehicleDetail;
