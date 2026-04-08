'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Cpu,
  Sparkles
} from 'lucide-react';
import { GlassContainer } from '@/shared/ui/containers/GlassContainer';
import { inventoryIngestionService } from '@/features/inventory/services/inventoryIngestionService';
import { Car } from '@/shared/types/types';

export const VisionIntake: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Partial<Car> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    // Simulated progress for "Adaptive Motion" FEEL
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => (prev < 90 ? prev + Math.random() * 10 : prev));
    }, 200);

    try {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      const fileBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const data = await inventoryIngestionService.processInventoryImage(fileBase64);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setTimeout(() => {
        setResult(data);
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Error processing image');
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Nivel 18 */}
      <div className="flex flex-col gap-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-white tracking-tighter flex items-center gap-3"
        >
          <div className="p-2 bg-primary/20 rounded-xl border border-primary/50">
            <Scan className="text-primary w-8 h-8" />
          </div>
          SENTINEL <span className="text-primary/70">VISION INTAKE</span>
        </motion.h1>
        <p className="text-slate-400 font-medium">
          Digitalización Neuro-Acelerada de Unidades para Richard Automotive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Drop Zone */}
        <GlassContainer className="h-[500px] flex items-center justify-center relative group">
          <div 
            {...getRootProps()} 
            className={`w-full h-full flex flex-col items-center justify-center p-10 cursor-pointer transition-all ${
              isDragActive ? 'bg-primary/10 border-primary' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32 rounded-full border-t-2 border-primary border-opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cpu className="text-primary w-12 h-12 animate-pulse" />
                    </div>
                    {/* Holographic Scan Line */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-0.5 bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-20"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-black text-xl mb-1">PROCESANDO ADN...</div>
                    <div className="text-primary font-mono text-sm">{Math.round(scanProgress)}% COMPLETE</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-slate-500 group-hover:text-primary transition-colors" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Arrastra el Window Sticker o Foto</h3>
                  <p className="text-slate-500 max-w-xs">
                    Sentinel extraerá automáticamente VIN, Specs y sugerirá un Perfil Neuro-Cognitivo.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassContainer>

        {/* Results / Stats */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <GlassContainer className="p-6 border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-3 text-emerald-400 mb-6">
                    <CheckCircle2 size={24} />
                    <span className="font-black tracking-widest uppercase text-sm">Extracción Exitosa</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase">Unidad</label>
                      <div className="text-2xl font-black text-white">{result.year} {result.make}</div>
                      <div className="text-lg text-slate-300">{result.model} {result.trim}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase">VIN</label>
                      <div className="text-lg font-mono text-white tracking-widest">{result.vin}</div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Color</label>
                      <span className="text-white font-bold">{result.color || 'N/A'}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Millaje</label>
                      <span className="text-white font-bold">{result.mileage || '0'}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tracción</label>
                    <span className="text-white font-bold">{result.fuelType || 'N/A'}</span>
                  </div>
                  </div>
                </GlassContainer>

                <GlassContainer className="p-6 border-primary/30">
                  <div className="flex items-center gap-3 text-primary mb-4">
                    <Sparkles size={20} />
                    <span className="font-black tracking-widest uppercase text-sm">IA Strategy</span>
                  </div>
                  <p className="text-slate-300 text-sm italic">
                    "{result.description}"
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(result.features || []).slice(0, 4).map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary border border-primary/20">
                        {f}
                      </span>
                    ))}
                  </div>
                </GlassContainer>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassContainer className="p-10 border-red-500/30 bg-red-500/5 text-center">
                  <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-bold text-white mb-2">Error de Análisis</h3>
                  <p className="text-slate-400">{error}</p>
                </GlassContainer>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col justify-center"
              >
                <GlassContainer className="p-10 border-primary/10 bg-primary/5">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <FileText className="text-primary" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">Auto-Generación Automática</h4>
                        <p className="text-xs text-slate-500">Carga el sticker y Sentinel completará el inventario por ti.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-primary/20" />
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-primary/20" />
                      </div>
                    </div>
                  </div>
                </GlassContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
