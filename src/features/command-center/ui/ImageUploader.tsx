'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { DI } from '@/shared/di/registry';
import {
  validateImageFile,
  generateBlurPlaceholder,
} from '@/shared/api/media/imageOptimizationService';
import type { UploadResult, UploadingFile } from './imageUploaderTypes';
import { UploadingFileList } from './UploadingFileList';
// Web Worker is initialized dynamically in useEffect to comply with Next.js standards

// Re-export so existing consumers importing UploadResult from './ImageUploader' keep working
export type { UploadResult } from './imageUploaderTypes';

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

interface ImageUploaderProps {
  onUploadComplete: (results: UploadResult[]) => void;
  maxFiles?: number;
  storagePath?: string;
  existingImages?: string[];
  onLog?: (msg: string) => void;
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

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../shared/lib/workers/imageOptimizer.worker.ts', import.meta.url),
    );
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const log = useCallback(
    (msg: string) => {
      if (onLog) onLog(`[ImgUp] ${msg}`);
      console.log(`[ImgUp] ${msg}`);
    },
    [onLog],
  );

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

          // Process image with Worker
          const workerPromise = new Promise<{
            jpeg: Blob;
            width: number;
            height: number;
          }>((resolve, reject) => {
            const id = Math.random().toString(36).substring(7);

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
              options: {
                quality: 0.85,
                maxWidth: 1600,
              },
            });
          });

          const [optimizedData, blurPlaceholder, thumbnail] = await Promise.all([
            workerPromise,
            generateBlurPlaceholder(uploadFile.file),
            // Keep thumbnail on main thread for now or move to worker too (simple resize)
            new Promise<Blob>((resolve) => {
              // Simple creating of thumbnail can be done here or in worker.
              // For simplicity and to not overcomplicate worker interface yet,
              // we can re-use worker or just simple canvas here.
              // Let's use the worker for thumbnail effectively by sending another message or
              // just downscaling the result.
              // Actually, sticking to main thread for tiny thumbnail is fine for now to save complexity
              // but ideally everything should be in worker.
              // Let's use simple canvas for thumbnail on main thread for now as it's fast.
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
            jpeg: optimizedData.jpeg,
            webp: undefined, // Worker currently only does JPEG for simplicity in V1
            thumbnail: thumbnail,
            blurPlaceholder,
            savings: {
              percentage:
                ((uploadFile.file.size - optimizedData.jpeg.size) / uploadFile.file.size) * 100,
            },
          };

          // Update status to uploading
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading', progress: 50 } : f)),
          );

          const timestamp = Date.now();
          const baseFileName = `${timestamp}_${uploadFile.file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '_')}`;

          const storageRepo = DI.getStorageRepository();

          // Parallel Upload of ALL versions using Supabase via DI
          const uploadTasks: {
            type: string;
            task: Promise<string>;
          }[] = [];

          // 1. JPEG Task
          uploadTasks.push({
            type: 'jpeg',
            task: storageRepo.uploadImage(
              optimized.jpeg,
              `${storagePath}/${baseFileName}.jpg`,
              'image/jpeg',
            ),
          });

          // 2. WebP Task (if available)
          if (optimized.webp) {
            uploadTasks.push({
              type: 'webp',
              task: storageRepo.uploadImage(
                optimized.webp,
                `${storagePath}/${baseFileName}.webp`,
                'image/webp',
              ),
            });
          }

          // 3. Thumbnail Task
          uploadTasks.push({
            type: 'thumb',
            task: storageRepo.uploadImage(
              optimized.thumbnail,
              `${storagePath}/${baseFileName}_thumb.jpg`,
              'image/jpeg',
            ),
          });

          // Wait for all uploads of THIS image
          const uploadResults = await Promise.all(uploadTasks.map((t) => t.task));

          // Map results back to specific fields
          const jpegUrl = uploadResults[uploadTasks.findIndex((t) => t.type === 'jpeg')];
          const webpUrl = optimized.webp
            ? uploadResults[uploadTasks.findIndex((t) => t.type === 'webp')]
            : '';
          const thumbUrl = uploadResults[uploadTasks.findIndex((t) => t.type === 'thumb')];

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
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer group
          ${
            isDragging
              ? 'border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(0,174,217,0.15)] scale-[1.02]'
              : 'border-white/10 hover:border-primary/30 bg-slate-900/50 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(0,174,217,0.1)]'
          }
        `}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none group-hover:from-primary/10 group-hover:to-purple-500/10 transition-colors" />

        <div className="relative p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div
            className={`p-6 bg-primary/10 border border-primary/20 rounded-2xl transition-all duration-300 ${isDragging ? 'scale-110 rotate-6 shadow-[0_0_20px_rgba(0,174,217,0.2)]' : 'scale-100 rotate-0 group-hover:shadow-[0_0_15px_rgba(0,174,217,0.1)]'}`}
          >
            <Upload
              className="text-primary drop-shadow-[0_0_8px_rgba(0,174,217,0.5)]"
              size={48}
              strokeWidth={1.5}
            />
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

      <UploadingFileList files={files} onRemove={removeFile} />
    </div>
  );
};
