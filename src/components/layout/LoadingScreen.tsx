import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-[#00aed9]" />
                <p className="text-sm font-bold uppercase tracking-widest">Cargando...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
