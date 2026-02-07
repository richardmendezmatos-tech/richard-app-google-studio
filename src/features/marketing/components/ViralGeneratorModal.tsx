import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wand2, Download, Video, Music, Mic } from 'lucide-react';
import { Car } from '@/types/types';

interface VideoScript {
    hook: string;
    body: string;
    cta: string;
}

interface ViralGeneratorModalProps {
    car: Car;
    isOpen: boolean;
    onClose: () => void;
}

const ViralGeneratorModal: React.FC<ViralGeneratorModalProps> = ({ car, isOpen, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [script, setScript] = useState<VideoScript | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulación de llamada al VideoGeneratorService (Functions)
        setTimeout(() => {
            setScript({
                hook: `¡🚨 EXCLUSIVO PUERTO RICO! 🚨`,
                body: `Mira este espectacular ${car.name}. Un sueño hecho realidad con solo ${car.badge || 'pocas'} millas. Elegancia, poder y el mejor trato de Richard Automotive.`,
                cta: `¡Escríbeme al DM ahora! 📲 Aprobación instantánea disponible.`,
            });
            setIsGenerating(false);
        }, 2500);
    };

    if (!isOpen) return null;

    // Render logic components
    const renderContent = () => {
        if (isGenerating) {
            return (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                        <Wand2 className="absolute inset-0 m-auto text-cyan-500 animate-pulse" size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black uppercase tracking-widest mb-1">Analizando Vehículo...</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">Esculpiendo guion de ventas 10x</p>
                    </div>
                </div>
            );
        }

        if (!script) {
            return (
                <div className="text-center py-12 space-y-6">
                    <div className="max-w-md mx-auto">
                        <p className="text-slate-400 text-sm mb-8">Richard Automotive AI transformará las fotos y especificaciones de este auto en un Reel de alto impacto para Instagram y TikTok.</p>
                        <button
                            onClick={handleGenerate}
                            className="w-full h-16 bg-[#00aed9] hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Sparkles size={20} />
                            Crear Video Viral
                        </button>
                    </div>
                </div>
            );
        }

        // Now script is guaranteed to be non-null
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-cyan-400">
                            <Mic size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Script Generado</span>
                        </div>
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-white border-l-2 border-cyan-500 pl-4">{script.hook}</p>
                            <p className="text-xs text-slate-400 leading-relaxed pl-4">{script.body}</p>
                            <p className="text-sm font-black text-cyan-400 pl-4 italic">"{script.cta}"</p>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                            <Music size={12} className="text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Urban Latin Bass</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                            <Video size={12} className="text-slate-500" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Dynamic Smooth Pan</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/10">
                        <Wand2 size={18} /> Regenerar
                    </button>
                    <button className="flex-1 h-14 bg-[#00aed9] hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2">
                        <Download size={18} /> Exportar Vídeo
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#0b1116] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
                >
                    <div className="p-8">
                        <header className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#00aed9]/20 rounded-2xl flex items-center justify-center text-[#00aed9]">
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">AI Viral Generator</h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{car.name}</p>
                                </div>
                            </div>
                            <button onClick={onClose} title="Cerrar modal" className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </header>

                        {renderContent()}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ViralGeneratorModal;
