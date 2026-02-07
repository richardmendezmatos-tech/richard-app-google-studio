import React, { useState } from 'react';
import { Camera, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Sparkles, Zap } from 'lucide-react';

interface AppraisalResult {
    make: string;
    model: string;
    year: number;
    condition: string;
    damages: string[];
    confidence: number;
}

const PhotoAppraisal: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AppraisalResult | null>(null);

    const handleUpload = () => {
        setIsAnalyzing(true);
        // Simulate AI Analysis
        setTimeout(() => {
            setResult({
                make: 'Toyota',
                model: 'RAV4',
                year: 2022,
                condition: 'Excelente',
                damages: ['Pequeño rayazo en puerta lateral derecha'],
                confidence: 0.94
            });
            setIsAnalyzing(false);
        }, 3000);
    };

    return (
        <div className="bg-[#131f2a] rounded-[40px] p-8 border border-white/5 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00aed9]/10 blur-[100px] rounded-full group-hover:bg-[#00aed9]/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-[#00aed9]/20 rounded-lg flex items-center justify-center">
                            <Camera className="text-[#00aed9]" size={18} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Avalúo por Foto AI</h3>
                    </div>
                    <p className="text-slate-500 text-xs font-bold leading-relaxed">Sube fotos de tu unidad para una tasación instantánea basada en condición visual real.</p>
                </header>

                {!result && !isAnalyzing && (
                    <div
                        onClick={handleUpload}
                        className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center hover:border-[#00aed9]/40 hover:bg-[#00aed9]/5 transition-all cursor-pointer group/upload"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover/upload:scale-110 group-hover/upload:bg-[#00aed9]/20 transition-all">
                            <ImageIcon className="text-slate-500 group-hover/upload:text-[#00aed9]" size={32} />
                        </div>
                        <p className="text-white font-bold text-sm mb-1 uppercase tracking-widest">Arrastra tus fotos</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">JPG, PNG hasta 10MB</p>
                    </div>
                )}

                {isAnalyzing && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                            <Loader2 className="text-[#00aed9] animate-spin" size={48} />
                            <Sparkles className="absolute -top-2 -right-2 text-amber-500 animate-pulse" size={20} />
                        </div>
                        <p className="text-[#00aed9] font-black text-xs uppercase tracking-[0.3em] animate-pulse">Escaneando Condiciones...</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-[#0b1116] rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest">Vehículo Detectado</span>
                                <div className="flex items-center gap-1 text-green-500">
                                    <CheckCircle2 size={12} />
                                    <span className="text-[10px] font-bold">Confianza {Math.round(result.confidence * 100)}%</span>
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-white mb-1">{result.year} {result.make} {result.model}</h4>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Inscripción / VIN Extracting...</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Condición AI</p>
                                <span className="text-white font-bold">{result.condition}</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Puntos de Daño</p>
                                <span className="text-amber-500 font-bold">{result.damages.length} detectados</span>
                            </div>
                        </div>

                        {result.damages.length > 0 && (
                            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                                <div className="flex items-center gap-2 text-amber-500 mb-2">
                                    <AlertCircle size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Detalle de Hallazgos</span>
                                </div>
                                <ul className="space-y-2">
                                    {result.damages.map((damage, idx) => (
                                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                            {damage}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button className="w-full bg-[#00aed9] hover:bg-cyan-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 group/btn">
                            <Zap size={18} className="fill-white" /> OBTENER OFERTA TRADE-IN <ImageIcon size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoAppraisal;
