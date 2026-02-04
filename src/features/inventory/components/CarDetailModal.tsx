
import React, { useState, useEffect, useRef } from 'react';
import { Car } from '@/types/types';
import { X, ChevronRight, Sparkles, Loader2, Calculator, CreditCard, Banknote, Calendar, AlertCircle, Share2 } from 'lucide-react';
import { generateCarPitch } from '@/services/geminiService';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';


interface Props {
    car: Car;
    onClose: () => void;
}

const CarDetailModal: React.FC<Props> = ({ car, onClose }) => {
    const [downPayment, setDownPayment] = useState<number | ''>(0); // Permitir string vacío para mejor UX al borrar
    const [tradeIn, setTradeIn] = useState<number | ''>(0);
    const [term, setTerm] = useState<number>(84);
    const [creditRate, setCreditRate] = useState<number>(0.059);

    const [activeTab, setActiveTab] = useState<'calculator' | 'insight'>('calculator');
    const [aiPitch, setAiPitch] = useState<string>('');
    const [loadingPitch, setLoadingPitch] = useState(false);
    const [errors, setErrors] = useState<{ downPayment?: string }>({});
    const analytics = useInventoryAnalytics();


    // Monthly payment derived state
    const calculatedPayment = React.useMemo(() => {
        const dpVal = downPayment === '' ? 0 : downPayment;
        const tiVal = tradeIn === '' ? 0 : tradeIn;
        const principal = Math.max(0, car.price - dpVal - tiVal);

        if (principal <= 0) return 0;

        const monthlyRate = creditRate / 12;
        if (monthlyRate === 0) return Math.round(principal / term);

        const numerator = monthlyRate * Math.pow(1 + monthlyRate, term);
        const denominator = Math.pow(1 + monthlyRate, term) - 1;
        return Math.round(principal * (numerator / denominator));
    }, [downPayment, tradeIn, term, creditRate, car.price]);

    const modalRef = useRef<HTMLDivElement>(null);

    // Focus trap y manejo de Escape
    useEffect(() => {
        const previouslyFocusedElement = document.activeElement as HTMLElement;
        if (modalRef.current) {
            modalRef.current.focus();
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement?.focus();
        };
    }, [onClose]);

    const handleTabChange = (tab: 'calculator' | 'insight') => {
        setActiveTab(tab);
        if (tab === 'insight' && !aiPitch && !loadingPitch) {
            setLoadingPitch(true);
            generateCarPitch(car)
                .then(text => setAiPitch(text))
                .catch(() => setAiPitch("No pudimos conectar con Richard IA en este momento."))
                .finally(() => setLoadingPitch(false));
        }
    };

    const validate = (): boolean => {
        const newErrors: { downPayment?: string } = {};
        let isValid = true;

        // Validar Pronto (Down Payment)
        if (downPayment === '') {
            newErrors.downPayment = "Este campo es obligatorio.";
            isValid = false;
        } else if (downPayment < 0) {
            newErrors.downPayment = "El valor no puede ser negativo.";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRequestApproval = () => {
        if (activeTab !== 'calculator') handleTabChange('calculator');

        if (!validate()) {
            // Vibración visual si hay error
            const form = document.getElementById('calculator-form');
            form?.classList.add('animate-shake');
            setTimeout(() => form?.classList.remove('animate-shake'), 500);
            return;
        }

        const dpVal = downPayment === '' ? 0 : downPayment;
        const tiVal = tradeIn === '' ? 0 : tradeIn;

        analytics.trackCarConfigure(car.id);

        window.open(`https://wa.me/17873682880?text=Hola, vi el análisis de IA del ${car.name}. Me interesa con un pago estimado de $${calculatedPayment}/mes (Pronto: $${dpVal}, TradeIn: $${tiVal}, Término: ${term} meses).`, '_blank');

    };

    const handleShare = async () => {
        const shareData = {
            title: `Mira este ${car.name}`,
            text: `¡Encontré este ${car.name} en Richard Automotive! Precio: $${car.price.toLocaleString()}`,
            url: window.location.href // En un app real, sería la URL específica del auto
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled share
            }

        } else {
            // Fallback simple: Copiar al portapapeles o abrir WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    return (
        <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="car-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d2232]/80 backdrop-blur-xl animate-in fade-in"
        >
            <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-[40px] md:rounded-[60px] shadow-2xl p-4 md:p-6 relative flex flex-col lg:flex-row gap-6 overflow-hidden">

                {/* Action Buttons (Close & Share) */}
                <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-20 flex gap-2">
                    <button
                        onClick={handleShare}
                        className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-[#00aed9] hover:text-white transition-all shadow-lg"
                        title="Compartir en Redes"
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar modal"
                        className="w-10 h-10 lg:w-12 lg:h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Left Side: Image */}
                <div className="w-full lg:w-3/5 h-1/3 lg:h-full bg-white dark:bg-slate-800 rounded-[35px] lg:rounded-[45px] flex items-center justify-center p-8 lg:p-12 relative overflow-hidden group border border-slate-200 dark:border-slate-700">
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/20" />
                    <img
                        src={car.img}
                        alt={car.name}
                        loading="lazy"
                        decoding="async"
                        className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                    {car.badge && (
                        <div className="absolute top-6 left-6 lg:top-8 lg:left-8 bg-[#00aed9] text-white px-4 py-2 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest shadow-xl z-10">
                            {car.badge}
                        </div>
                    )}
                </div>

                {/* Right Side: Details & Calculator */}
                <div className="w-full lg:w-2/5 flex flex-col h-full overflow-hidden">

                    {/* Header Info */}
                    <div className="mb-6 px-2">
                        <span className="text-[10px] font-black text-[#00aed9] uppercase tracking-[0.3em]">{car.type}</span>
                        <h2 id="car-modal-title" className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tighter leading-tight mt-1">{car.name}</h2>
                        <p className="text-xl font-bold text-slate-500 dark:text-slate-400 mt-2">${car.price.toLocaleString()}</p>
                    </div>

                    {/* Monthly Payment Display */}
                    <div className="bg-white dark:bg-slate-800 p-6 lg:p-8 rounded-[35px] text-center shadow-lg dark:shadow-none border border-slate-100 dark:border-slate-700 mb-6 shrink-0 transition-all">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Calculator size={14} /> Pago Mensual Estimado
                        </div>
                        <div className="text-5xl lg:text-6xl font-black premium-gradient text-transparent bg-clip-text tracking-tighter my-2">
                            ${calculatedPayment}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl mb-4 shrink-0">
                        <button
                            onClick={() => handleTabChange('calculator')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'calculator' ? 'bg-white dark:bg-slate-600 text-[#00aed9] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            Calculadora
                        </button>
                        <button
                            onClick={() => handleTabChange('insight')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'insight' ? 'bg-white dark:bg-slate-600 text-[#00aed9] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            <Sparkles size={14} /> Richard's Insight
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {activeTab === 'calculator' ? (
                            <div id="calculator-form" className="space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-2">

                                {/* Inputs Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="downPaymentInput" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                            <Banknote size={12} /> Pronto ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="downPaymentInput"
                                            type="number"
                                            min="0"
                                            max={car.price}
                                            required
                                            value={downPayment}
                                            onChange={(e) => {
                                                setDownPayment(e.target.value === '' ? '' : Number(e.target.value));
                                                if (errors.downPayment) setErrors(prev => ({ ...prev, downPayment: undefined }));
                                            }}
                                            className={`w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 dark:text-white border-2 rounded-[20px] text-lg font-bold outline-none transition-all placeholder:text-slate-300 
                                    ${errors.downPayment
                                                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10'
                                                    : 'border-transparent focus:ring-4 focus:ring-[#00aed9]/20'}`}
                                            placeholder="0"
                                        />
                                        <input
                                            type="range"
                                            title="Ajustar Pronto"
                                            min="0"
                                            max={car.price}
                                            value={downPayment || 0}
                                            onChange={(e) => setDownPayment(Number(e.target.value))}
                                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-[#00aed9]"
                                        />

                                        {errors.downPayment && (
                                            <div className="flex items-center gap-1 ml-2 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                                                <AlertCircle size={12} /> {errors.downPayment}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="tradeInInput" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                            <CreditCard size={12} /> Trade-In ($)
                                        </label>
                                        <input
                                            id="tradeInInput"
                                            type="number"
                                            min="0"
                                            max={car.price}
                                            value={tradeIn}
                                            onChange={(e) => setTradeIn(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-800 dark:text-white border-2 border-transparent rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/20 text-lg font-bold outline-none transition-all placeholder:text-slate-300"
                                            placeholder="0"
                                        />
                                        <input
                                            type="range"
                                            title="Ajustar Trade-In"
                                            min="0"
                                            max={car.price}
                                            value={tradeIn || 0}
                                            onChange={(e) => setTradeIn(Number(e.target.value))}
                                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-[#00aed9]"
                                        />

                                    </div>
                                </div>

                                {/* Credit Score Select */}
                                <div className="space-y-2">
                                    <label htmlFor="creditRateSelect" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Puntuación de Crédito <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select
                                            id="creditRateSelect"
                                            value={creditRate}
                                            onChange={(e) => setCreditRate(Number(e.target.value))}
                                            className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 dark:text-white border-none rounded-[20px] focus:ring-4 focus:ring-[#00aed9]/20 text-sm font-bold appearance-none cursor-pointer outline-none"
                                        >
                                            <option value={0.029}>Excelente (720+)</option>
                                            <option value={0.059}>Bueno (660+)</option>
                                            <option value={0.099}>Justo (600+)</option>
                                            <option value={0.129}>Trabajado (580+)</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            ▼
                                        </div>
                                    </div>
                                </div>

                                {/* Term Selector */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-1">
                                        <Calendar size={12} /> Término <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[60, 72, 84].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTerm(t)}
                                                className={`py-4 rounded-[20px] font-bold text-sm transition-all border-2 ${term === t
                                                    ? 'bg-[#173d57] border-[#173d57] text-white shadow-lg transform scale-105'
                                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-[#00aed9] hover:text-[#00aed9]'
                                                    }`}
                                            >
                                                {t} Meses
                                            </button>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
                                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[30px]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 bg-[#00aed9]/10 rounded-full flex items-center justify-center">
                                            <Sparkles size={20} className="text-[#00aed9]" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Opinión Experta</h4>
                                            <p className="text-[10px] text-slate-400">Generado por Gemini AI</p>
                                        </div>
                                    </div>

                                    {loadingPitch ? (
                                        <div className="flex flex-col items-center justify-center text-slate-400 gap-4 py-8">
                                            <Loader2 className="animate-spin text-[#00aed9]" size={32} />
                                            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Analizando especificaciones...</p>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert leading-relaxed text-slate-600 dark:text-slate-300">
                                            <div dangerouslySetInnerHTML={{ __html: aiPitch.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00aed9]">$1</strong>').replace(/\n/g, '<br/>') }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleRequestApproval}
                        className="mt-4 w-full py-5 premium-gradient text-white rounded-[25px] font-black text-xs md:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                    >
                        Solicitar Aprobación <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default CarDetailModal;
