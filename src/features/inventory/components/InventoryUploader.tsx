import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { inventoryIngestionService } from '@/services/inventoryIngestionService';
import { Car } from '@/types/types';
import { Loader2, Upload, Check, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';

interface InventoryUploaderProps {
    onDataExtracted: (data: Partial<Car>) => void;
}

export const InventoryUploader: React.FC<InventoryUploaderProps> = ({ onDataExtracted }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result as string;
                setPreview(base64);

                try {
                    const data = await inventoryIngestionService.processInventoryImage(base64);
                    onDataExtracted(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "Error al procesar imagen");
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError("Error al leer el archivo");
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            processFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        disabled: isProcessing
    });

    return (
        <div className="w-full max-w-md mx-auto">
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-4">
                    {preview ? (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            {isProcessing ? (
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-900">
                            {isProcessing ? 'Analizando con Gemini Vision...' : 'Carga de Inventario IA'}
                        </h3>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                            Sube una foto del auto, sticker de ventana u hoja de subasta.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg text-xs">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <ImageIcon size={14} />
                    <span>Detecta Modelo/Año</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <FileText size={14} />
                    <span>Lee Window Stickers</span>
                </div>
            </div>
        </div>
    );
};
