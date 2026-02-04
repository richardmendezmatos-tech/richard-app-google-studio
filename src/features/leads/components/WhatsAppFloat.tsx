import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/contexts/NotificationContext';
import { submitApplication } from '@/services/firebaseService';
import { addLead } from '../services/crmService';
import { useMetaPixel } from '@/hooks/useMetaPixel';
import { db } from '@/services/firebaseService';
import { useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '@/constants/siteConfig';
import { createInteractiveMenu } from '../services/whatsappService';

export const WhatsAppFloat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<{ text: string, sender: 'bot' | 'user' }[]>([
        { text: '¡Hola! 👋 Soy Richard IA, tu experto automotriz.', sender: 'bot' },
        { text: '¿Buscas algún modelo en específico o información de financiamiento?', sender: 'bot' }
    ]);

    const phoneNumber = SITE_CONFIG.contact.whatsapp;
    const location = useLocation();
    const { trackEvent } = useMetaPixel();

    // Auto-detect vehicle context from URL or State
    const state = location.state as { vehicle?: any } | null;
    const vehicle = state?.vehicle;

    // Show preview after 5 seconds on first visit
    useEffect(() => {
        const hasSeenPreview = localStorage.getItem('whatsapp_preview_seen');
        if (!hasSeenPreview) {
            const timer = setTimeout(() => {
                setShowPreview(true);
                localStorage.setItem('whatsapp_preview_seen', 'true');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const quickActions = [
        { icon: '🚗', label: 'Ver Inventario', message: 'Hola! Me gustaría ver el inventario disponible' },
        { icon: '💰', label: 'Financiamiento', message: 'Quiero información sobre financiamiento' },
        { icon: '📅', label: 'Agendar Cita', message: 'Me gustaría agendar una cita' },
    ];

    const handleQuickAction = async (action: typeof quickActions[0]) => {
        setMessages(prev => [...prev, { text: action.label, sender: 'user' }]);

        trackEvent('Lead', {
            content_name: 'WhatsApp Quick Action',
            content_category: 'Richard IA',
            content_ids: [action.label]
        });

        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            let finalMessage = action.message;
            if (vehicle) {
                finalMessage += ` [Contexto: ${vehicle.year} ${vehicle.make} ${vehicle.model}]`;
            }

            addLead({
                type: 'whatsapp',
                name: 'Lead de WhatsApp',
                phone: 'Pendiente',
                notes: `Acción: ${action.label}. Contexto: ${vehicle ? `${vehicle.make} ${vehicle.model}` : 'Global'}`,
                carId: vehicle?.id
            });

            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
            window.open(url, '_blank');
        }, 1200);
    };

    const handleOpenChat = () => {
        trackEvent('Lead', {
            content_name: 'WhatsApp Open Chat',
            content_category: 'Floating Button'
        });

        const menu = createInteractiveMenu();
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(menu)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4 w-[320px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Premium Header */}
                        <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-white/20">
                                        <Sparkles size={24} className="text-[#128C7E]" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#128C7E] rounded-full"></span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-black text-sm tracking-tight">Richard IA</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                                        <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest">En Línea</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="p-4 h-[350px] overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-3">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${msg.sender === 'bot'
                                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 self-start shadow-sm border border-slate-100 dark:border-slate-700'
                                        : 'bg-[#25D366] text-white self-end shadow-md'
                                        }`}
                                >
                                    {msg.text}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-2xl self-start flex gap-1 shadow-sm border border-slate-100 dark:border-slate-700">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            )}
                        </div>

                        {/* Actions Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 gap-2">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleQuickAction(action)}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                                >
                                    <span className="text-xl group-hover:scale-125 transition-transform">{action.icon}</span>
                                    <span className="flex-1 text-left text-xs font-bold text-slate-700 dark:text-slate-200">{action.label}</span>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#25D366]" />
                                </button>
                            ))}
                            <button
                                onClick={handleOpenChat}
                                className="mt-2 w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#25D366]/10 text-slate-600 dark:text-slate-300 hover:text-[#25D366] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={14} />
                                Abrir Menú Interactivo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Floating Trigger */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative
                    transition-all duration-500 transform
                    ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-[#25D366] hover:scale-110 active:scale-95'}
                `}
            >
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40"></span>
                )}
                {isOpen ? (
                    <X className="text-white" size={28} />
                ) : (
                    <div className="relative">
                        <MessageCircle fill="white" className="text-white" size={32} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#25D366] animate-bounce"></span>
                    </div>
                )}
            </motion.button>

            {/* Hint Tooltip */}
            {!isOpen && !showPreview && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-20 bg-white dark:bg-slate-800 py-2 px-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap hidden md:block"
                >
                    <p className="text-[10px] font-black text-[#128C7E] uppercase tracking-tighter">Hablar con Richard IA</p>
                </motion.div>
            )}
        </div>
    );
};
