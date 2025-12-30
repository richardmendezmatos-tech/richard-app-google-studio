
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { ImageIcon, Download, AlertTriangle, Trash2, GalleryThumbnails, Search, ScanLine } from 'lucide-react';

const IMAGE_HISTORY_KEY = 'richard_ai_image_history';

interface Props {
    onSearchSimilar?: (base64: string) => void;
}

const ImageView: React.FC<Props> = ({ onSearchSimilar }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>(() => {
    try {
      const savedImages = localStorage.getItem(IMAGE_HISTORY_KEY);
      return savedImages ? JSON.parse(savedImages) : [];
    } catch (error) {
      console.error("Error al cargar el historial de imágenes:", error);
      return [];
    }
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(IMAGE_HISTORY_KEY, JSON.stringify(images));
    } catch (error) {
      console.error("Error al guardar el historial de imágenes:", error);
    }
  }, [images]);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const imageUrl = await generateImage(prompt);
      // Las fechas de JSON necesitan ser reconstituidas a objetos Date
      const newImage: GeneratedImage = { url: imageUrl, prompt, timestamp: new Date() };
      setImages(prev => [newImage, ...prev]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que deseas borrar todo el historial de imágenes?')) {
        setImages([]);
    }
  };

  const handleSearchSimilar = (imgUrl: string) => {
      if (!onSearchSimilar) return;
      // Convert data URL to base64 raw string (remove header)
      const base64 = imgUrl.split(',')[1];
      if (base64) {
          onSearchSimilar(base64);
      }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto w-full space-y-8 pb-20 lg:pb-8">
      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="text-[#00aed9]" />
              Image Forge
            </h2>
            {images.length > 0 && (
                <button 
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-lg transition-colors"
                >
                    <Trash2 size={14} />
                    Limpiar Historial
                </button>
            )}
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Un Hyundai Santa Cruz en una selva tropical en Marte, estilo fotorealista..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-[#00aed9] outline-none min-h-[100px] resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="md:w-32 bg-[#00aed9] hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Forjar'
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500/30 text-red-300 rounded-xl flex items-center gap-3 text-sm animate-in fade-in">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.length === 0 && !loading && (
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center p-12 bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-700 text-slate-500">
                <GalleryThumbnails size={48} className="mb-4 opacity-50" />
                <h3 className="font-bold text-lg text-slate-400">Tu galería está vacía</h3>
                <p className="text-sm">Usa el generador de arriba para forjar tu primera imagen.</p>
            </div>
        )}

        {images.map((img, idx) => (
          <div key={idx} className="group relative bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl hover:shadow-cyan-500/10 transition-all animate-in fade-in zoom-in">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end gap-2">
              <p className="text-xs text-slate-300 line-clamp-2 mb-2">{img.prompt}</p>
              
              <div className="flex gap-2">
                  <a 
                    href={img.url}
                    download={`richard-ai-image-${new Date(img.timestamp).getTime()}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 transition-colors"
                  >
                    <Download size={14} />
                    Guardar
                  </a>
                  
                  {onSearchSimilar && (
                      <button 
                        onClick={() => handleSearchSimilar(img.url)}
                        className="flex-1 bg-[#00aed9] hover:bg-cyan-500 text-white py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-1 transition-colors shadow-lg"
                        title="Buscar autos similares en el inventario real"
                      >
                        <ScanLine size={14} />
                        Buscar Similar
                      </button>
                  )}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="aspect-square bg-slate-800 rounded-2xl border border-slate-700 border-dashed flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#00aed9] animate-pulse" />
            </div>
            <p className="text-sm text-slate-500 font-medium italic">Creando tu visión...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageView;
