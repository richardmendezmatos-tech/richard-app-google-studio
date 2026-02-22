import React, { useState, useCallback, useMemo } from 'react';
import { Camera, CheckCircle, ChevronRight, Info, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/seo/SEO';

import { submitApplication } from '@/services/firebaseService';
import { usePhotoUploader } from '@/hooks/usePhotoUploader';
import { analyzeTradeInImages } from '@/services/geminiService';

// Import local styles to remove inline dependencies
import './AppraisalView.css';

// --- Sub-Components (Memoized for Performance) ---

const ContactStep = React.memo(({ info, onChange, onNext }: any) => (
    <motion.div
        key="contact"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
    >
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <Sparkles className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">¡Análisis Completo!</h2>
            <p className="text-slate-500 text-sm mt-2">Dinos a dónde enviar el reporte de IA y desbloquea tu oferta final.</p>
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tu Nombre</label>
                <input
                    type="text"
                    name="name"
                    value={info.name}
                    onChange={onChange}
                    className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#00aed9] font-medium"
                    placeholder="Ej. Juan Pérez"
                    autoFocus
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">WhatsApp / Móvil</label>
                <input
                    type="tel"
                    name="phone"
                    value={info.phone}
                    onChange={onChange}
                    className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#00aed9] font-medium"
                    placeholder="(787) 000-0000"
                />
            </div>
        </div>

        <button
            onClick={onNext}
            className="w-full py-5 bg-[#0d2232] text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
            Ver mi Oferta Revelada <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest leading-relaxed">
            Al continuar, aceptas que Richard Automotive te contacte con tu oferta. <br /> Cero spam. Privacidad 100% garantizada.
        </p>
    </motion.div>
));

const InfoStep = React.memo(({ info, onChange, onNext }: any) => (
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
                    value={info.year}
                    onChange={onChange}
                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                    placeholder="2018"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Marca</label>
                <input
                    type="text"
                    name="make"
                    value={info.make}
                    onChange={onChange}
                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                    placeholder="Toyota"
                />
            </div>
            <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Modelo</label>
                <input
                    type="text"
                    name="model"
                    value={info.model}
                    onChange={onChange}
                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                    placeholder="Camry SE"
                />
            </div>
            <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Kilometraje</label>
                <input
                    type="number"
                    name="mileage"
                    value={info.mileage}
                    onChange={onChange}
                    className="w-full bg-slate-100 dark:bg-slate-700 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#00aed9]"
                    placeholder="45000"
                />
            </div>
        </div>

        <button
            onClick={onNext}
            className="w-full py-4 bg-[#00aed9] text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
            Siguiente Paso <ChevronRight size={18} />
        </button>
    </motion.div>
));

const PhotoStep = React.memo(({ photos, onUpload, progress, count, onNext }: any) => (
    <motion.div
        key="photos"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
    >
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Fotos del Vehículo</h2>
            <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${count === 4 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                Fotos: {count}/4
            </span>
        </div>

        {/* Improved Progress Bar with dynamic variable */}
        <div className="appraisal-progress-container">
            <div
                className={`appraisal-progress-bar ${count === 4 ? 'progress-filled' : 'progress-active'}`}
                style={{ '--progress': `${progress}%` } as React.CSSProperties}
            ></div>
        </div>

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
                        onChange={(e) => onUpload(key, e)}
                    />
                </label>
            ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-blue-600 dark:text-blue-300 text-xs">
            <Info className="shrink-0" size={16} />
            <p>Toma fotos claras y bien iluminadas para obtener la mejor oferta posible.</p>
        </div>

        <button
            onClick={onNext}
            disabled={count < 4}
            className="w-full py-4 bg-[#00aed9] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
            {count < 4 ? `Faltan Fotos(${count}/4)` : 'Analizar Vehículo'}
            {count === 4 && <ChevronRight size={18} />}
        </button>
    </motion.div>
));

const ScanStep = React.memo(({ stage, offerReady, scanning, onStart, onNext }: any) => (
    <motion.div
        key="scan"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex flex-col items-center justify-center py-10 space-y-8"
    >
        <div className="relative w-64 h-64">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-[#00ed9]/30 rounded-full"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-4 border-dashed border-[#00aed9]/50 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="text-[#00aed9] w-24 h-24 opacity-80 animate-pulse" />
            </div>

            {/* Use standardized scan line from CSS */}
            <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="scan-line"
            />
        </div>

        <div className="text-center space-y-2">
            <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white animate-pulse">
                {offerReady ? 'Análisis Completado' : stage || 'Iniciando Escáner...'}
            </h3>
            <p className="text-sm text-slate-500">
                {offerReady ? 'Análisis exitoso. Listo para revelar.' : 'Nuestra IA está detectando daños y condiciones.'}
            </p>
        </div>

        {!scanning && !offerReady && (
            <button onClick={onStart} className="px-8 py-3 bg-[#0d2232] text-white rounded-full font-bold uppercase tracking-widest text-xs animate-in fade-in slide-in-from-bottom-4">
                Iniciar Escaneo IA
            </button>
        )}

        {offerReady && (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={onNext}
                className="px-8 py-4 bg-emerald-500 text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 transition-transform"
            >
                Desbloquear Oferta
            </motion.button>
        )}
    </motion.div>
));

const OfferStep = React.memo(({ amount, analysis, vehicle, onAccept, onCancel }: any) => (
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
                ${amount.min.toLocaleString()} - ${amount.max.toLocaleString()}
            </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-left space-y-4 shadow-inner border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-amber-400" size={20} fill="currentColor" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Reporte de Inspección IA</h3>
            </div>

            {analysis && (
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Condición Detectada:</span>
                        <span className="font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase text-xs">{analysis.condition}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block mb-1">Observaciones:</span>
                        <p className="text-slate-700 dark:text-slate-300 italic">"{analysis.reasoning}"</p>
                    </div>
                    {analysis.defects.length > 0 && (
                        <div>
                            <span className="text-slate-500 block mb-1">Detalles / Daños:</span>
                            <ul className="list-disc list-inside text-rose-500 font-medium">
                                {analysis.defects.map((d: string, i: number) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl text-left space-y-4">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="text-slate-500">Vehículo</span>
                <span className="font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500">Válido por</span>
                <span className="font-bold text-[#00aed9]">7 Días</span>
            </div>
        </div>

        <div className="space-y-3">
            <button
                onClick={onAccept}
                className="w-full py-4 bg-[#0d2232] text-white rounded-xl font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
                Aceptar Oferta y Agendar Cita
            </button>
            <button onClick={onCancel} className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600">
                Lo pensaré
            </button>
        </div>
    </motion.div>
));

// --- Main Optimized AppraisalView ---

const AppraisalView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'contact' | 'info' | 'photos' | 'scan' | 'offer'>('info');
    const [contactInfo, setContactInfo] = useState({ name: '', phone: '' });
    const [vehicleInfo, setVehicleInfo] = useState({ year: '', make: '', model: '', mileage: '', condition: 'good', vin: '' });

    const { photos, setPhoto, uploadAllPhotos, count: uploadedCount } = usePhotoUploader({
        front: null, back: null, interior: null, dashboard: null
    });

    const [scanning, setScanning] = useState(false);
    const [scanStage, setScanStage] = useState('');
    const [offerReady, setOfferReady] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [offerAmount, setOfferAmount] = useState({ min: 0, max: 0 });
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    // Optimized Handlers
    const handleContactChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setContactInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setVehicleInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, []);

    const handlePhotoUpload = useCallback((key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(key, e.target.files[0]);
        }
    }, [setPhoto]);

    const handleExpressCapture = useCallback(async () => {
        if (!contactInfo.name || !contactInfo.phone) {
            alert("Por favor ingresa tu nombre y WhatsApp para continuar.");
            return;
        }
        try {
            const { addLead } = await import('@/features/leads/services/crmService');
            await addLead({
                type: 'trade-in',
                name: contactInfo.name,
                phone: contactInfo.phone,
                notes: `Appraisal Express Capture - Lead submitted info to unlock offer`
            });
        } catch (e) {
            console.error("CRM Express fail:", e);
        }
        setStep('offer');
    }, [contactInfo]);

    const progress = useMemo(() => (uploadedCount / 4) * 100, [uploadedCount]);

    const startScan = async () => {
        setScanning(true);
        setScanStage('Subiendo fotos...');
        try {
            const photoKeys = ['front', 'back', 'interior', 'dashboard'];
            const files = photoKeys.map(k => photos[k]).filter(f => f !== null) as File[];

            const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const base64Images = await Promise.all(files.map(f => fileToBase64(f)));
            const cleanBase64 = base64Images.map(img => img.split(',')[1]);

            setScanStage('Analizando Carrocería con IA...');
            const uploadTask = uploadAllPhotos();
            const aiTask = analyzeTradeInImages(cleanBase64);
            const minDelay = new Promise(resolve => setTimeout(resolve, 3500));

            const [urls, analysis] = await Promise.all([uploadTask, aiTask, minDelay]);

            setUploadedUrls(urls);
            setAiAnalysis(analysis);

            const baseValue = 15000;
            setOfferAmount({
                min: Math.round(baseValue * (analysis as any).estimatedValueAdjustment),
                max: Math.round((baseValue + 2500) * (analysis as any).estimatedValueAdjustment)
            });
            setOfferReady(true);
        } catch (error) {
            console.error("Scan/Upload failed", error);
            alert("Hubo un error al procesar las imágenes.");
        } finally {
            setScanning(false);
        }
    };

    const handleAcceptOffer = async () => {
        try {
            await submitApplication({
                firstName: contactInfo.name.split(' ')[0],
                lastName: contactInfo.name.split(' ').slice(1).join(' ') || 'N/A',
                phone: contactInfo.phone,
                type: 'trade-in',
                customer: { name: contactInfo.name, phone: contactInfo.phone },
                vehicle: { ...vehicleInfo },
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
                {step === 'info' && <InfoStep info={vehicleInfo} onChange={handleInputChange} onNext={() => setStep('photos')} />}
                {step === 'photos' && <PhotoStep photos={photos} onUpload={handlePhotoUpload} progress={progress} count={uploadedCount} onNext={() => setStep('scan')} />}
                {step === 'scan' && <ScanStep stage={scanStage} offerReady={offerReady} scanning={scanning} onStart={startScan} onNext={() => setStep('contact')} />}
                {step === 'contact' && <ContactStep info={contactInfo} onChange={handleContactChange} onNext={handleExpressCapture} />}
                {step === 'offer' && <OfferStep amount={offerAmount} analysis={aiAnalysis} vehicle={vehicleInfo} onAccept={handleAcceptOffer} onCancel={() => navigate('/')} />}
            </AnimatePresence>
        </div>
    );
};

export default AppraisalView;
