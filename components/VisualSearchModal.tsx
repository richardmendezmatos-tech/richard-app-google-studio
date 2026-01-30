import React, { useCallback, useRef, useState } from 'react';
import { X, UploadCloud, Camera, AlertCircle, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car } from '../types';
import { VisualSearchResult } from '../services/aiService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAnalyze: (file: File) => Promise<{ analysis: VisualSearchResult, matches: Car[] } | null>;
    isAnalyzing: boolean;
    error: string | null;
}

const VisualSearchModal: React.FC<Props> = ({ isOpen, onClose, onAnalyze, isAnalyzing, error }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            alert("Por favor sube una imagen válida.");
            return;
        }

        const url = URL.createObjectURL(file);
        setPreview(url);
        onAnalyze(file);
    }, [onAnalyze]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            handleFile(file);
        }
    }, [handleFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const reset = () => {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0d2232]/90 backdrop-blur-xl"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-700"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-8 pb-4">
                        <button
                            onClick={onClose}
                            aria-label="Cerrar Modal"
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                            <Camera className="text-[#00aed9]" size={32} />
                            Neural Match
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                            Nuestra IA analiza tu foto y encuentra vehículos similares en inventario.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 pt-2">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <div
                            className={`
                                relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                                ${dragActive
                                    ? 'border-[#00aed9] bg-[#00aed9]/5'
                                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-[#00aed9]/50'
                                }
                            `}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {isAnalyzing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 z-20 backdrop-blur-sm">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#00aed9]/20 rounded-full animate-ping"></div>
                                        <div className="relative w-16 h-16 bg-[#00aed9]/10 rounded-full flex items-center justify-center border border-[#00aed9]">
                                            <ScanLine size={32} className="text-[#00aed9] animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="mt-6 text-sm font-black uppercase tracking-widest text-[#00aed9]">Analizando Vectores...</p>
                                    <p className="text-xs text-slate-400 mt-2 font-mono">Generando embeddings...</p>
                                </div>
                            ) : preview ? (
                                <div className="relative w-full h-full group">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 invisible group-hover:visible flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                        <button
                                            onClick={reset}
                                            className="px-6 py-3 bg-white text-slate-900 rounded-full font-bold uppercase tracking-wide hover:scale-105 transition-transform"
                                        >
                                            Cambiar Foto
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                    <div className="p-4 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <UploadCloud className="w-8 h-8 text-slate-500 dark:text-slate-300" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-wide">
                                        Arrastra una foto aquí
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">o haz click para buscar</p>
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Tips */}
                        {!preview && !isAnalyzing && (
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wide border border-slate-200 dark:border-slate-700">📸 Foto de la calle</span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wide border border-slate-200 dark:border-slate-700">🖼️ Screenshot</span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wide border border-slate-200 dark:border-slate-700">🏎️ Poster</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VisualSearchModal;
