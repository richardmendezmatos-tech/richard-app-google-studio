"use client";

import React, { useState, useRef } from 'react';
import { X, Wand2, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import { Car, CarType } from '@/shared/types/types';
import { useDealer } from '@/entities/dealer';
import { ImageUploader, type UploadResult } from './ImageUploader';
import { blobToBase64 } from '@/shared/api/media/imageOptimizationService';

interface AdminModalProps {
  car: Car | null;
  onClose: () => void;
  onSave: (data: Omit<Car, 'id'>) => Promise<void>;
  onPhotoUploaded?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  car,
  onClose,
  onSave,
  onPhotoUploaded,
}) => {
  const { currentDealer } = useDealer();
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState(car?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTier, setAiTier] = useState<'Standard' | 'Premium' | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const logDebug = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
    console.log(`Strategic Deep Debug Console: ${msg}`);
  };

  // AI Generation
  const generateAIDescription = async () => {
    // Collect basic info
    const form = document.querySelector('form');
    if (!form) return;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const features = (formData.get('features') as string).split(',').filter((f) => f.trim() !== '');
    const price = Number(formData.get('price'));

    if (!name) {
      alert('Por favor ingresa primero el nombre del vehículo.');
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
      const prompt = `Genera una descripción profesional y atractiva para la venta de este vehículo: ${name}.
            Características principales: ${features.join(', ')}.
            Precio: $${price}.
            El tono debe ser persuasivo, resaltando el valor y la oportunidad.
            
            ADICIONAL: Si se incluye una imagen, analiza visualmente el vehículo y menciona detalles específicos que veas (color, rines, estado de la pintura, extras visibles) para hacer la descripción más auténtica.`;

      // VISION UPGRADE: Prepare multimodal contents
      let contents: unknown[] = [prompt];

      if (uploadResults.length > 0) {
        try {
          const firstImageUrl = uploadResults[0].url;
          // Fetch the image and convert to base64 for Gemini
          const imgResponse = await fetch(firstImageUrl);
          const blob = await imgResponse.blob();
          const base64Data = await blobToBase64(blob);

          // Remove data:image/jpeg;base64, prefix
          const base64Content = base64Data.split(',')[1];

          contents = [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: blob.type,
                    data: base64Content,
                  },
                },
              ],
            },
          ];
          logDebug('AI Vision: Imagen enviada exitosamente para análisis.');
        } catch (imgError) {
          console.error('Error preparing vision data:', imgError);
          logDebug('AI Vision: Fallo al cargar imagen, procediendo solo con texto.');
        }
      }

      const { functions } = await import('@/shared/api/firebase/client');
      const { httpsCallable } = await import('firebase/functions');
      const askGemini = httpsCallable<any, string>(functions, 'askGemini');

      const response = await askGemini({
        contents,
        model: 'gemini-1.5-flash',
        systemInstruction:
          'Eres un vendedor experto de autos nuevos y usados de lujo en Puerto Rico. Escribe en español latino de forma entusiasta pero profesional. Si recibes una imagen, úsala para personalizar la descripción.',
      });

      setDescription(response.data);
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Error generando descripción. Intenta nuevamente.');
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
      logDebug('Submit gate triggered...');
      if (!formRef.current) {
        logDebug('!!! CRITICAL: formRef.current is null!');
        throw new Error('Referencia al formulario perdida.');
      }

      const fd = new FormData(formRef.current);
      logDebug(`FormData extracted. Name: ${fd.get('name')}`);

      // Collect all image URLs from upload results
      const finalImageUrls: string[] = [];

      // Add newly uploaded images FIRST (so the most recent upload becomes the main one)
      uploadResults.forEach((result) => {
        if (result.url) finalImageUrls.push(result.url);
        // Also add webpUrl if present as secondary
        if (result.webpUrl) finalImageUrls.push(result.webpUrl);
      });

      // Keep existing images AFTER
      if (car?.images) {
        // Filter out duplicates if any
        const existing = car.images.filter((url) => !finalImageUrls.includes(url));
        finalImageUrls.push(...existing);
      }

      logDebug(`Total images to save: ${finalImageUrls.length}`);
      if (uploadResults.length > 0) {
        const totalSavings = uploadResults.reduce((sum, r) => sum + (r.savings || 0), 0);
        logDebug(`Optimization metrics: ${totalSavings.toFixed(0)}% saved`);
      }

      // Ensure we have at least one image
      const mainImage = finalImageUrls.length > 0 ? finalImageUrls[0] : '';
      logDebug(`Main image identified: ${mainImage.substring(0, 30)}...`);

      logDebug('Persisting document to Firestore...');
      await onSave({
        name: fd.get('name') as string,
        price: Number(fd.get('price')),
        type: fd.get('type') as CarType,
        badge: fd.get('badge') as string,
        img: mainImage, // Main thumbnail for backward compatibility
        images: finalImageUrls, // New Gallery Array
        description: description,
        features: (fd.get('features') as string).split(',').map((f) => f.trim()),
        dealerId: currentDealer.id || 'richard-automotive', // Enforcement
      });
      logDebug('✅ SUCCESS: Document saved successfully.');
      onClose(); // Close only after success
    } catch (error) {
      logDebug(`!!! ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Upload/Save Strategic Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(errorMsg); // Show persistent UI error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/80 backdrop-blur-2xl animate-in fade-in">
      <div className="bg-slate-900/95 backdrop-blur-3xl w-full sm:max-w-7xl sm:rounded-4xl rounded-t-4xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom border border-white/5 max-h-[92vh] flex flex-col relative">
        {/* Glow effect back */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-70" />

        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-transparent z-10 sticky top-0 backdrop-blur-xl">
          <div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(0,174,217,0.8)]" />
              Editor de Inventario
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              {car ? 'Editar Unidad' : 'Nueva Unidad'}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 border border-white/5 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side: Media & Preview */}
          <div className="w-full lg:w-1/2 p-8 bg-slate-950/30 border-r border-white/5 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(0,174,217,0.5)]" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Multimedia y Galería
                </h3>
              </div>

              {/* Image Uploader */}
              <ImageUploader onUploadComplete={handleUploadComplete} onLog={logDebug} />

              {/* Stats or Preview Placeholder */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-3 text-primary mb-3 relative z-10">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Sugerencia Pro
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed relative z-10">
                  Las unidades con más de 5 fotos de alta calidad tienen un{' '}
                  <strong className="text-white">40% más de probabilidad</strong> de ser vendidas en
                  la primera semana. Asegúrate de incluir interiores y motor.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Data Form */}
          <div className="w-full lg:w-1/2 p-8 overflow-y-auto custom-scrollbar bg-transparent">
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-wide">
                    Error al Guardar
                  </h4>
                  <p className="text-xs text-rose-300 mt-1 font-mono">{errorMessage}</p>
                </div>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Detalles Técnicos
                </h3>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2 group">
                  <label
                    htmlFor="admin-car-name"
                    className="text-[10px] font-black text-slate-500 group-focus-within:text-primary transition-colors uppercase tracking-widest ml-1"
                  >
                    Nombre de la Unidad
                  </label>
                  <input
                    id="admin-car-name"
                    name="name"
                    defaultValue={car?.name}
                    required
                    className="w-full h-[56px] px-5 bg-slate-900/50 rounded-2xl font-bold outline-none border border-white/5 focus:bg-slate-900 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,174,217,0.15)] transition-all text-white placeholder:text-slate-600"
                    placeholder="Ej. Toyota Corolla GR"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 group">
                    <label
                      htmlFor="admin-car-price"
                      className="text-[10px] font-black text-slate-500 group-focus-within:text-primary transition-colors uppercase tracking-widest ml-1"
                    >
                      Precio (USD)
                    </label>
                    <input
                      id="admin-car-price"
                      name="price"
                      type="number"
                      defaultValue={car?.price}
                      required
                      className="w-full h-[56px] px-5 bg-slate-900/50 rounded-2xl font-bold outline-none border border-white/5 focus:bg-slate-900 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,174,217,0.15)] transition-all text-white placeholder:text-slate-600"
                      placeholder="25000"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label
                      htmlFor="admin-car-badge"
                      className="text-[10px] font-black text-slate-500 group-focus-within:text-primary transition-colors uppercase tracking-widest ml-1"
                    >
                      Etiqueta (Badge)
                    </label>
                    <input
                      id="admin-car-badge"
                      name="badge"
                      defaultValue={car?.badge}
                      className="w-full h-[56px] px-5 bg-slate-900/50 rounded-2xl font-bold outline-none border border-white/5 focus:bg-slate-900 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,174,217,0.15)] transition-all text-white placeholder:text-slate-600"
                      placeholder="Ej. Recién Llegado"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2 group">
                  <label
                    htmlFor="admin-car-type"
                    className="text-[10px] font-black text-slate-500 group-focus-within:text-primary transition-colors uppercase tracking-widest ml-1"
                  >
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      id="admin-car-type"
                      name="type"
                      defaultValue={car?.type || 'suv'}
                      className="w-full h-[56px] px-5 bg-slate-900/50 rounded-2xl font-bold outline-none border border-white/5 focus:bg-slate-900 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,174,217,0.15)] transition-all text-white appearance-none"
                    >
                      <option value="suv" className="bg-slate-800 text-white">
                        🚙 SUV / Crossover
                      </option>
                      <option value="sedan" className="bg-slate-800 text-white">
                        🚗 Sedan / Coupe
                      </option>
                      <option value="pickup" className="bg-slate-800 text-white">
                        🛻 Pickup / Truck
                      </option>
                      <option value="luxury" className="bg-slate-800 text-white">
                        💎 Luxury / Sport
                      </option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-white">
                      <X size={16} className="rotate-45" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label
                    htmlFor="admin-car-features"
                    className="text-[10px] font-black text-slate-500 group-focus-within:text-primary transition-colors uppercase tracking-widest ml-1"
                  >
                    Características (Separadas por coma)
                  </label>
                  <input
                    id="admin-car-features"
                    name="features"
                    defaultValue={car?.features?.join(', ')}
                    className="w-full h-[56px] px-5 bg-slate-900/50 rounded-2xl font-bold outline-none border border-white/5 focus:bg-slate-900 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,174,217,0.15)] transition-all text-white placeholder:text-slate-600"
                    placeholder="GPS, Cuero, Techo Panorámico..."
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="description-field"
                    className="text-[10px] font-black text-slate-500 group-focus-within:text-primary transition-colors uppercase tracking-widest ml-1"
                  >
                    Descripción Narrativa
                  </label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    disabled={isGenerating}
                    className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-primary hover:text-white transition-all disabled:opacity-50 border border-primary/20 hover:border-transparent hover:shadow-[0_0_15px_rgba(0,174,217,0.4)]"
                  >
                    {isGenerating ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Wand2 size={12} />
                    )}
                    {isGenerating ? 'Escribiendo...' : 'Mejorar con IA ✨'}
                  </button>
                </div>
                <textarea
                  id="description-field"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-5 bg-slate-900/50 rounded-3xl font-medium outline-none border border-white/5 focus:bg-slate-900 focus:border-primary/50 focus:shadow-[0_0_15px_rgba(0,174,217,0.15)] transition-all text-white placeholder:text-slate-600 resize-none"
                  placeholder="Escribe la historia de este vehículo..."
                />
                {aiTier && (
                  <span
                    className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${aiTier === 'Premium' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                  >
                    IA Engine: {aiTier}
                  </span>
                )}
              </div>

              {/* Strategic Debug Console */}
              {debugLogs.length > 0 && (
                <div className="p-5 bg-black/50 rounded-3xl border border-rose-500/20 space-y-2 backdrop-blur-md">
                  <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                    Log de Diagnóstico (IT)
                  </div>
                  <div className="max-h-24 overflow-y-auto custom-scrollbar">
                    {debugLogs.map((log, i) => (
                      <div
                        key={i}
                        className="text-[8px] font-mono text-slate-400 break-all leading-relaxed"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full h-[64px] bg-gradient-to-r from-primary/80 to-purple-600/80 hover:from-primary hover:to-purple-500 text-white rounded-3xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(0,174,217,0.3)] hover:shadow-[0_0_30px_rgba(0,174,217,0.5)] disabled:opacity-50 flex items-center justify-center gap-3 border border-white/10"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Sincronizando...</span>
                    </>
                  ) : (
                    <span>Guardar en Inventario</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
