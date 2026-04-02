"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const [mounted, setMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Richard Sentinel: Hydration sync (Deferred to avoid cascading renders)
    const timer = setTimeout(() => {
      setMounted(true);
      setIsOffline(!navigator.onLine);
    }, 0);

    const syncStatus = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', syncStatus);
    window.addEventListener('offline', syncStatus);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', syncStatus);
      window.removeEventListener('offline', syncStatus);
    };
  }, []);

  // Sentinel Hydration Shield: Avoid SSR/Client mismatch by returning null until mounted
  if (!mounted || !isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-rose-600/90 backdrop-blur-md text-white py-2 px-4 shadow-2xl flex items-center justify-center gap-3 animate-in slide-in-from-bottom-full duration-500 border-t border-white/10">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
        <WifiOff size={14} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
        Modo Offline Activo <span className="mx-2 opacity-40">•</span> Sincronización Sentinel Pausada
      </span>
    </div>
  );
};

export default OfflineIndicator;
