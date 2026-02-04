
import React, { useState } from 'react';
import { usePrivacy } from '../context/PrivacyContext';
import { Shield, X, Check, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PrivacyBanner: React.FC = () => {
    const { hasConsented, acceptAll, updateSettings } = usePrivacy();
    const [showPersonalize, setShowPersonalize] = useState(false);

    if (hasConsented) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-6 right-6 z-[9999] md:left-auto md:max-w-xl"
            >
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl rounded-[32px] p-6 md:p-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                            <Shield size={24} />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-2 uppercase tracking-tighter">
                                Tu Privacidad, Tu Control 🛡️
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                En Richard Automotive usamos cookies y datos para mejorar tu experiencia y ofrecerte ofertas personalizadas. ¿Nos das tu consentimiento?
                            </p>

                            {!showPersonalize ? (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={acceptAll}
                                        className="px-6 py-3 bg-[#00aed9] text-white rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <Check size={18} /> Aceptar Todo
                                    </button>
                                    <button
                                        onClick={() => setShowPersonalize(true)}
                                        className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
                                    >
                                        <Settings2 size={18} /> Personalizar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <PrivacyToggle
                                            label="Analíticas"
                                            description="Ayúdanos a mejorar sabiendo cómo usas la app."
                                            onChange={(val) => updateSettings({ analytics: val })}
                                        />
                                        <PrivacyToggle
                                            label="Marketing"
                                            description="Recibe ofertas exclusivas de Richard Automotive."
                                            onChange={(val) => updateSettings({ marketing: val })}
                                        />
                                        <PrivacyToggle
                                            label="Compartir con Socios"
                                            description="Facilita tu proceso de crédito con bancos aliados."
                                            onChange={(val) => updateSettings({ partnerSharing: val })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => updateSettings({})} // Trigger consent with current choices
                                        className="w-full py-4 bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-2xl font-black uppercase text-sm transition-all"
                                    >
                                        Guardar Preferencias
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => updateSettings({})} // Default decline/limited
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const PrivacyToggle: React.FC<{ label: string; description: string; onChange: (val: boolean) => void }> = ({ label, description, onChange }) => {
    const [enabled, setEnabled] = useState(false);

    return (
        <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{description}</p>
            </div>
            <button
                onClick={() => {
                    const next = !enabled;
                    setEnabled(next);
                    onChange(next);
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );
};

export default PrivacyBanner;
