
import React, { useState, useRef } from 'react';
import { X, Wand2, Loader2 } from 'lucide-react';
import { Car, CarType } from '../../types';
import { useDealer } from '../../contexts/DealerContext';
import { ImageUploader, type UploadResult } from './ImageUploader';

interface AdminModalProps {
    car: Car | null;
    onClose: () => void;
    onSave: (data: Omit<Car, 'id'>) => Promise<void>;
    onPhotoUploaded?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ car, onClose, onSave, onPhotoUploaded }) => {
    const { currentDealer } = useDealer();
    const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [description, setDescription] = useState(car?.description || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTier, setAiTier] = useState<'Standard' | 'Premium' | null>(null);
    const [debugLogs, setDebugLogs] = useState<string[]>([]);
    const formRef = useRef<HTMLFormElement>(null);

    const logDebug = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setDebugLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
        console.log(`Strategic Deep Debug Console: ${msg}`);
    };

    // AI Generation
    const generateAIDescription = async () => {
        // Collect basic info
        const form = document.querySelector('form');
        if (!form) return;
        const formData = new FormData(form);
        const name = formData.get('name') as string;
        const features = (formData.get('features') as string).split(',').filter(f => f.trim() !== '');
        const price = Number(formData.get('price'));

        if (!name) {
            alert("Por favor ingresa primero el nombre del vehículo.");
            return;
        }

        setIsGenerating(true);
        // Strategic: Smart Model Selection (Cost Optimization)
        const tier = price > 50000 ? 'Premium' : 'Standard';
        setAiTier(tier);

        try {
            if (tier === 'Standard') {
                // Efficiency: Client-side logic for common units (No cost)
                const fastText = `Increíble ${name}. Equipado con ${features.join(', ')}. Una oportunidad única para quienes buscan calidad y rendimiento.`;
                setDescription(fastText);
                setIsGenerating(false);
                return;
            }

            // High Variance: Premium AI for expensive units
            // High Variance: Premium AI for expensive units
            const prompt = `Genera una descripción profesional y atractiva para la venta de este vehículo: ${name}.
            Características principales: ${features.join(', ')}.
            Precio: $${price}.
            El tono debe ser persuasivo, resaltando el valor y la oportunidad.`;

            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    model: 'gemini-1.5-flash',
                    systemInstruction: 'Eres un vendedor experto de autos de lujo y seminuevos. Escribe en español latino de forma entusiasta pero profesional.'
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            setDescription(data.text);
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Error generando descripción. Intenta nuevamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle upload completion
    const handleUploadComplete = (results: UploadResult[]) => {
        setUploadResults(results);
        onPhotoUploaded?.();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            logDebug("Submit gate triggered...");
            if (!formRef.current) {
                logDebug("!!! CRITICAL: formRef.current is null!");
                throw new Error("Referencia al formulario perdida.");
            }

            const { auth } = await import('../../services/firebaseService');
            logDebug(`Auth Context: ${auth.currentUser?.email || 'OFFLINE/LOGGED_OUT'}`);
            logDebug(`UID: ${auth.currentUser?.uid || 'N/A'}`);

            const fd = new FormData(formRef.current);
            logDebug("FormData constructed successfully.");

            // Collect all image URLs from upload results
            const finalImageUrls: string[] = [];

            // Keep existing images if editing
            if (car?.images) {
                finalImageUrls.push(...car.images);
            }

            // Add newly uploaded images
            uploadResults.forEach(result => {
                if (result.url) finalImageUrls.push(result.url);
                if (result.webpUrl) finalImageUrls.push(result.webpUrl);
            });

            logDebug(`Total images: ${finalImageUrls.length}`);
            if (uploadResults.length > 0) {
                const totalSavings = uploadResults.reduce((sum, r) => sum + (r.savings || 0), 0);
                logDebug(`Image optimization saved ${totalSavings.toFixed(0)}% total`);
            }

            // Ensure we have at least one image
            const mainImage = finalImageUrls.length > 0 ? finalImageUrls[0] : '';

            logDebug("Persisting document to Firestore...");
            await onSave({
                name: fd.get('name') as string,
                price: Number(fd.get('price')),
                type: fd.get('type') as CarType,
                badge: fd.get('badge') as string,
                img: mainImage, // Main thumbnail for backward compatibility
                images: finalImageUrls, // New Gallery Array
                description: description,
                features: (fd.get('features') as string).split(',').map(f => f.trim()),
                dealerId: currentDealer.id || 'richard-automotive' // Enforcement
            });
            logDebug("✅ SUCCESS: Document saved successfully.");
            onClose(); // Close only after success
        } catch (error) {
            logDebug(`!!! ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error("Upload/Save Strategic Error:", error);
            const errorMsg = error instanceof Error ? error.message : "Error desconocido";
            if (errorMsg.includes("Storage")) {
                alert(`Error de Storage (Consola): ${errorMsg}`);
            } else {
                alert(`Error al guardar: ${errorMsg}`);
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-[40px] rounded-t-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 sticky top-0">
                    <div>
                        <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest">Editor de Inventario</div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{car ? 'Editar Unidad' : 'Nueva Unidad'}</h2>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar modal" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Uploader */}
                        <ImageUploader
                            onUploadComplete={handleUploadComplete}
                        />

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre</label>
                                <input name="name" defaultValue={car?.name} required className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="Ej. Toyota Corolla" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Precio</label>
                                <input name="price" type="number" defaultValue={car?.price} required className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="25000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</label>
                                <select name="type" defaultValue={car?.type || 'suv'} aria-label="Tipo de vehículo" className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9] appearance-none">
                                    <option value="suv">SUV</option>
                                    <option value="sedan">Sedan</option>
                                    <option value="pickup">Pickup</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Badge</label>
                                <input name="badge" defaultValue={car?.badge} className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="Opcional" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Características</label>
                            <input name="features" defaultValue={car?.features?.join(', ')} className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9]" placeholder="GPS, Cuero, Turbo..." />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="description-field" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
                                <button
                                    type="button"
                                    onClick={generateAIDescription}
                                    disabled={isGenerating}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#00aed9] flex items-center gap-1 hover:underline disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                    {isGenerating ? 'Generando...' : 'Generar con IA'}
                                </button>
                                {aiTier && (
                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${aiTier === 'Premium' ? 'bg-purple-500/10 text-purple-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        Tier: {aiTier}
                                    </span>
                                )}
                            </div>
                            <textarea
                                id="description-field"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-[#00aed9] resize-none"
                                placeholder="Descripción del vehículo"
                            />
                        </div>

                        {/* Strategic Debug Console */}
                        {debugLogs.length > 0 && (
                            <div className="p-4 bg-slate-950 rounded-2xl border border-rose-500/20 space-y-1">
                                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-b border-rose-500/10 pb-2 mb-2">Diagnostic Console (Copy for IT)</div>
                                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                    {debugLogs.map((log, i) => (
                                        <div key={i} className="text-[9px] font-mono text-slate-300 break-all leading-relaxed">{log}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={isUploading} className="w-full h-[56px] bg-[#0d2232] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                            {isUploading ? 'Guardando...' : 'Guardar Unidad'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
