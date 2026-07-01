'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import type { UploadingFile } from './imageUploaderTypes';

interface Props {
  files: UploadingFile[];
  onRemove: (index: number) => void;
}

/**
 * Lista de archivos en subida (preview, progreso, estado) extraída de ImageUploader.
 * Presentacional: recibe los archivos y el callback para eliminar.
 */
export function UploadingFileList({ files, onRemove }: Props) {
  if (files.length === 0) return null;
  return (
        <div className="space-y-3 route-fade-in">
          {files.map((file, index) => (
            <div
              key={index}
              style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
              className="glass-premium p-4 rounded-xl flex items-center gap-4"
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
                    <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                      <div
                        style={{ width: `${file.progress}%` }}
                        className="h-full bg-linear-to-r from-primary to-purple-500 shadow-[0_0_10px_rgba(0,174,217,0.5)] transition-all duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-primary/70 mt-1 uppercase tracking-widest font-bold">
                      {file.status === 'optimizing' ? 'Optimizando...' : 'Subiendo...'}
                    </p>
                  </div>
                )}

                {/* Error */}
                {file.status === 'error' && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 bg-rose-500/10 py-1 px-2 rounded-md border border-rose-500/20 inline-flex">
                    <AlertCircle size={12} className="text-rose-500" />
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
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_10px_rgba(0,174,217,0.2)]">
                    <Loader2 size={16} className="text-primary animate-spin" />
                  </div>
                )}
                {file.status === 'complete' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                )}
                {file.status === 'error' && (
                  <button
                    onClick={() => onRemove(index)}
                    aria-label="Eliminar imagen"
                    className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
                  >
                    <X size={16} className="text-rose-400" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
  );
}
