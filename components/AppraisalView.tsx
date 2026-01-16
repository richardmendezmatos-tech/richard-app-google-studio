import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle, ChevronRight, Loader2, ScanLine, DollarSign, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AppraisalView: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [scanning, setScanning] = useState(false);
    const [offerReady, setOfferReady] = useState(false);

    // Form State
    const [vehicleInfo, setVehicleInfo] = useState({
        year: '2020',
        make: '',
        model: '',
        mileage: ''
    });

    const [photos, setPhotos] = useState<{ [key: string]: File | null }>({
        front: null,
        back: null,
        interior: null,
        dashboard: null
    });

    // Mock Offer Data
    const [offerAmount, setOfferAmount] = useState({ min: 0, max: 0 });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setVehicleInfo({ ...vehicleInfo, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = (angle: string, file: File) => {
        setPhotos(prev => ({ ...prev, [angle]: file }));
    };

    const startScan = () => {
        setScanning(true);
        // Simulate AI Processing
        setTimeout(() => {
            setScanning(false);
            setOfferReady(true);
            // Mock logic
            const base = 15000;
            setOfferAmount({ min: base, max: base + 2500 });
        }, 4000);
    };

    // Render Steps
    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                    <ChevronRight className="rotate-180" size={16} /> Cancelar
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#00aed9] rounded-full animate-pulse" />
                    <span className="font-black tracking-widest text-[#00aed9]">AI APPRAISAL</span>
                </div>
            </header>

            <main className="relative z-10 max-w-4xl mx-auto p-6 lg:p-12 flex flex-col items-center justify-center min-h-[80vh]">

                <AnimatePresence mode="wait">

                    {/* STEP 1: VEHICLE INFO */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-lg space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-[#00aed9]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00aed9]/30">
                                    <Car size={40} className="text-[#00aed9]" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tighter">¿Qué auto vendes?</h1>
                                <p className="text-slate-400">Ingresa los detalles básicos para calibrar el escáner.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Año</label>
                                        <select name="year" value={vehicleInfo.year} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 font-bold focus:border-[#00aed9] outline-none">
                                            {Array.from({ length: 15 }, (_, i) => 2025 - i).map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Marca</label>
                                        <input name="make" placeholder="Ej. Toyota" value={vehicleInfo.make} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 font-bold focus:border-[#00aed9] outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Modelo</label>
                                    <input name="model" placeholder="Ej. RAV4 XLE" value={vehicleInfo.model} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 font-bold focus:border-[#00aed9] outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Millaje (Aprox)</label>
                                    <input name="mileage" type="number" placeholder="0" value={vehicleInfo.mileage} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 font-bold focus:border-[#00aed9] outline-none" />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!vehicleInfo.make || !vehicleInfo.model}
                                className="w-full bg-white text-slate-900 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[#00aed9] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuar
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: PHOTO SCAVENGER HUNT */}
                    {step === 2 && !scanning && !offerReady && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-4xl"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-black mb-2">Escaneo Visual</h2>
                                <p className="text-slate-400">Sube 4 fotos clave. Nuestra IA analizará la condición.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {Object.keys(photos).map((angle) => (
                                    <PhotoZone
                                        key={angle}
                                        label={angle}
                                        file={photos[angle as keyof typeof photos]}
                                        onUpload={(f) => handlePhotoUpload(angle, f)}
                                    />
                                ))}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={startScan}
                                    disabled={Object.values(photos).some(p => !p)}
                                    className="px-12 py-4 bg-[#00aed9] text-white rounded-full font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,174,217,0.3)] hover:scale-105 transition-transform disabled:opacity-50 disabled:shadow-none"
                                >
                                    Analizar Vehículo
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SCANNING ANIMATION */}
                    {scanning && (
                        <motion.div
                            key="scanning"
                            className="text-center relative w-full max-w-2xl aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-[#00aed9]/30 flex items-center justify-center"
                        >
                            {/* Scanning overlay */}
                            <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-[#00aed9] shadow-[0_0_20px_#00aed9] z-20"
                                animate={{ top: ["0%", "100%", "0%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="space-y-6 relative z-10">
                                <Loader2 size={60} className="text-[#00aed9] animate-spin mx-auto" />
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-widest text-white">Analizando Carrocería...</h3>
                                    <p className="text-[#00aed9] font-mono text-sm mt-2">DETECTING_DENTS_AND_SCRATCHES_V4.2</p>
                                </div>
                            </div>

                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <div className="absolute inset-0 border-[1px] border-[#00aed9]/10" style={{ backgroundImage: 'linear-gradient(#00aed9 1px, transparent 1px), linear-gradient(90deg, #00aed9 1px, transparent 1px)', backgroundSize: '40px 40px', backgroundPosition: 'center center', opacity: 0.1 }} />
                        </motion.div>
                    )}

                    {/* STEP 4: OFFER CERTIFICATE */}
                    {offerReady && (
                        <motion.div
                            key="offer"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white text-slate-900 p-8 rounded-[40px] max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#00aed9]" />

                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                                <CheckCircle size={32} />
                            </div>

                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Oferta de Retoma Garantizada</h2>
                            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">
                                ${offerAmount.min.toLocaleString()} - ${offerAmount.max.toLocaleString()}
                            </h1>
                            <p className="text-slate-400 text-xs mb-8">*Válido por 7 días o 250 millas adicionales.</p>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Vehículo</span>
                                    <span>{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span>Condición Detectada</span>
                                    <span className="text-emerald-500">Muy Buena</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/garage')}
                                className="w-full bg-[#173d57] text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-[#0f2a3d] transition-colors"
                            >
                                Aceptar & Guardar en Garaje
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

// Sub-component for Scan Zone
const PhotoZone = ({ label, file, onUpload }: { label: string, file: File | null, onUpload: (f: File) => void }) => {
    return (
        <label className={`relative aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden ${file ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-[#00aed9] hover:bg-slate-900'}`}>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />

            {file ? (
                <>
                    <img src={URL.createObjectURL(file)} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="relative z-10 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        <CheckCircle size={16} />
                    </div>
                    <span className="absolute bottom-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 uppercase">{label}</span>
                </>
            ) : (
                <>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-[#00aed9]">
                        <Camera size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
                </>
            )}
        </label>
    );
};

export default AppraisalView;
