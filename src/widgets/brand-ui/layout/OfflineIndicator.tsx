"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  const [mounted, setMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial status only on client mount
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
