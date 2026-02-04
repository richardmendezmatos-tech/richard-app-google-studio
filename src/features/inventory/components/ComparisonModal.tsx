
import React, { useState } from 'react';
import { Car } from '@/types/types';
import { compareCars } from '@/services/geminiService';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';

import { X, Trophy, Zap } from 'lucide-react';

interface Props {
    cars: Car[];
    onClose: () => void;
}

const ComparisonModal: React.FC<Props> = ({ cars, onClose }) => {
    const [result, setResult] = useState<any>(null); // Ideally this would be typed, but keeping it simple for now
    const [loading, setLoading] = useState(false);
    const analytics = useInventoryAnalytics();


    // Ensure we have exactly 2 cars
    const car1 = cars[0];
    const car2 = cars[1];

    const handleBattle = async () => {
        setLoading(true);
        try {
            analytics.trackCompare(car1.id, car2.id);
            const data = await compareCars(car1, car2);
            setResult(data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!car1 || !car2) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#0d2232] flex items-center justify-center animate-in fade-in duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-900/20 to-transparent transform -skew-x-12 -translate-x-20"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/20 to-transparent transform -skew-x-12 translate-x-20"></div>
            </div>

            <button onClick={onClose} title="Cerrar Arena" className="absolute top-6 right-6 z-50 text-slate-500 hover:text-white transition-colors">
                <X size={32} />
            </button>

            <div className="w-full h-full max-w-[1800px] flex flex-col relative z-10 p-4 lg:p-8">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                        Richard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00aed9] to-purple-500">VS</span> Arena
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-2">Simulación Comparativa IA</p>
                </div>

                {/* Main Arena */}
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0 relative">

                    {/* Car 1 (Left) */}
                    <div className={`flex-1 w-full h-full flex flex-col items-center justify-center transition-all duration-700 ${result?.winnerId === car1.id ? 'scale-105' : result && result.winnerId !== car1.id ? 'scale-95 opacity-50 grayscale-[0.5]' : ''}`}>
                        <div className="relative w-full max-w-lg aspect-[4/3]">
                            <img src={car1.img} alt={car1.name} className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]" />
                            {result?.winnerId === car1.id && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                    <Trophy size={48} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                                </div>
                            )}
                        </div>
                        <div className="mt-6 text-center">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{car1.name}</h3>
                            <p className="text-2xl font-bold text-blue-400">${car1.price.toLocaleString()}</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300 uppercase">{car1.type}</span>
                                {car1.badge && <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold text-white uppercase">{car1.badge}</span>}
                            </div>
                        </div>
                    </div>

                    {/* VS Center / Controls */}
                    <div className="w-24 lg:w-96 flex flex-col items-center justify-center z-20 shrink-0">
                        {!result && !loading && (
                            <button
                                onClick={handleBattle}
                                className="group relative w-24 h-24 lg:w-32 lg:h-32 bg-slate-900 border-4 border-[#00aed9] rounded-full flex items-center justify-center hover:scale-110 hover:shadow-[0_0_50px_rgba(0,174,217,0.6)] transition-all cursor-pointer"
                            >
                                <span className="text-4xl lg:text-5xl font-black text-white italic group-hover:animate-pulse">VS</span>
                                <div className="absolute inset-0 rounded-full border-t-4 border-[#00aed9] animate-spin [animation-duration:3s]"></div>
                            </button>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-24 h-24 border-4 border-slate-700 border-t-[#00aed9] rounded-full animate-spin"></div>
                                <p className="text-[#00aed9] font-bold text-xs uppercase tracking-widest animate-pulse">Simulando...</p>
                            </div>
                        )}

                        {result && (
                            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                                <div className="px-6 py-2 bg-[#00aed9] rounded-full shadow-lg shadow-cyan-500/50">
                                    <span className="text-white font-black uppercase tracking-widest text-sm">Análisis Completo</span>
                                </div>
                                <button onClick={() => setResult(null)} className="text-slate-500 hover:text-white text-xs font-bold underline">Reiniciar Batalla</button>
                            </div>
                        )}
                    </div>

                    {/* Car 2 (Right) */}
                    <div className={`flex-1 w-full h-full flex flex-col items-center justify-center transition-all duration-700 ${result?.winnerId === car2.id ? 'scale-105' : result && result.winnerId !== car2.id ? 'scale-95 opacity-50 grayscale-[0.5]' : ''}`}>
                        <div className="relative w-full max-w-lg aspect-[4/3]">
                            <img src={car2.img} alt={car2.name} className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(239,68,68,0.3)] transform -scale-x-100" />
                            {result?.winnerId === car2.id && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                                    <Trophy size={48} className="text-yellow-400 drop-shadow-lg" fill="currentColor" />
                                </div>
                            )}
                        </div>
                        <div className="mt-6 text-center">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">{car2.name}</h3>
                            <p className="text-2xl font-bold text-red-400">${car2.price.toLocaleString()}</p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-300 uppercase">{car2.type}</span>
                                {car2.badge && <span className="px-3 py-1 bg-red-600 rounded-full text-xs font-bold text-white uppercase">{car2.badge}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="mt-12 max-w-5xl mx-auto w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-[40px] border border-slate-700 p-8 lg:p-10">

                            {/* Final Verdict */}
                            <div className="text-center mb-10">
                                <h4 className="text-[#00aed9] font-black uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
                                    <Zap size={18} /> Veredicto de Richard IA
                                </h4>
                                <p className="text-2xl lg:text-3xl font-medium text-white leading-tight max-w-3xl mx-auto">
                                    "{result.verdict}"
                                </p>
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {result.categories.map((cat: { winnerId: string; name: string; reason: string }, idx: number) => {
                                    const winnerName = cat.winnerId === car1.id ? car1.name : cat.winnerId === car2.id ? car2.name : "Empate";
                                    const winnerColor = cat.winnerId === car1.id ? "text-blue-400" : cat.winnerId === car2.id ? "text-red-400" : "text-yellow-400";
                                    const borderColor = cat.winnerId === car1.id ? "border-blue-500/30 bg-blue-500/5" : cat.winnerId === car2.id ? "border-red-500/30 bg-red-500/5" : "border-yellow-500/30 bg-yellow-500/5";

                                    return (
                                        <div key={idx} className={`p-6 rounded-3xl border ${borderColor} flex flex-col items-center text-center transition-all hover:scale-105`}>
                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">{cat.name}</span>
                                            <div className={`text-lg font-black ${winnerColor} mb-2`}>{winnerName}</div>
                                            <p className="text-slate-300 text-sm leading-snug">"{cat.reason}"</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparisonModal;
