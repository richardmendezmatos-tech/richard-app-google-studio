import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, DownloadCloud } from 'lucide-react';

const ReloadPrompt = () => {
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-bottom-5 fade-in">
            <div className="bg-[#0d2232] border border-[#00aed9]/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white min-w-[300px]">
                <div className="p-3 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-xl relative">
                    <DownloadCloud size={20} className="text-white relative z-10" />
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></div>
                </div>

                <div className="flex-1">
                    <h4 className="font-bold text-sm">
                        {offlineReady ? 'App lista para offline' : 'Nueva versión disponible'}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                        {offlineReady ? 'Ya puedes usar la app sin internet.' : 'Recarga para ver los cambios.'}
                    </p>
                </div>

                {needRefresh && (
                    <button
                        className="px-4 py-2 bg-white text-[#0d2232] rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                        onClick={() => updateServiceWorker(true)}
                    >
                        <RefreshCw size={14} /> Recargar
                    </button>
                )}

                <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs"
                    onClick={close}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default ReloadPrompt;
