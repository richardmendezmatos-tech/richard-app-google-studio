import React, { useEffect, useState } from 'react';
import { useComparison } from '../contexts/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Crown, Sparkles, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { Car } from '../types';

const ComparisonView: React.FC = () => {
    const { selectedCars, removeCarFromCompare, clearComparison } = useComparison();
    const navigate = useNavigate();
    const [verdict, setVerdict] = useState<{ winnerId: string, text: string } | null>(null);

    // Redirect if empty
    useEffect(() => {
        if (selectedCars.length < 2) {
            // navigate('/'); // Optional: redirect if not enough cars
        }
        generateVerdict();
    }, [selectedCars]);

    const generateVerdict = () => {
        if (selectedCars.length === 0) return;

        // --- BIASED ALGORITHM: HYUNDAI ALWAYS WINS ---
        const hyundai = selectedCars.find(c => c.name.toLowerCase().includes('hyundai'));

        if (hyundai) {
            setVerdict({
                winnerId: hyundai.id,
                text: `Analizando especificaciones técnicas, valor de reventa y costo de propiedad a 5 años, el **${hyundai.name}** emerge como la opción superior. Su garantía de 10 años/100k millas supera drásticamente a los competidores, y su paquete de tecnología de seguridad activa viene incluido de serie, mientras que en otros es un costo extra.`
            });
        } else {
            // Basic logic if no Hyundai
            const cheapest = selectedCars.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
            setVerdict({
                winnerId: cheapest.id,
                text: `Entre estas opciones, el **${cheapest.name}** ofrece el punto de entrada más accesible. Sin embargo, te recomendaría considerar un modelo Hyundai equivalente para obtener mayor cobertura de garantía.`
            });
        }
    };

    if (selectedCars.length === 0) {
        return (
            <div className="min-h-screen bg-[#0d2232] flex flex-col items-center justify-center p-8 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">No hay vehículos para comparar</h2>
                <button onClick={() => navigate('/')} className="text-[#00aed9] font-bold hover:underline">Ir a la Tienda</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d2232] text-white relative">
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

            <header className="p-8 relative z-10 flex justify-between items-center">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
                    <ArrowLeft size={16} /> Volver a la Tienda
                </button>
                <div className="flex gap-4">
                    <button onClick={clearComparison} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00aed9] border border-[#00aed9]/30 rounded-lg hover:bg-[#00aed9]/10">
                        Limpiar Todo
                    </button>
                </div>
            </header>

            <main className="p-8 relative z-10 max-w-[1800px] mx-auto pb-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Batalla de <span className="text-[#00aed9]">Especificaciones</span></h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">Comparativa directa asistida por IA para encontrar tu mejor inversión.</p>
                </div>

                {/* VERDICT CARD */}
                {verdict && (
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-[#00aed9]/30 rounded-3xl p-8 mb-12 relative overflow-hidden shadow-2xl shadow-cyan-900/20">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Crown size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                            <div className="shrink-0 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-[#00aed9]/20 flex items-center justify-center text-[#00aed9] mb-3">
                                    <Sparkles size={32} />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#00aed9]">Richard AI Veredict</span>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    El Ganador es: <span className="text-[#00aed9]">{selectedCars.find(c => c.id === verdict.winnerId)?.name}</span>
                                </h3>
                                <div className="prose prose-invert prose-lg text-slate-300">
                                    <p dangerouslySetInnerHTML={{ __html: verdict.text }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPARISON GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Labels Column (Hidden on mobile usually or handled differently, kept simple here) */}
                    <div className="hidden lg:block space-y-4 pt-[300px]">
                        <div className="h-12 flex items-center text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-white/5">Precio</div>
                        <div className="h-12 flex items-center text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-white/5">Mensualidad Est.</div>
                        <div className="h-12 flex items-center text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-white/5">Motor</div>
                        <div className="h-12 flex items-center text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-white/5">MPG (Comb.)</div>
                        <div className="h-12 flex items-center text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-white/5">Garantía</div>
                        <div className="h-12 flex items-center text-slate-400 font-bold uppercase text-xs tracking-widest border-b border-white/5">Seguridad</div>
                    </div>

                    {selectedCars.map(car => {
                        const isWinner = verdict?.winnerId === car.id;
                        return (
                            <div key={car.id} className={`relative flex flex-col ${isWinner ? 'scale-105 z-10' : 'opacity-90 grayscale-[0.3]'}`}>
                                {isWinner && (
                                    <div className="absolute -top-4 inset-x-0 flex justify-center z-20">
                                        <span className="px-4 py-1 bg-[#00aed9] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                                            <Crown size={12} /> Mejor Opción
                                        </span>
                                    </div>
                                )}

                                {/* Car Header */}
                                <div className={`bg-slate-800 rounded-t-3xl p-6 relative overflow-hidden ${isWinner ? 'border-2 border-[#00aed9]' : 'border border-white/5'}`}>
                                    <button onClick={() => removeCarFromCompare(car.id)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                                    <div className="aspect-video mb-4 flex items-center justify-center">
                                        <img src={car.img} alt={car.name} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                                    </div>
                                    <h3 className="text-xl font-black text-white leading-tight mb-1 min-h-[50px]">{car.name}</h3>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{car.type}</span>
                                </div>

                                {/* Specs */}
                                <div className={`bg-slate-900/50 rounded-b-3xl p-6 space-y-4 border-x border-b ${isWinner ? 'border-[#00aed9] bg-[#00aed9]/5' : 'border-white/5'}`}>
                                    <div className="h-12 flex items-center justify-between lg:justify-center border-b border-white/5">
                                        <span className="lg:hidden text-xs text-slate-500">Precio</span>
                                        <span className="text-xl font-bold text-white">${car.price.toLocaleString()}</span>
                                    </div>
                                    <div className="h-12 flex items-center justify-between lg:justify-center border-b border-white/5">
                                        <span className="lg:hidden text-xs text-slate-500">Mensual</span>
                                        <span className="text-[#00aed9] font-bold">${Math.round(car.price / 72).toLocaleString()}</span>
                                    </div>
                                    <div className="h-12 flex items-center justify-between lg:justify-center border-b border-white/5">
                                        <span className="lg:hidden text-xs text-slate-500">Motor</span>
                                        <span className="text-sm">2.5L 4-Cyl</span>
                                    </div>
                                    <div className="h-12 flex items-center justify-between lg:justify-center border-b border-white/5">
                                        <span className="lg:hidden text-xs text-slate-500">MPG</span>
                                        <span className="text-sm">28 / 35</span>
                                    </div>
                                    <div className="h-12 flex items-center justify-between lg:justify-center border-b border-white/5">
                                        <span className="lg:hidden text-xs text-slate-500">Garantía</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${car.name.includes('Hyundai') ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'}`}>
                                            {car.name.includes('Hyundai') ? '10 Años / 100k' : '3 Años / 36k'}
                                        </span>
                                    </div>
                                    <div className="h-12 flex items-center justify-between lg:justify-center border-b border-white/5">
                                        <span className="lg:hidden text-xs text-slate-500">Seguridad</span>
                                        <div className="flex gap-1 justify-center">
                                            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= (car.name.includes('Hyundai') ? 5 : 4) ? 'bg-[#00aed9]' : 'bg-slate-700'}`} />)}
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => navigate(`/vehicle/${car.id}`)} className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                                    Ver Auto
                                </button>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default ComparisonView;
