'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse" />
        <span className="relative font-black text-4xl lg:text-6xl text-white tracking-[0.2em] opacity-80 uppercase">
          Richard <span className="text-cyan-400">Auto</span>
        </span>
      </div>
      <div className="flex gap-2 items-end h-12" role="status" aria-label="Cargando contenido">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1.5 bg-linear-to-t from-cyan-600 to-cyan-400 rounded-full animate-wave"
            style={{ animationDelay: `${i * 0.1}s`, height: `${20 + i * 8}px` }}
          />
        ))}
        <span className="sr-only">Cargando...</span>
      </div>
      <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] animate-pulse">
        Sincronizando Inventario Premium...
      </p>
      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
        .animate-wave {
          animation: wave 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
