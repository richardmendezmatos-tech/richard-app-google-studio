import React, { useState, useEffect } from 'react';
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
        <div className="fixed bottom-6 left-6 right-6 z-[9999] route-fade-in md:left-auto md:right-10 md:w-[450px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-2xl group">
                <div className="absolute -mr-10 -mt-10 right-0 top-0 h-32 w-32 rounded-full bg-[#00aed9]/10 blur-3xl" />

                <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-[#00aed9]/20 p-2.5">
                            <Shield className="text-[#00aed9]" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-white">Privacidad Richard AI</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GDPR & Compliance Hub</p>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="ml-auto text-slate-500 transition-colors hover:text-white"
                            title="Cerrar banner de privacidad"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {!showDetails ? (
                        <>
                            <p className="mb-6 text-sm leading-relaxed text-slate-300">
                                Utilizamos tecnologias de IA y analisis para mejorar tu experiencia. Tu tienes el control total sobre tus datos.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleAcceptAll}
                                    className="w-full rounded-xl bg-[#00aed9] py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-500 active:scale-[0.98]"
                                >
                                    Aceptar Todo
                                </button>
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-3 text-xs font-black uppercase tracking-[0.1em] text-slate-300 transition-all hover:bg-white/10"
                                >
                                    Personalizar Preferencias <ChevronRight size={14} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 fade-in space-y-4 duration-300">
                            <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2">
                                <PrivacyToggle
                                    icon={Lock}
                                    title="Esencial"
                                    description="Necesario para el funcionamiento."
                                    enabled={true}
                                    locked={true}
                                    onToggle={() => {}}
                                />
                                <PrivacyToggle
                                    icon={BarChart3}
                                    title="Analiticas"
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
                                    className="flex-1 rounded-xl bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-white"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleSavePreferences}
                                    className="flex-[2] rounded-xl bg-[#00aed9] py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                                >
                                    Guardar Seleccion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
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
