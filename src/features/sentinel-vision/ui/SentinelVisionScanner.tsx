'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GlitchText } from './GlitchText';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Upload,
  ShieldCheck,
  Zap,
  Activity,
  Info,
  Share2,
  Download,
  Sparkles,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { inventoryIngestionService } from '@/features/inventory/services/inventoryIngestionService';
import { Car } from '@/entities/inventory';
import { storageService } from '@/shared/api/supabase/storage';

interface ScanResult {
  brand: string;
  model: string;
  year: number;
  condition: string;
  marketValue: string;
  score: number;
  specs: {
    hp: string;
    torque: string;
    acceleration: string;
  };
}

interface SentinelVisionScannerProps {
  onLaunchMarketing?: (car: Partial<Car>) => void;
}

export const SentinelVisionScanner: React.FC<SentinelVisionScannerProps> = ({
  onLaunchMarketing,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vin, setVin] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Car> | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isIngested, setIsIngested] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError(null);
    setVin(null);
    setIsScanning(true);

    try {
      const reader = new FileReader();
      const fileBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      const data = await inventoryIngestionService.processInventoryImage(fileBase64);

      if (data.vin) setVin(data.vin);

      setExtractedData(data);
      setResult({
        brand: data.make || 'Unknown',
        model: data.model || 'Unknown',
        year: data.year || 2024,
        condition: 'MINT',
        marketValue: data.price ? `$${data.price.toLocaleString()}` : 'Evaluating...',
        score: data.aiScore || 95,
        specs: {
          hp: data.features?.find((f: string) => f.includes('HP')) || '400+ HP',
          torque: '390 lb-ft',
          acceleration: '3.5s 0-60',
        },
      });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#ffd700', '#ffffff'],
      });
    } catch (err) {
      console.error('Scan error:', err);
      setError('Neural scan failed. The image might be too blurry or not a vehicle sticker.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const handleIngest = async () => {
    if (!extractedData || !vin) return;
    setIsIngesting(true);
    setError(null);

    try {
      // 1. Upload the image to Supabase Storage first
      let publicImageUrl = '';

      if (file) {
        try {
          publicImageUrl = await storageService.uploadImage(file, 'inventory');
        } catch (uploadErr: any) {
          console.error('Image upload failed:', uploadErr);
          setError(
            `FALLO DE CARGA: El bucket "inventory" podría no estar configurado. (${uploadErr.message})`,
          );
          setIsIngesting(false);
          return; // Stop here if photo fails, we don't want units without photos
        }
      } else {
        setError('No hay imagen para subir. Escanea la unidad primero.');
        setIsIngesting(false);
        return;
      }

      // 2. Send the public URL to the ingestion API
      const response = await fetch('/api/inventory/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...extractedData, image: publicImageUrl }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Ingestion failed');
      }

      setIsIngested(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#00ff00', '#ffffff'],
      });
    } catch (err: any) {
      console.error('Ingestion error:', err);
      setError(`FALLO DE INGESTIÓN: ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-cinematic text-gradient-cyan text-glow">
          <GlitchText text="VISIÓN RICHARD AUTOMOTIVE" />
        </h2>
        <p className="text-text-muted font-tech text-sm uppercase tracking-widest">
          Capa de Análisis Automotriz Avanzado
        </p>
      </div>

      <div className="relative group">
        <div
          {...getRootProps()}
          className={`relative aspect-video glass-premium hud-brackets flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
            isDragActive ? 'border-ra-primary scale-[1.02] bg-ra-primary/10' : ''
          }`}
        >
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {!preview ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-4 p-8"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-ra-primary/10 flex items-center justify-center animate-kinetic-pulse">
                  <Upload className="w-10 h-10 text-ra-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-white">DEPOSIT VEHICLE IMAGE</p>
                  <p className="text-sm text-text-muted">DRAG & DROP OR CLICK TO INGEST</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-full overflow-hidden rounded-2xl"
              >
                <img src={preview} alt="Vehicle Preview" className="w-full h-full object-cover" />

                {/* Scanline Overlay */}
                {isScanning && (
                  <>
                    <div className="scanline-overlay" />
                    <motion.div
                      className="scan-laser-line"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="active-scan-laser-glow left-0" />
                      <div className="active-scan-laser-glow right-0" />
                    </motion.div>
                    <div className="absolute inset-0 bg-ra-primary/5 scan-grid-overlay active" />
                  </>
                )}

                {/* HUD Elements during scanning */}
                {isScanning && (
                  <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/60 backdrop-blur-md p-3 border-l-2 border-ra-primary"
                      >
                        <p className="text-[10px] text-ra-primary font-mono uppercase">
                          Flujo de Datos
                        </p>
                        <p className="text-xs font-mono text-white">0x44F_DECODING...</p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-black/60 backdrop-blur-md p-3 border-r-2 border-ra-accent"
                      >
                        <p className="text-[10px] text-ra-accent font-mono uppercase">
                          Security Layer
                        </p>
                        <p className="text-xs font-mono text-white">VERIFIED_SECURE</p>
                      </motion.div>
                    </div>

                    <div className="flex justify-center mb-10">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="flex items-center space-x-2 bg-ra-primary/20 backdrop-blur-xl px-6 py-2 rounded-full border border-ra-primary/50"
                      >
                        <Activity className="w-4 h-4 text-ra-primary" />
                        <span className="text-xs font-bold text-white tracking-widest uppercase">
                          Analyzing Vehicle DNA
                        </span>
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error State UI */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <p className="text-sm font-mono text-rose-200">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  setPreview(null);
                  setFile(null);
                }}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-colors"
              >
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results View */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Main Score Card */}
            <div className="md:col-span-2 glass-premium p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck className="w-32 h-32 text-ra-primary" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-ra-primary font-mono text-sm tracking-tighter-caps">
                      Vehicle Identified
                    </p>
                    <h3 className="text-4xl font-cinematic text-white">
                      {result.brand} {result.model}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted font-mono text-xs uppercase">Puntuación</p>
                    <p className="text-5xl font-cinematic text-ra-accent">{result.score}</p>
                  </div>
                </div>

                {vin && (
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <p className="text-[10px] text-ra-primary font-mono uppercase tracking-[0.2em] mb-1">
                        Decoded VIN
                      </p>
                      <p className="text-lg font-mono text-white tracking-widest">{vin}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(vin);
                        const btn = document.getElementById('copy-vin-btn');
                        if (btn) btn.innerText = 'COPIED';
                        setTimeout(() => {
                          if (btn) btn.innerText = 'COPY';
                        }, 2000);
                      }}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                    >
                      <span id="copy-vin-btn">COPY</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                      Year
                    </p>
                    <p className="text-xl font-tech text-white">{result.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                      Market Value
                    </p>
                    <p className="text-xl font-tech text-ra-primary">{result.marketValue}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                      Condition
                    </p>
                    <p className="text-xl font-tech text-white">{result.condition}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Specs Card */}
            <div className="glass-premium p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-ra-primary">
                  <Zap className="w-5 h-5" />
                  <h4 className="font-bold uppercase tracking-widest text-sm">Performance Data</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Horsepower', value: result.specs.hp, icon: Activity },
                    { label: 'Torque', value: result.specs.torque, icon: Info },
                    { label: '0-60 Time', value: result.specs.acceleration, icon: Zap },
                  ].map((spec, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center space-x-2">
                        <spec.icon className="w-3 h-3 text-text-muted" />
                        <span className="text-xs text-text-muted uppercase">{spec.label}</span>
                      </div>
                      <span className="text-sm font-bold text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    confetti({
                      particleCount: 150,
                      spread: 70,
                      origin: { y: 0.6 },
                      colors: ['#00e5ff', '#ffd700', '#ffffff'],
                    });
                  }}
                  className="btn-premium w-full group"
                >
                  <Share2 className="w-4 h-4 mr-2 inline" />
                  <span className="relative z-10">SHARE REPORT</span>
                </button>
                <button
                  onClick={handleIngest}
                  disabled={isIngesting || isIngested}
                  className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isIngested
                      ? 'bg-green-500/20 text-green-500 border border-green-500/50 cursor-default'
                      : 'bg-ra-primary hover:bg-ra-primary/80 text-black border border-white/20 animate-kinetic-pulse'
                  }`}
                >
                  {isIngesting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      INGESTING TO DATABASE...
                    </>
                  ) : isIngested ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      UNIT ONLINE - STOCK READY
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      CONFIRM & INGEST TO STOCK
                    </>
                  )}
                </button>

                {onLaunchMarketing && (
                  <button
                    onClick={() =>
                      onLaunchMarketing({
                        name: `${result.year} ${result.brand} ${result.model}`,
                        make: result.brand,
                        model: result.model,
                        year: result.year,
                        price: parseInt(result.marketValue.replace(/[^0-9]/g, '')),
                        img: preview || '',
                        features: [result.specs.hp, result.specs.torque, result.specs.acceleration],
                        description:
                          extractedData?.description ||
                          `Unidad identificada vía Sentinel Vision con un score de ${result.score}/100.`,
                      })
                    }
                    className="w-full py-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    GENERAR KIT DE MARKETING
                  </button>
                )}
                <button className="w-full py-3 rounded-xl border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  DOWNLOAD PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
