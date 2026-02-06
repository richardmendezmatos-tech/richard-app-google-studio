
import React, { useState, useEffect } from 'react';
import { Car } from '@/types/types';
import { generateCarMarketingContent, MarketingContent } from '@/features/leads/services/marketingService';
import { optimizeImage } from '@/services/firebaseService';
import { X, Instagram, Facebook, Video, Copy, Check, Sparkles, Loader2 } from 'lucide-react';

interface Props {
    car: Car;
    onClose: () => void;
}

export const MarketingModal: React.FC<Props> = ({ car, onClose }) => {
    const [content, setContent] = useState<MarketingContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [locale, setLocale] = useState<'es' | 'en'>('es');

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const data = await generateCarMarketingContent(car, locale);
            setContent(data);
            setLoading(false);
        };
        fetchContent();
    }, [car, locale]);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 md:p-8 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-[#00aed9] font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                            <Sparkles size={14} /> AI Marketing Engine
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
                            Campaña: <span className="text-[#00aed9]">{car.name}</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Language Toggle */}
                        <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-xl">
                            <button
                                onClick={() => setLocale('es')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${locale === 'es' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                ES
                            </button>
                            <button
                                onClick={() => setLocale('en')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${locale === 'en' ? 'bg-[#00aed9] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                EN
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                            title="Cerrar"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 text-[#00aed9] animate-spin" />
                            <p className="text-sm font-black uppercase tracking-widest text-[#00aed9] animate-pulse">Generando Estrategia Visual...</p>
                        </div>
                    ) : content && (
                        <div className="space-y-8">
                            {/* Visual Context Banner */}
                            <div className="relative h-48 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                                <img
                                    src={optimizeImage(car.img, 800)}
                                    alt={car.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center p-8">
                                    <div className="space-y-1">
                                        <div className="text-[#00aed9] font-black text-[10px] uppercase tracking-widest">Analizando Unidad</div>
                                        <div className="text-2xl font-black text-white tracking-tight uppercase">{car.name}</div>
                                        <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">{car.type} • ${Number(car.price)?.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Instagram */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-pink-500 font-bold uppercase text-xs tracking-wider">
                                            <Instagram size={18} /> Instagram
                                        </div>
                                        <button onClick={() => copyToClipboard(content.instagram, 'ig')} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all">
                                            {copiedField === 'ig' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{content.instagram}</p>
                                </div>

                                {/* Facebook */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                                            <Facebook size={18} /> Facebook
                                        </div>
                                        <button onClick={() => copyToClipboard(content.facebook, 'fb')} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all">
                                            {copiedField === 'fb' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{content.facebook}</p>
                                </div>

                                {/* TikTok Script */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase text-xs tracking-wider">
                                            <Video size={18} /> TikTok Script
                                        </div>
                                        <button onClick={() => copyToClipboard(content.tiktokScript, 'tk')} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all">
                                            {copiedField === 'tk' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 italic text-xs text-slate-500 dark:text-slate-400">
                                        {content.tiktokScript}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        Desarrollado por Richard AI • Marketing de Próxima Generación
                    </p>
                </div>
            </div>
        </div>
    );
};
