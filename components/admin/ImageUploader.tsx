import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebaseService';
import { optimizeImageComplete, validateImageFile } from '../../services/imageOptimizationService';

// Export UploadResult type first
export interface UploadResult {
    url: string;
    webpUrl?: string;
    thumbnailUrl?: string;
    blurPlaceholder?: string;
    originalSize: number;
    optimizedSize: number;
    savings: number;
}

interface ImageUploaderProps {
    onUploadComplete: (results: UploadResult[]) => void;
    maxFiles?: number;
    storagePath?: string;
    existingImages?: string[];
}

interface UploadingFile {
    file: File;
    preview: string;
    status: 'pending' | 'optimizing' | 'uploading' | 'complete' | 'error';
    progress: number;
    error?: string;
    result?: UploadResult;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
    onUploadComplete,
    maxFiles = 5,
    storagePath = 'inventory'
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<UploadingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = useCallback(async (fileList: FileList) => {
        const newFiles = Array.from(fileList).slice(0, maxFiles);

        // Create preview objects
        const uploadingFiles: UploadingFile[] = newFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            status: 'pending',
            progress: 0
        }));

        setFiles(uploadingFiles);

        // Process each file
        for (let i = 0; i < uploadingFiles.length; i++) {
            const uploadFile = uploadingFiles[i];

            try {
                // Validate
                const validation = validateImageFile(uploadFile.file);
                if (!validation.valid) {
                    setFiles(prev => prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'error', error: validation.error } : f
                    ));
                    continue;
                }

                // Update status to optimizing
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'optimizing', progress: 20 } : f
                ));

                // Optimize image
                const optimized = await optimizeImageComplete(uploadFile.file, {
                    quality: 0.85,
                    maxWidth: 1600,
                    generateWebP: true
                });

                // Update status to uploading
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'uploading', progress: 50 } : f
                ));

                // Upload to Firebase Storage
                const timestamp = Date.now();
                const fileName = `${timestamp}_${uploadFile.file.name.replace(/\.[^/.]+$/, '')}`;

                // Upload main image (JPEG)
                const mainRef = ref(storage, `${storagePath}/${fileName}.jpg`);
                await uploadBytes(mainRef, optimized.jpeg);
                const mainUrl = await getDownloadURL(mainRef);

                // Upload thumbnail
                const thumbRef = ref(storage, `${storagePath}/thumbnails/${fileName}_thumb.jpg`);
                await uploadBytes(thumbRef, optimized.thumbnail);
                const thumbUrl = await getDownloadURL(thumbRef);

                // Upload WebP if available
                if (optimized.webp) {
                    const webpRef = ref(storage, `${storagePath}/${fileName}.webp`);
                    await uploadBytes(webpRef, optimized.webp);
                }

                const result: UploadResult = {
                    url: mainUrl,
                    thumbnailUrl: thumbUrl,
                    blurPlaceholder: optimized.blurPlaceholder,
                    originalSize: uploadFile.file.size,
                    optimizedSize: optimized.jpeg.size,
                    savings: ((uploadFile.file.size - optimized.jpeg.size) / uploadFile.file.size) * 100
                };

                // Update status to complete
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'complete', progress: 100, result } : f
                ));

            } catch (error) {
                console.error('Upload error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'error', error: errorMessage } : f
                ));
            }
        }

        // Notify parent when all complete
        const results = uploadingFiles
            .filter(f => f.result)
            .map(f => f.result!);

        if (results.length > 0) {
            onUploadComplete(results);
        }
    }, [maxFiles, storagePath, onUploadComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

    const totalSavings = files.reduce((sum, f) => {
        if (f.result) {
            return sum + (f.result.originalSize - f.result.optimizedSize);
        }
        return sum;
    }, 0);

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer
          ${isDragging
                        ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }
        `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 to-purple-900/10 pointer-events-none" />

                <div className="relative p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <motion.div
                        animate={isDragging ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                        className="p-6 bg-cyan-500/10 rounded-2xl"
                    >
                        <Upload className="text-cyan-500" size={48} strokeWidth={2} />
                    </motion.div>

                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                            {isDragging ? '¡Suelta aquí!' : 'Arrastra imágenes'}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">
                            o haz click para seleccionar • Máximo {maxFiles} archivos
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            JPEG, PNG, WebP, HEIC • Hasta 10MB cada uno
                        </p>
                    </div>

                    {totalSavings > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                        >
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                                💾 Ahorro: {(totalSavings / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </motion.div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    multiple
                    max={maxFiles}
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="Seleccionar imágenes para subir"
                />
            </motion.div>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        {files.map((file, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="glass-premium p-4 rounded-xl flex items-center gap-4"
                            >
                                {/* Preview */}
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                    <img
                                        src={file.preview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                        {file.file.name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>

                                    {/* Progress Bar */}
                                    {(file.status === 'optimizing' || file.status === 'uploading') && (
                                        <div className="mt-2">
                                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${file.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                                                {file.status === 'optimizing' ? 'Optimizando...' : 'Subiendo...'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Error */}
                                    {file.status === 'error' && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {file.error}
                                        </p>
                                    )}

                                    {/* Success */}
                                    {file.status === 'complete' && file.result && (
                                        <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Optimizado: {((file.result.originalSize - file.result.optimizedSize) / 1024 / 1024).toFixed(2)} MB ahorrados
                                        </p>
                                    )}
                                </div>

                                {/* Status Icon */}
                                <div className="flex-shrink-0">
                                    {file.status === 'pending' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                            <ImageIcon size={16} className="text-slate-500" />
                                        </div>
                                    )}
                                    {(file.status === 'optimizing' || file.status === 'uploading') && (
                                        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                            <Loader2 size={16} className="text-cyan-500 animate-spin" />
                                        </div>
                                    )}
                                    {file.status === 'complete' && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle size={16} className="text-emerald-500" />
                                        </div>
                                    )}
                                    {file.status === 'error' && (
                                        <button
                                            onClick={() => removeFile(index)}
                                            aria-label="Eliminar imagen"
                                            className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                        >
                                            <X size={16} className="text-red-500" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
