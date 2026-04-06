"use client";

import React, { useCallback, useRef, useState } from 'react';
import { X, UploadCloud, Camera, AlertCircle, ScanLine, Sparkles, Binary } from 'lucide-react';
import { Car } from '@/entities/inventory';
import { VisualSearchResult } from '@/shared/api/ai/aiService';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (file: File) => Promise<{ analysis: VisualSearchResult; matches: Car[] } | null>;
  isAnalyzing: boolean;
  error: string | null;
}

const VisualSearchModal: React.FC<Props> = ({ isOpen, onClose, onAnalyze, isAnalyzing, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Por favor sube una imagen válida.');
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
      onAnalyze(file);
    },
    [onAnalyze],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleFile(file);
      }
    },
    [handleFile],
  );

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[40px] border border-white/10 bg-slate-900 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Holographic Underlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-dots opacity-10" />
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 p-10 pb-6">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <Camera className="text-cyan-400" size={24} />
                </div>
                <div>
                    <h2 className="font-tech text-2xl font-black uppercase tracking-[0.1em] text-white">
                    Neural Match <span className="text-cyan-400">v2.1</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[8px] font-black text-cyan-500 uppercase tracking-widest">Active AI Protocol</span>
                    </div>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-400 max-w-md">
                Motor de reconocimiento Richard. Sube una foto de referencia y encontraremos las unidades más cercanas en nuestro inventario.
              </p>
            </div>

            {/* Content */}
            <div className="relative z-10 p-10 pt-0">
              {error && (
                <motion.div 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs font-bold uppercase tracking-wider text-rose-400"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <div
                className={`
                  relative h-80 rounded-[32px] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden
                  ${dragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/10 bg-white/5 hover:border-white/20'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {/* Tactictal Grid Background */}
                <div className="absolute inset-0 bg-grid-dots opacity-5 pointer-events-none" />

                {isAnalyzing ? (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-xl">
                    <motion.div
                      animate={{ 
                        opacity: [0.1, 0.3, 0.1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.1),transparent)]"
                    />
                    
                    {/* The Enhanced Scanner Beam */}
                    <motion.div
                      animate={{ y: [-20, 320] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 top-0 h-4 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0 shadow-[0_0_40px_rgba(34,211,238,0.5)] z-30"
                    >
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-80" />
                    </motion.div>

                    <div className="relative mb-8">
                      <div className="absolute inset-[-20%] animate-ping rounded-full bg-cyan-500/10" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                        <ScanLine size={48} className="animate-pulse" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Binary size={12} className="text-cyan-500 animate-spin-slow" />
                        <p className="font-tech text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">
                            Analyzing Vector Space
                        </p>
                      </div>
                      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/5 border border-white/10">
                        <motion.div
                          animate={{ x: [-192, 192] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="h-full w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : preview ? (
                  <div className="relative h-full w-full group">
                    <img
                      loading="lazy"
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
                      <button
                        onClick={reset}
                        className="rounded-full bg-cyan-500/90 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 transition-all hover:scale-105 hover:bg-cyan-400 active:scale-95 shadow-2xl"
                      >
                        Remover Imagen
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="group flex h-full w-full cursor-pointer flex-col items-center justify-center p-10 text-center transition-all bg-gradient-to-br from-white/[0.02] to-transparent">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 border border-white/10 transition-all group-hover:scale-110 group-hover:border-cyan-400/40 group-hover:bg-cyan-400/5 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                      <UploadCloud className="h-10 w-10 text-slate-500 transition-colors group-hover:text-cyan-400" />
                    </div>
                    <div className="space-y-3">
                      <p className="font-tech text-xs font-black uppercase tracking-[0.3em] text-white">
                        Drop reference photo
                      </p>
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest bg-cyan-500/5 px-4 py-1 rounded-full border border-cyan-500/10">
                        o haz click para explorar archivos
                      </p>
                    </div>
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

              {/* Tactical Reference Context */}
              {!preview && !isAnalyzing && (
                <div className="mt-10 animate-fade-in-up">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="h-[1px] w-12 bg-white/5" />
                    <Sparkles size={14} className="text-cyan-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                      Digital Data Analysis
                    </span>
                    <div className="h-[1px] w-12 bg-white/5" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      { label: "Exterior", icon: "📸" },
                      { label: "Screenshot", icon: "📱" },
                      { label: "Inventory", icon: "🏎️" }
                    ].map((tip, i) => (
                      <span key={i} className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/5 px-5 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-white/10 hover:border-cyan-500/20 active:scale-95 cursor-default">
                        <span className="text-xs transition-transform group-hover:scale-125">{tip.icon}</span> {tip.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VisualSearchModal;
