import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-red-600 text-white py-2 px-4 shadow-lg flex items-center justify-center gap-2 animate-in slide-in-from-bottom-full duration-500">
            <WifiOff size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Modo Offline Activo • Viendo datos guardados</span>
        </div>
    );
};

export default OfflineIndicator;
