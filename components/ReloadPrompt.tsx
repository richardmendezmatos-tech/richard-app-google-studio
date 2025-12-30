import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const ReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered: ' + r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-white max-w-sm animate-fade-in-up">
            <div className="flex items-start gap-3">
                {needRefresh ? (
                    <RefreshCw className="w-5 h-5 text-cyan-400 mt-1 animate-spin-slow" />
                ) : (
                    <div className="w-5 h-5 text-green-400 mt-1">✓</div>
                )}
                <div className="flex-1">
                    {offlineReady ? (
                        <p className="text-sm font-medium">App lista para usar sin conexión.</p>
                    ) : (
                        <p className="text-sm font-medium">Nueva versión disponible.</p>
                    )}
                </div>
                <button onClick={close} className="text-slate-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {needRefresh && (
                <button
                    onClick={() => updateServiceWorker(true)}
                    className="mt-2 w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-md transition-colors"
                >
                    Actualizar ahora
                </button>
            )}
        </div>
    );
};

export default ReloadPrompt;
