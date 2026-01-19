
import React, { useState, useRef } from 'react';
import { X, ImageIcon, Camera } from 'lucide-react';
import { Car, CarType } from '../../types';
import { uploadImage } from '../../services/firebaseService';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Instant Preview Logic
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // FileReader for Instant Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
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
                                <div className="flex-1 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-[44px] border-2 border-dashed border-[#00aed9] bg-[#00aed9]/5 rounded-xl flex items-center justify-center gap-2 text-[#00aed9] font-bold text-xs uppercase tracking-widest hover:bg-[#00aed9]/10 transition-colors"
                                    >
                                        <Camera size={18} /> Subir Foto / Tomar
                                    </button>
                                    <input
                                        name="imgurl"
                                        placeholder="O pegar URL..."
                                        value={!selectedFile ? previewUrl : ''}
                                        onChange={(e) => { setPreviewUrl(e.target.value); setSelectedFile(null); }}
                                        className="w-full h-[44px] px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#00aed9]"
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
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
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
