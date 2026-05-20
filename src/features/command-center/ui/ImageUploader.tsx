'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import {
  validateImageFile,
  generateBlurPlaceholder,
} from '@/shared/api/media/imageOptimizationService';
// We use the standard new URL() syntax for workers for Next.js/Turbopack compatibility.
// We use a relative path for the worker to ensure better resolution in all environments.
const WORKER_URL = new URL('../../../shared/lib/workers/imageOptimizer.worker.ts', import.meta.url);
import { optimizeImageComplete } from '@/shared/api/media/imageOptimizationService';

interface WorkerResponse {
  id: string;
  success: boolean;
  data?: {
    blob: Blob;
    width: number;
    height: number;
  };
  error?: string;
}

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
  onLog?: (msg: string) => void;
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
  storagePath = 'inventory',
  onLog,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const log = useCallback(
    (msg: string) => {
      if (onLog) onLog(`[ImgUp] ${msg}`);
      console.log(`[ImgUp] ${msg}`);
    },
    [onLog],
  );

  useEffect(() => {
    try {
      workerRef.current = new Worker(WORKER_URL);
      log('Worker initialized successfully.');
    } catch (err) {
      console.error('[ImgUp] Failed to initialize worker, will use main-thread fallback:', err);
      workerRef.current = null;
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [log]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    async (fileList: FileList) => {
      const newFiles = Array.from(fileList).slice(0, maxFiles);

      // Create preview objects
      const uploadingFiles: UploadingFile[] = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
        progress: 0,
      }));

      setFiles(uploadingFiles);

      // Process ALL files in parallel
      const uploadPromises = uploadingFiles.map(async (uploadFile, i) => {
        try {
          // Validate
          const validation = validateImageFile(uploadFile.file);
          if (!validation.valid) {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, status: 'error', error: validation.error } : f,
              ),
            );
            return null;
          }

          // Update status to optimizing
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'optimizing', progress: 10 } : f)),
          );

          // Process image: Try Worker first, fallback to Main Thread
          let optimizedResult;
          const id = Math.random().toString(36).substring(7);

          if (workerRef.current) {
            log(`Optimizing file ${i} via Worker...`);
            optimizedResult = await new Promise<{
              jpeg: Blob;
              width: number;
              height: number;
            }>((resolve, reject) => {
              const handleMessage = (e: MessageEvent<WorkerResponse>) => {
                if (e.data.id === id) {
                  workerRef.current?.removeEventListener('message', handleMessage);
                  if (e.data.success && e.data.data) {
                    resolve({
                      jpeg: e.data.data.blob,
                      width: e.data.data.width,
                      height: e.data.data.height,
                    });
                  } else {
                    reject(new Error(e.data.error || 'Worker error'));
                  }
                }
              };

              workerRef.current?.addEventListener('message', handleMessage);
              workerRef.current?.postMessage({
                file: uploadFile.file,
                id,
                options: { quality: 0.85, maxWidth: 1600 },
              });
            });
          } else {
            log(`Optimizing file ${i} via Main Thread (Fallback)...`);
            const complete = await optimizeImageComplete(uploadFile.file, {
              quality: 0.85,
              maxWidth: 1600,
              generateWebP: false,
            });
            optimizedResult = {
              jpeg: complete.jpeg,
              width: complete.dimensions.width,
              height: complete.dimensions.height,
            };
          }

          const [blurPlaceholder, thumbnail] = await Promise.all([
            generateBlurPlaceholder(uploadFile.file),
            new Promise<Blob>((resolve) => {
              const img = new Image();
              img.src = URL.createObjectURL(uploadFile.file);
              img.onload = () => {
                const cvs = document.createElement('canvas');
                const scale = 200 / img.width;
                cvs.width = 200;
                cvs.height = img.height * scale;
                cvs.getContext('2d')?.drawImage(img, 0, 0, cvs.width, cvs.height);
                cvs.toBlob((b) => resolve(b!), 'image/jpeg', 0.8);
              };
            }),
          ]);

          const optimized = {
            jpeg: optimizedResult.jpeg,
            webp: undefined,
            thumbnail: thumbnail,
            blurPlaceholder,
            savings: {
              percentage:
                ((uploadFile.file.size - optimizedResult.jpeg.size) / uploadFile.file.size) * 100,
            },
          };

          // Update status to uploading
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading', progress: 50 } : f)),
          );

          const timestamp = Date.now();
          const baseFileName = `${timestamp}_${uploadFile.file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '_')}`;

          const { supabase } = await import('@/shared/api/supabase/supabaseClient');
          const bucket = 'inventory';

          // Parallel Upload of ALL versions to Supabase
          const uploadTasks = [
            {
              type: 'jpeg',
              path: `${storagePath}/${baseFileName}.jpg`,
              file: optimized.jpeg,
              contentType: 'image/jpeg',
            },
            {
              type: 'thumb',
              path: `${storagePath}/${baseFileName}_thumb.jpg`,
              file: optimized.thumbnail,
              contentType: 'image/jpeg',
            },
          ];

          const results = await Promise.all(
            uploadTasks.map(async (task) => {
              const { data, error } = await supabase.storage
                .from(bucket)
                .upload(task.path, task.file, {
                  contentType: task.contentType,
                  upsert: true,
                });

              if (error) throw error;

              const {
                data: { publicUrl },
              } = supabase.storage.from(bucket).getPublicUrl(task.path);

              return { type: task.type, url: publicUrl };
            }),
          );

          const jpegUrl = results.find((r) => r.type === 'jpeg')?.url || '';
          const thumbUrl = results.find((r) => r.type === 'thumb')?.url || '';
          const webpUrl = ''; // WebP generation skipped for now as per legacy worker logic

          const result: UploadResult = {
            url: jpegUrl,
            webpUrl: webpUrl,
            thumbnailUrl: thumbUrl,
            blurPlaceholder: optimized.blurPlaceholder,
            originalSize: uploadFile.file.size,
            optimizedSize: optimized.jpeg.size,
            savings: optimized.savings.percentage,
          };

          // Update status to complete
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'complete', progress: 100, result } : f,
            ),
          );

          return result;
        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'error', error: errorMessage } : f)),
          );
          return null;
        }
      });

      // Wait for all file uploads to finish
      const finalResultsArr = await Promise.all(uploadPromises);
      const successfulResults = finalResultsArr.filter((r): r is UploadResult => r !== null);

      // Notify parent
      log(`Parallel processing complete. Success count: ${successfulResults.length}`);
      if (successfulResults.length > 0) {
        onUploadComplete(successfulResults);
      }
    },
    [maxFiles, storagePath, onUploadComplete, log],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
    },
    [processFiles],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
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
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer
          ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10 scale-[1.02]'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
          }
        `}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-cyan-900/10 to-purple-900/10 pointer-events-none" />

        <div className="relative p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div
            className={`p-6 bg-cyan-500/10 rounded-2xl transition-transform ${isDragging ? 'scale-110 rotate-6' : 'scale-100 rotate-0'}`}
          >
            <Upload className="text-cyan-500" size={48} strokeWidth={2} />
          </div>

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
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg route-fade-in">
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                💾 Ahorro: {(totalSavings / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          max={maxFiles}
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Seleccionar imágenes para subir"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3 route-fade-in">
          {files.map((file, index) => (
            <div
              key={index}
              className="glass-premium p-4 rounded-xl flex items-center gap-4 delay-var"
              style={{ '--d': `${Math.min(index * 45, 220)}ms` } as React.CSSProperties}
            >
              {/* Preview */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                <img
                  loading="lazy"
                  decoding="async"
                  src={file.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{file.file.name}</p>
                <p className="text-xs text-slate-400">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {/* Progress Bar */}
                {(file.status === 'optimizing' || file.status === 'uploading') && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ '--progress-width': `${file.progress}%` } as React.CSSProperties}
                        className="h-full bg-linear-to-r from-cyan-500 to-purple-500 progress-bar-width"
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
                    Optimizado:{' '}
                    {((file.result.originalSize - file.result.optimizedSize) / 1024 / 1024).toFixed(
                      2,
                    )}{' '}
                    MB ahorrados
                  </p>
                )}
              </div>

              {/* Status Icon */}
              <div className="shrink-0">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
