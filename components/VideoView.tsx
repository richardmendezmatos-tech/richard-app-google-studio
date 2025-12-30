
import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from '../services/geminiService';
import { Clapperboard, UploadCloud, Film, AlertTriangle, KeyRound, Download } from 'lucide-react';

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const LOADING_MESSAGES = [
    "Contactando los servidores de Veo...",
    "Analizando la imagen de entrada...",
    "Generando fotogramas iniciales...",
    "Renderizando la secuencia de video...",
    "Esto puede tardar unos minutos...",
    "Aplicando toques finales...",
];

const VideoView: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
        };
        checkApiKey();
    }, []);

    useEffect(() => {
        let interval: number;
        if (loading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setVideoUrl(null); // Clear previous video
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    };
    
    const handleGenerate = async () => {
        if (!imageFile) {
            setError("Por favor, sube una imagen para comenzar.");
            return;
        }

        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(LOADING_MESSAGES[0]);

        try {
            const base64Image = await fileToBase64(imageFile);
            const videoUri = await generateVideo(prompt, base64Image, imageFile.type, aspectRatio);
            
            // Fetch the video blob to create a playable URL
            const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
            if (!response.ok) {
                throw new Error(`Error al descargar el video: ${response.statusText}`);
            }
            const videoBlob = await response.blob();
            const objectUrl = URL.createObjectURL(videoBlob);
            setVideoUrl(objectUrl);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                if (err.message.includes('Requested entity was not found')) {
                    setError("Clave de API no válida o sin permisos. Por favor, selecciona una clave de un proyecto con facturación habilitada.");
                    setApiKeySelected(false);
                }
            } else {
                setError("Ocurrió un error inesperado durante la generación.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success and update UI immediately as per guidelines
            setApiKeySelected(true);
            setError(null);
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="p-4 lg:p-8 max-w-2xl mx-auto w-full flex flex-col items-center justify-center h-full text-center">
                <div className="bg-slate-800/50 p-10 rounded-3xl border border-slate-700 shadow-2xl">
                    <div className="p-4 bg-[#00aed9]/10 rounded-full inline-block mb-4">
                        <KeyRound size={32} className="text-[#00aed9]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Se requiere una Clave de API</h2>
                    <p className="text-slate-400 mb-6">
                        Para usar la generación de video con Veo, necesitas seleccionar una clave de API de un proyecto de Google Cloud con la facturación habilitada.
                        Aprende más sobre la facturación en <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">nuestra documentación</a>.
                    </p>
                    {error && (
                        <div className="my-4 p-4 bg-red-900/50 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 text-sm text-left">
                            <AlertTriangle size={20} className="flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                    <button onClick={handleSelectKey} className="w-full bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg py-3">
                        Seleccionar Clave de API
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-8 pb-20 lg:pb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Clapperboard className="text-[#00aed9]" />
              Video Studio
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Uploader and Result */}
                <div className="space-y-6">
                    <div 
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 ${
                            isDragging 
                                ? 'border-[#00aed9] bg-[#00aed9]/10 text-[#00aed9] scale-[1.02]' 
                                : 'bg-slate-800/50 border-slate-700 text-slate-500 hover:border-cyan-500 hover:text-cyan-400'
                        }`}
                    >
                       {imagePreview ? (
                            <img src={imagePreview} alt="Vista previa" className="absolute inset-0 w-full h-full object-contain rounded-3xl z-0" />
                       ) : (
                            <div className={`text-center p-8 z-10 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                                <UploadCloud size={48} className={`mx-auto mb-4 ${isDragging ? 'text-[#00aed9] animate-bounce' : ''}`} />
                                <p className="font-semibold">
                                    {isDragging ? "¡Suelta la imagen aquí!" : "Arrastra y suelta una imagen aquí"}
                                </p>
                                <p className="text-xs mt-1 opacity-70">o haz clic para seleccionar un archivo</p>
                                <input type="file" accept="image/png, image/jpeg" onChange={e => handleFileChange(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                       )}
                    </div>
                    
                    {videoUrl && !loading && (
                        <div className="space-y-4 animate-in fade-in">
                            <video src={videoUrl} controls autoPlay loop className="w-full rounded-2xl" />
                             <a href={videoUrl} download={`richard-ai-video-${Date.now()}.mp4`} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg py-3 flex items-center justify-center gap-2">
                                <Download size={16} /> Descargar Video
                            </a>
                        </div>
                    )}

                </div>

                {/* Right Column: Controls */}
                 <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
                    <div>
                        <label className="text-sm font-semibold mb-2 block">1. Describe la animación</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Un dron vuela a través de la escena..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-[#00aed9] outline-none min-h-[120px] resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-2 block">2. Elige la orientación</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setAspectRatio('16:9')} className={`py-3 rounded-lg font-bold transition-colors ${aspectRatio === '16:9' ? 'bg-[#00aed9] text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>16:9 Horizontal</button>
                            <button onClick={() => setAspectRatio('9:16')} className={`py-3 rounded-lg font-bold transition-colors ${aspectRatio === '9:16' ? 'bg-[#00aed9] text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>9:16 Vertical</button>
                        </div>
                    </div>
                     <button onClick={handleGenerate} disabled={!imageFile || loading} className="w-full bg-[#00aed9] hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg py-4 flex items-center justify-center gap-2">
                         {loading ? (
                             <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Generando...</span>
                             </>
                         ) : (
                            <>
                                <Film size={16} /> Generar Video
                             </>
                         )}
                    </button>
                     {error && (
                        <div className="p-4 bg-red-900/50 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 text-sm">
                            <AlertTriangle size={20} className="flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Animando tu imagen...</h3>
                    <p className="text-cyan-300 transition-opacity duration-500">{loadingMessage}</p>
                </div>
            )}
        </div>
    );
};

export default VideoView;
