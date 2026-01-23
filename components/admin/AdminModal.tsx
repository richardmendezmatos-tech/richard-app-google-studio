
import React, { useState, useRef } from 'react';
import { X, ImageIcon, Camera, Wand2, Loader2 } from 'lucide-react';
import { Car, CarType } from '../../types';
import { uploadImage } from '../../services/firebaseService';
import { cameraService } from '../../services/cameraService';

interface AdminModalProps {
    car: Car | null;
    onClose: () => void;
    onSave: (data: Omit<Car, 'id'>) => void;
    onPhotoUploaded?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ car, onClose, onSave, onPhotoUploaded }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(car?.img || '');
    const [isUploading, setIsUploading] = useState(false);
    const [description, setDescription] = useState(car?.description || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [cameraCapturedBlob, setCameraCapturedBlob] = useState<Blob | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Generation
    const generateAIDescription = async () => {
        // Collect basic info
        const form = document.querySelector('form');
        if (!form) return;
        const formData = new FormData(form);
        const name = formData.get('name') as string;
        const features = (formData.get('features') as string).split(',').filter(f => f.trim() !== '');

        if (!name) {
            alert("Por favor ingresa primero el nombre del vehículo.");
            return;
        }

        setIsGenerating(true);
        try {
            // Import dynamically to avoid top-level issues if needed, or rely on existing services
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../../services/firebaseService');

            const generateDescription = httpsCallable(functions, 'generateDescription');
            const result = await generateDescription({
                carModel: name,
                features: features
            });

            // Genkit callable usually returns the text directly in data or data.text
            const text = result.data as string;
            setDescription(text);
        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Error generando descripción. Intenta nuevamente.");
        } finally {
            setIsGenerating(false);
        }
    };


    // Instant Preview Logic
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setCameraCapturedBlob(null); // Clear camera blob if file selected
            // FileReader for Instant Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNativeCamera = async () => {
        try {
            const photo = await cameraService.takePhoto();
            if (photo) {
                setPreviewUrl(photo.preview);
                setCameraCapturedBlob(photo.blob);
                setSelectedFile(null); // Clear manual file if camera used
            }
        } catch (err) {
            console.error("Camera Error:", err);
            alert("No se pudo acceder a la cámara nativa.");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            const fd = new FormData(e.currentTarget);
            let finalImageUrl = previewUrl;
            // Upload ONLY if a new file was selected. If preview was set via text URL, use that.
            if (selectedFile) {
                finalImageUrl = await uploadImage(selectedFile);
                onPhotoUploaded?.(); // Update counter
            } else if (cameraCapturedBlob) {
                // Convert Blob to File for Firebase compatibility if needed
                const file = cameraService.blobToFile(cameraCapturedBlob, `camera_${Date.now()}.jpg`);
                finalImageUrl = await uploadImage(file);
                onPhotoUploaded?.();
            }
            onSave({
                name: fd.get('name') as string,
                price: Number(fd.get('price')),
                type: fd.get('type') as CarType,
                badge: fd.get('badge') as string,
                img: finalImageUrl,
                description: description,
                features: (fd.get('features') as string).split(',').map(f => f.trim()),
            });
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
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
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Form */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Image Uploader */}
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Media</label>
                            <div className="flex gap-4">
                                <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 overflow-hidden relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={handleNativeCamera}
                                        className="h-[44px] bg-[#00aed9]/10 border border-[#00aed9]/25 text-[#00aed9] rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-[#00aed9] hover:text-white transition-all shadow-sm"
                                    >
                                        <Camera size={16} /> Capturar Cámara
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-[44px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
                                    >
                                        <ImageIcon size={16} /> Galería
                                    </button>
                                    <input
                                        name="imgurl"
                                        placeholder="O pegar URL..."
                                        value={!selectedFile && !cameraCapturedBlob ? previewUrl : ''}
                                        onChange={(e) => { setPreviewUrl(e.target.value); setSelectedFile(null); setCameraCapturedBlob(null); }}
                                        className="col-span-2 h-[44px] px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00aed9] border border-slate-100 dark:border-slate-700"
                                    />
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </div>
                            </div>
                        </div>

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
                                <select name="type" defaultValue={car?.type || 'suv'} className="w-full h-[50px] px-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#00aed9] appearance-none">
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
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
                                <button
                                    type="button"
                                    onClick={generateAIDescription}
                                    disabled={isGenerating}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#00aed9] flex items-center gap-1 hover:underline disabled:opacity-50"
                                >
                                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                    {isGenerating ? 'Generando...' : 'Generar con IA'}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-[#00aed9] resize-none"
                            />
                        </div>

                        <button type="submit" disabled={isUploading} className="w-full h-[56px] bg-[#0d2232] text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                            {isUploading ? 'Guardando...' : 'Guardar Unidad'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
