import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, ChevronRight, Info, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/seo/SEO';

import { submitApplication } from '@/services/firebaseService';
import { usePhotoUploader } from '@/hooks/usePhotoUploader';
import { analyzeTradeInImages } from '@/services/geminiService';

const AppraisalView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'info' | 'photos' | 'scan' | 'offer'>('info');
    const [vehicleInfo, setVehicleInfo] = useState({
        year: '',
        make: '',
        model: '',
        mileage: '',
        condition: 'good',
        vin: ''
    });

    // Use Custom Hook for Photo Management
    const {
        photos,
        setPhoto,
        uploadAllPhotos,

        count: uploadedCount
    } = usePhotoUploader({
        front: null,
        back: null,
        interior: null,
        dashboard: null
    });

    const [scanning, setScanning] = useState(false);
    const [scanStage, setScanStage] = useState(''); // "Analizando Carrocería...", "Verificando Interior..."
    const [offerReady, setOfferReady] = useState(false);

    // AI Analysis Results
    const [aiAnalysis, setAiAnalysis] = useState<{
        condition: string;
        defects: string[];
        reasoning: string;
    } | null>(null);

    const [offerAmount, setOfferAmount] = useState({ min: 0, max: 0 });
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setVehicleInfo({ ...vehicleInfo, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(key, e.target.files[0]);
        }
    };

    const totalPhotos = 4;
    const progress = (uploadedCount / totalPhotos) * 100;
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (progressRef.current) {
            progressRef.current.style.width = `${progress}%`;
        }
    }, [progress]);

    // Helper: File to Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string); // Includes "data:image..."
            reader.onerror = error => reject(error);
        });
    };

    const startScan = async () => {
        setScanning(true);
        setScanStage('Subiendo fotos...');

        try {
            // 1. Convert Photos to Base64 for AI Analysis (Parallel to upload)
            const photoKeys = ['front', 'back', 'interior', 'dashboard'];
            const files = photoKeys.map(k => photos[k]).filter(f => f !== null) as File[];

            if (files.length < 4) {
                // Fallback if somehow triggered early, though UI prevents it
                throw new Error("Missing photos");
            }

            const base64Promises = files.map(f => fileToBase64(f));
            const base64Images = await Promise.all(base64Promises);
            // Clean base64 strings (remove data:image/jpeg;base64, prefix if prompt requires raw bytes, 
            // but Gemini Node SDK often handles data URI or needs base64 string only. 
            // Our service wrapper handles the 'inlineData' structure, so let's pass the raw base64 string (split).
            const cleanBase64 = base64Images.map(img => img.split(',')[1]);

            // 2. Start Parallel Processes: upload to Firebase & Analyze with AI
            setScanStage('Analizando Carrocería con IA...');

            const uploadTask = uploadAllPhotos(); // Returns URLs
            const aiTask = analyzeTradeInImages(cleanBase64); // Returns Analysis JSON

            // Artificial minimum delay for "Scanner" VFX
            const minDelay = new Promise(resolve => setTimeout(resolve, 3500));

            const [urls, analysis] = await Promise.all([uploadTask, aiTask, minDelay]);

            setUploadedUrls(urls);
            setAiAnalysis(analysis);

            // 3. Calculate Offer based on AI Adjustment
            const baseValue = 15000; // Mock base value for demo
            const adjustedMin = Math.round(baseValue * analysis.estimatedValueAdjustment);
            const adjustedMax = Math.round((baseValue + 2500) * analysis.estimatedValueAdjustment);

            setOfferAmount({ min: adjustedMin, max: adjustedMax });
            setOfferReady(true);

        } catch (error) {
            console.error("Scan/Upload failed", error);
            alert("Hubo un error al procesar las imágenes. Por favor intenta de nuevo.");
        } finally {
            setScanning(false);
        }
    };

    // Render Steps
    const renderStep = () => {
        switch (step) {
            case 'info':
                return (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Detalles del Vehículo</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Año</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={vehicleInfo.year}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                                    placeholder="2018"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Marca</label>
                                <input
                                    type="text"
                                    name="make"
                                    value={vehicleInfo.make}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                                    placeholder="Toyota"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Modelo</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={vehicleInfo.model}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                                    placeholder="Camry SE"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Kilometraje</label>
                                <input
                                    type="number"
                                    name="mileage"
                                    value={vehicleInfo.mileage}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                                    placeholder="45000"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep('photos')}
                            className="w-full py-4 bg-[#00aed9] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            Siguiente Paso <ChevronRight size={18} />
                        </button>
                    </motion.div>
                );

            case 'photos':
                return (
                    <motion.div
                        key="photos"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Fotos del Vehículo</h2>
                            <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${uploadedCount === 4 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                Fotos: {uploadedCount}/4
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div
                            ref={progressRef}
                            className={`h-full transition-all duration-500 ${uploadedCount === 4 ? 'bg-emerald-500' : 'bg-[#00aed9]'}`}
                        ></div>

                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(photos).map((key) => (
                                <label
                                    key={key}
                                    className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${photos[key]
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                        : 'border-slate-300 dark:border-slate-700 hover:border-[#00aed9] hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {photos[key] ? (
                                        <>
                                            <img
                                                src={URL.createObjectURL(photos[key]!)}
                                                alt={`Vista ${key}`}
                                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                                    <CheckCircle className="text-white drop-shadow-md" size={32} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="text-slate-400 mb-2 group-hover:text-[#00aed9] group-hover:scale-110 transition-all" size={24} />
                                            <span className="text-[10px] uppercase font-bold text-slate-400">{key}</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handlePhotoUpload(key, e)}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-blue-600 dark:text-blue-300 text-xs">
                            <Info className="shrink-0" size={16} />
                            <p>Toma fotos claras y bien iluminadas para obtener la mejor oferta posible.</p>
                        </div>

                        <button
                            onClick={() => {
                                if (uploadedCount === 4) setStep('scan');
                            }}
                            disabled={uploadedCount < 4}
                            className="w-full py-4 bg-[#00aed9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {uploadedCount < 4 ? `Faltan Fotos(${uploadedCount}/4)` : 'Analizar Vehículo'}
                            {uploadedCount === 4 && <ChevronRight size={18} />}
                        </button>
                    </motion.div>
                );

            case 'scan':
                return (
                    <motion.div
                        key="scan"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col items-center justify-center py-10 space-y-8"
                    >
                        <div className="relative w-64 h-64">
                            {/* Scanning Ring */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-dashed border-[#00aed9]/30 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-4 border-dashed border-[#00aed9]/50 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Brain / AI Icon Pulsing */}
                                <BrainCircuit className="text-[#00aed9] w-24 h-24 opacity-80 animate-pulse" />
                            </div>

                            {/* Scan Line */}
                            <motion.div
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute left-0 right-0 h-1 bg-[#00aed9] shadow-[0_0_20px_#00aed9]"
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white animate-pulse">
                                {offerReady ? 'Análisis Completado' : scanStage || 'Iniciando Escáner...'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {offerReady ? 'Generando tu oferta final...' : 'Nuestra IA está detectando daños y condiciones.'}
                            </p>
                        </div>

                        {!scanning && !offerReady && (
                            <button onClick={startScan} className="px-8 py-3 bg-[#0d2232] text-white rounded-full font-bold uppercase tracking-widest text-xs animate-in fade-in slide-in-from-bottom-4">
                                Iniciar Escaneo IA
                            </button>
                        )}

                        {offerReady && (
                            <motion.button
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                onClick={() => setStep('offer')}
                                className="px-8 py-4 bg-emerald-500 text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform"
                            >
                                Ver Oferta
                            </motion.button>
                        )}
                    </motion.div>
                );

            case 'offer':
                return (
                    <motion.div
                        key="offer"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="text-center space-y-8 py-6"
                    >
                        <div className="inline-block p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 mb-4">
                            <CheckCircle size={48} />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Oferta Estimada</h2>
                            <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                                ${offerAmount.min.toLocaleString()} - ${offerAmount.max.toLocaleString()}
                            </div>
                        </div>

                        {/* AI Report Card */}
                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-left space-y-4 shadow-inner border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="text-amber-400" size={20} fill="currentColor" />
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Reporte de Inspección IA</h3>
                            </div>

                            {aiAnalysis && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Condición Detectada:</span>
                                        <span className="font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase text-xs">{aiAnalysis.condition}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block mb-1">Observaciones:</span>
                                        <p className="text-slate-700 dark:text-slate-300 italic">"{aiAnalysis.reasoning}"</p>
                                    </div>
                                    {aiAnalysis.defects.length > 0 && (
                                        <div>
                                            <span className="text-slate-500 block mb-1">Detalles / Daños:</span>
                                            <ul className="list-disc list-inside text-rose-500 font-medium">
                                                {aiAnalysis.defects.map((d, i) => <li key={i}>{d}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-left space-y-4">
                            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                                <span className="text-slate-500">Vehículo</span>
                                <span className="font-bold">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Válido por</span>
                                <span className="font-bold text-[#00aed9]">7 Días</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={async () => {
                                    try {
                                        await submitApplication({
                                            firstName: 'Usuario',
                                            lastName: 'Invitado',
                                            type: 'trade-in',
                                            customer: { name: 'Usuario Invitado' },
                                            vehicle: {
                                                year: vehicleInfo.year,
                                                make: vehicleInfo.make,
                                                model: vehicleInfo.model,
                                                mileage: vehicleInfo.mileage,
                                                vin: vehicleInfo.vin,
                                                condition: vehicleInfo.condition
                                            },
                                            offerAmount,
                                            tradeInPhotos: uploadedUrls,
                                            status: 'new',
                                            aiSummary: aiAnalysis ? `IA Condition: ${aiAnalysis.condition}. Reasoning: ${aiAnalysis.reasoning}` : 'No AI Analysis'
                                        });
                                        navigate('/garage');
                                    } catch (e) {
                                        console.error(e);
                                        alert('Error guardando la oferta.');
                                    }
                                }}
                                className="w-full py-4 bg-[#0d2232] text-white rounded-xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                            >
                                Aceptar Oferta y Agendar Cita
                            </button>
                            <button onClick={() => navigate('/')} className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600">
                                Lo pensaré
                            </button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 p-6 pb-24">
            <SEO
                title="Vende tu Auto | Tasación Instantánea con IA - Richard Automotive"
                description="Recibe una oferta inmediata por tu auto. Sube fotos, nuestra IA analiza la condición y te damos el mejor precio de trade-in en Puerto Rico."
                url="/appraisal"
                type="website"
            />
            <header className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    title="Volver"
                    aria-label="Volver atrás"
                >
                    <ChevronRight className="rotate-180" size={20} />
                </button>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter">
                    Vender mi <span className="text-[#00aed9]">Auto</span>
                </h1>
            </header>

            <AnimatePresence mode='wait'>
                {renderStep()}
            </AnimatePresence>
        </div>
    );
};

export default AppraisalView;
