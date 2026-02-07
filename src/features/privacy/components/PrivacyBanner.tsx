import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, ChevronRight, Lock, Eye, BarChart3, Zap } from 'lucide-react';
import { PrivacySettings } from '@/types/types';
import { getPrivacySettings, savePrivacySettings } from '@/services/privacyService';

const PrivacyConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [settings, setSettings] = useState<PrivacySettings | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const current = await getPrivacySettings();
            setSettings(current);

            // Show banner if not recently updated or if significant update required
            const lastUpdated = current.lastUpdated || 0;
            const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            if (lastUpdated < oneMonthAgo) {
                setIsVisible(true);
            }
        };
        loadSettings();
    }, []);

    const handleAcceptAll = async () => {
        if (!settings) return;
        const allOn: PrivacySettings = {
            ...settings,
            analytics: true,
            aiData: true,
            marketing: true,
            partnerSharing: true
        };
        await savePrivacySettings(allOn);
        setIsVisible(false);
    };

    const handleSavePreferences = async () => {
        if (!settings) return;
        await savePrivacySettings(settings);
        setIsVisible(false);
    };

    const toggleSetting = (key: keyof PrivacySettings) => {
        if (!settings || key === 'essential' || key === 'lastUpdated') return;
        setSettings({ ...settings, [key]: !settings[key] });
    };

    if (!isVisible || !settings) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-10 md:w-[450px] z-[9999]"
            >
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-6 overflow-hidden relative group">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00aed9]/10 rounded-full blur-3xl -mr-10 -mt-10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-[#00aed9]/20 rounded-xl">
                                <Shield className="text-[#00aed9]" size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Privacidad Richard AI</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">GDPR & Compliance Hub</p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="ml-auto text-slate-500 hover:text-white transition-colors"
                                title="Cerrar banner de privacidad"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {!showDetails ? (
                            <>
                                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                    Utilizamos tecnologías de IA y análisis para mejorar tu experiencia. Tú tienes el control total sobre tus datos.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleAcceptAll}
                                        className="w-full py-3 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                                    >
                                        Aceptar Todo
                                    </button>
                                    <button
                                        onClick={() => setShowDetails(true)}
                                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-black text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2"
                                    >
                                        Personalizar Preferencias <ChevronRight size={14} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                    <PrivacyToggle
                                        icon={Lock}
                                        title="Esencial"
                                        description="Necesario para el funcionamiento."
                                        enabled={true}
                                        locked={true}
                                        onToggle={() => { }}
                                    />
                                    <PrivacyToggle
                                        icon={BarChart3}
                                        title="Analíticas"
                                        description="Mejora del rendimiento y errores."
                                        enabled={settings.analytics}
                                        onToggle={() => toggleSetting('analytics')}
                                    />
                                    <PrivacyToggle
                                        icon={Zap}
                                        title="IA & Gemelo Digital"
                                        description="Entrenamiento de modelos con tus datos."
                                        enabled={settings.aiData}
                                        onToggle={() => toggleSetting('aiData')}
                                    />
                                    <PrivacyToggle
                                        icon={Eye}
                                        title="Marketing"
                                        description="Promociones y ofertas personalizadas."
                                        enabled={settings.marketing}
                                        onToggle={() => toggleSetting('marketing')}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        onClick={handleSavePreferences}
                                        className="flex-[2] py-3 bg-[#00aed9] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                                    >
                                        Guardar Selección
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

interface PrivacyToggleProps {
    icon: React.ElementType;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    locked?: boolean;
}

const PrivacyToggle = ({ icon: Icon, title, description, enabled, onToggle, locked = false }: PrivacyToggleProps) => (
    <div
        onClick={!locked ? onToggle : undefined}
        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${enabled ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-800/50 border-white/5'
            }`}
    >
        <div className={`p-2 rounded-lg ${enabled ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
            <Icon size={16} />
        </div>
        <div className="flex-1 text-left">
            <div className="text-xs font-black text-white uppercase tracking-tight">{title}</div>
            <div className="text-[10px] text-slate-500 font-medium leading-tight">{description}</div>
        </div>
        <div className={`w-10 h-5 rounded-full relative transition-colors ${enabled ? 'bg-cyan-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enabled ? 'left-6' : 'left-1'}`} />
        </div>
    </div>
);

export default PrivacyConsent;
