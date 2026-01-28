
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ShieldCheck, Settings, Info } from 'lucide-react';

interface CookieSettings {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
}

const COOKIE_KEY = 'richard_automotive_cookie_consent';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<CookieSettings>({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const saved = localStorage.getItem(COOKIE_KEY);
        if (!saved) {
            // Delay presentation for better UX
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const allAccepted = { necessary: true, analytics: true, marketing: true };
        saveConsent(allAccepted);
    };

    const handleAcceptSelected = () => {
        saveConsent(settings);
    };

    const handleRejectAll = () => {
        const onlyNecessary = { necessary: true, analytics: false, marketing: false };
        saveConsent(onlyNecessary);
    };

    const saveConsent = (data: CookieSettings) => {
        localStorage.setItem(COOKIE_KEY, JSON.stringify(data));
        setIsVisible(false);
        // Here you would trigger analytics/marketing script loading if needed
        console.log('[CookieConsent] Preferences saved:', data);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[1000]"
                >
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent pointer-events-none" />

                        <div className="relative flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-500/10 rounded-xl">
                                        <Cookie className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg tracking-tight">Privacidad & Cookies</h3>
                                </div>
                                {!showSettings && (
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="p-1 hover:bg-white/5 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {!showSettings ? (
                                <>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Utilizamos cookies para mejorar tu experiencia en nuestro Command Center 2026. Al aceptar, permites el análisis de tráfico y ofertas personalizadas.
                                    </p>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            onClick={handleAcceptAll}
                                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Aceptar Todo
                                        </button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setShowSettings(true)}
                                                className="bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Configurar
                                            </button>
                                            <button
                                                onClick={handleRejectAll}
                                                className="bg-slate-800/50 hover:bg-slate-800 text-slate-400 font-semibold py-3 rounded-2xl transition-all border border-white/5"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex flex-col gap-4"
                                >
                                    <div className="space-y-3">
                                        {/* Necessary */}
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-bold">Necesarias</span>
                                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Siempre Activadas</span>
                                            </div>
                                            <div className="w-10 h-6 bg-cyan-500 rounded-full flex items-center px-1 opacity-50 cursor-not-allowed">
                                                <div className="w-4 h-4 bg-white rounded-full translate-x-4" />
                                            </div>
                                        </div>

                                        {/* Analytics */}
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-bold">Analíticas</span>
                                                <span className="text-[10px] text-slate-400">Rendimiento y uso</span>
                                            </div>
                                            <button
                                                onClick={() => setSettings(s => ({ ...s, analytics: !s.analytics }))}
                                                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${settings.analytics ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: settings.analytics ? 16 : 0 }}
                                                    className="w-4 h-4 bg-white rounded-full"
                                                />
                                            </button>
                                        </div>

                                        {/* Marketing */}
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-bold">Marketing</span>
                                                <span className="text-[10px] text-slate-400">Publicidad dirigida</span>
                                            </div>
                                            <button
                                                onClick={() => setSettings(s => ({ ...s, marketing: !s.marketing }))}
                                                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${settings.marketing ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                            >
                                                <motion.div
                                                    animate={{ x: settings.marketing ? 16 : 0 }}
                                                    className="w-4 h-4 bg-white rounded-full"
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="flex-1 bg-white/5 text-white font-bold py-3 rounded-2xl border border-white/5"
                                        >
                                            Volver
                                        </button>
                                        <button
                                            onClick={handleAcceptSelected}
                                            className="flex-[2] bg-cyan-500 text-slate-950 font-bold py-3 rounded-2xl shadow-lg shadow-cyan-500/20"
                                        >
                                            Guardar Selección
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <a
                                href="/privacy"
                                className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1 justify-center decoration-dotted underline"
                            >
                                <Info className="w-3 h-3" />
                                Leer Política de Privacidad detallada
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieConsent;
