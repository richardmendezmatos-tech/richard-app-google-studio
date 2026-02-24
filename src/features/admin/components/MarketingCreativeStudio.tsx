import React, { useState, useEffect } from 'react';
import { Car } from '@/types/types';
import { generateCarMarketingContent, MarketingContent } from '@/features/leads/services/marketingService';
import { optimizeImage } from '@/services/firebaseShared';
import {
    X,
    Instagram,
    Facebook,
    Video,
    Copy,
    Check,
    Sparkles,
    Loader2,
    Layout,
    Type,
    Image as ImageIcon,
    Share2,
    MessageCircle,
    Download,
    Zap
} from 'lucide-react';

interface Props {
    car: Car;
    onClose: () => void;
}

export const MarketingCreativeStudio: React.FC<Props> = ({ car, onClose }) => {
    const [content, setContent] = useState<MarketingContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [locale, setLocale] = useState<'es' | 'en'>('es');
    const [activeTab, setActiveTab] = useState<'text' | 'visuals'>('text');

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

    const handleWhatsAppShare = () => {
        if (!content) return;
        const text = encodeURIComponent(content.facebook || content.instagram);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 md:p-8 animate-in fade-in duration-500">
            <div className="bg-[#0f172a] rounded-[48px] max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10 relative">

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00aed9]/10 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-[#00aed9]/20 flex items-center justify-center border border-[#00aed9]/30">
                            <Sparkles className="text-[#00aed9]" size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-full bg-[#00aed9]/10 text-[#00aed9] text-[9px] font-black uppercase tracking-widest border border-[#00aed9]/20">AI Engine 2.0</span>
                                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Creative Studio</h2>
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{car.name} • <span className="text-white/60">Multichannel Distribution</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Tab Switcher */}
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'text' ? 'bg-[#00aed9] text-white shadow-[0_0_20px_rgba(0,174,217,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Type size={16} /> Copywriting
                            </button>
                            <button
                                onClick={() => setActiveTab('visuals')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'visuals' ? 'bg-[#00aed9] text-white shadow-[0_0_20px_rgba(0,174,217,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <ImageIcon size={16} /> Visual Assets
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            <button
                                onClick={() => setLocale('es')}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${locale === 'es' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                            >
                                ES
                            </button>
                            <button
                                onClick={() => setLocale('en')}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${locale === 'en' ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                            >
                                EN
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                            title="Cerrar Studio"
                            aria-label="Cerrar Studio"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 custom-scrollbar relative z-10">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 space-y-6">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-[#00aed9] animate-spin" />
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00aed9]/50 animate-pulse" size={24} />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xl font-black uppercase tracking-[0.2em] text-white">Generando Omnicanalidad...</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">Analizando psicología de ventas y ganchos visuales</p>
                            </div>
                        </div>
                    ) : content && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            {/* Left Column: Asset Preview */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="group relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-black">
                                    <img
                                        src={optimizeImage(car.img, 800)}
                                        alt={car.name}
                                        className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-110 opacity-70"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                                    {/* Overlay Content Preview */}
                                    <div className="absolute bottom-10 left-10 right-10">
                                        <div className="px-4 py-2 bg-[#00aed9] w-fit rounded-lg text-[10px] font-black text-white uppercase tracking-widest mb-4 shadow-xl">
                                            Premium Unit
                                        </div>
                                        <h3 className="text-5xl font-black text-white tracking-tighter uppercase mb-2 leading-none">{car.name}</h3>
                                        <p className="text-lg font-bold text-[#00aed9] tracking-tight uppercase">${Number(car.price)?.toLocaleString()} <span className="text-white/40 ml-2">• {car.type}</span></p>
                                    </div>

                                    {/* Brand Badge */}
                                    <div className="absolute top-10 right-10 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                        <Zap size={14} className="text-[#00aed9] fill-[#00aed9]" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Richard Auto</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sugerencia de Distribución</h4>
                                    <p className="text-xs text-slate-300 leading-relaxed font-medium">Publicar a las <span className="text-white">18:00 (Prime Time)</span> para maximizar el engagement en Instagram y Facebook Marketplace.</p>
                                </div>
                            </div>

                            {/* Right Column: Creative Output */}
                            <div className="lg:col-span-7">
                                {activeTab === 'text' ? (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        {/* Instagram */}
                                        <div className="bg-white/[0.03] p-8 rounded-[38px] border border-white/5 space-y-6 hover:border-[#00aed9]/20 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center shadow-lg">
                                                        <Instagram size={20} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Instagram & Feed</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Lifestyle & Aspirational</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(content.instagram, 'ig')}
                                                    className="p-4 bg-white/5 hover:bg-[#00aed9]/20 rounded-2xl text-slate-400 hover:text-[#00aed9] transition-all"
                                                    title="Copiar contenido de Instagram"
                                                    aria-label="Copiar contenido de Instagram"
                                                >
                                                    {copiedField === 'ig' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                                </button>
                                            </div>
                                            <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                                                <p className="text-md text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">{content.instagram}</p>
                                            </div>
                                        </div>

                                        {/* Facebook / Marketplace */}
                                        <div className="bg-white/[0.03] p-8 rounded-[38px] border border-white/5 space-y-6 hover:border-[#00aed9]/20 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
                                                        <Facebook size={20} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Marketplace Ads</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">PAS Framework: Convincing</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(content.facebook, 'fb')}
                                                    className="p-4 bg-white/5 hover:bg-blue-500/20 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"
                                                    title="Copiar contenido de Facebook"
                                                    aria-label="Copiar contenido de Facebook"
                                                >
                                                    {copiedField === 'fb' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                                </button>
                                            </div>
                                            <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                                                <p className="text-md text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">{content.facebook}</p>
                                            </div>
                                        </div>

                                        {/* TikTok / Reels Script */}
                                        <div className="bg-white/[0.03] p-8 rounded-[38px] border border-white/5 space-y-6 hover:border-[#00aed9]/20 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg text-black">
                                                        <Video size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Short-form Video</h4>
                                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Hook-Value-CTA Structure</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(content.tiktokScript, 'tk')}
                                                    className="p-4 bg-white/5 hover:bg-white/20 rounded-2xl text-slate-400 hover:text-white transition-all"
                                                    title="Copiar script de TikTok"
                                                    aria-label="Copiar script de TikTok"
                                                >
                                                    {copiedField === 'tk' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                                                </button>
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 border-dashed italic">
                                                <p className="text-sm text-[#00aed9] whitespace-pre-wrap leading-relaxed font-bold uppercase tracking-wide">{content.tiktokScript}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="bg-white/[0.03] p-8 rounded-[38px] border border-white/5 h-full flex flex-col space-y-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
                                                    <Layout size={24} className="text-purple-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">AI Poster Designer</h4>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Generación de Activos Visuales</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 bg-black/40 rounded-[32px] border border-white/5 p-10 flex flex-col items-center justify-center space-y-6 text-center">
                                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                                                    <Sparkles size={40} className="text-[#00aed9]" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h5 className="text-xl font-black text-white uppercase tracking-wide">Poster Prompt Generado</h5>
                                                    <p className="text-sm text-slate-400 max-w-md mx-auto">He diseñado una instrucción visual optimizada para que DALL-E o Midjourney creen el poster perfecto para esta unidad.</p>
                                                </div>

                                                <div className="w-full p-6 bg-white/[0.02] rounded-2xl border border-white/5 text-left">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">AI Prompt Optimized</span>
                                                        <button
                                                            onClick={() => copyToClipboard(content.posterPrompt || '', 'prompt')}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-all"
                                                            title="Copiar Prompt Visual"
                                                            aria-label="Copiar Prompt Visual"
                                                        >
                                                            {copiedField === 'prompt' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-500 italic leading-relaxed">{content.posterPrompt || 'No se generó prompt visual'}</p>
                                                </div>

                                                <button className="px-8 py-4 bg-white/5 text-white/50 border border-white/10 rounded-[22px] font-black text-xs uppercase tracking-widest cursor-not-allowed">
                                                    Lanzar Renderización (Próximamente)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-8 pb-10 flex items-center justify-between border-t border-white/5 relative z-10 bg-[#0f172a]/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-[#00aed9] to-blue-600 opacity-50" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Utilizado por +4 agencias del grupo</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-6 py-4 bg-white/5 text-slate-400 hover:bg-white/10 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10">
                            <Download size={16} /> Descargar Kit
                        </button>
                        <button className="px-6 py-4 bg-white/5 text-white hover:bg-white/10 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10">
                            <Share2 size={16} /> Publicación Programada
                        </button>
                        <button
                            onClick={handleWhatsAppShare}
                            className="px-10 py-4 bg-[#00aed9] text-white hover:bg-[#00aed9]/80 rounded-[22px] text-xs font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(0,174,217,0.3)]"
                        >
                            <MessageCircle size={18} /> Iniciar Difusión WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
