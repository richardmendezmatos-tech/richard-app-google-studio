import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_CONFIG } from '../src/constants/siteConfig';
import { createInteractiveMenu } from '../services/whatsappService';

export const WhatsAppFloat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const phoneNumber = SITE_CONFIG.contact.whatsapp;

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

    const handleQuickAction = (message: string) => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setIsOpen(false);
    };

    const handleOpenChat = () => {
        const menu = createInteractiveMenu();
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(menu)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            {/* Main Button */}
            <motion.div
                className="fixed bottom-24 right-5 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
            >
                <div className="relative">
                    {/* Preview Tooltip */}
                    <AnimatePresence>
                        {showPreview && !isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute right-full mr-3 bottom-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border border-slate-200 dark:border-slate-700"
                            >
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X size={16} />
                                </button>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                                            ¡Hola! 👋
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">
                                            Soy Richard IA. ¿Te ayudo a encontrar tu auto ideal?
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Actions Panel */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                className="absolute bottom-full right-0 mb-4 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                <MessageCircle size={24} className="text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-sm">Richard IA</h3>
                                                <p className="text-white/80 text-xs">Asistente Virtual</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="text-white/80 hover:text-white"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="p-4 space-y-2">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                        Acciones Rápidas
                                    </p>
                                    {quickActions.map((action, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleQuickAction(action.message)}
                                            className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all group"
                                        >
                                            <span className="text-2xl">{action.icon}</span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-[#25D366] transition-colors">
                                                {action.label}
                                            </span>
                                            <Send size={14} className="ml-auto text-slate-400 group-hover:text-[#25D366] transition-colors" />
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Open Chat Button */}
                                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={handleOpenChat}
                                        className="w-full py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={18} />
                                        Abrir Chat Completo
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Button */}
                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`
                            relative p-4 rounded-full shadow-lg transition-all duration-300
                            flex items-center justify-center group overflow-hidden
                            ${isOpen
                                ? 'bg-slate-800 dark:bg-slate-700'
                                : 'bg-[#25D366] hover:bg-[#128C7E]'
                            }
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Pulse Animation */}
                        {!isOpen && (
                            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
                        )}

                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                >
                                    <X size={28} className="text-white relative z-10" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="open"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                >
                                    <MessageCircle size={28} fill="white" className="text-white relative z-10" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Notification Badge */}
                        {!isOpen && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                                1
                            </span>
                        )}
                    </motion.button>

                    {/* Hover Tooltip (when closed) */}
                    {!isOpen && (
                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Habla con Richard IA
                        </span>
                    )}
                </div>
            </motion.div>
        </>
    );
};
