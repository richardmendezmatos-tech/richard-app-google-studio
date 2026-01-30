import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';

const ACTIVITY_MESSAGES = [
    { icon: Users, text: 'Juan de Santo Domingo guardó un Toyota Corolla', time: '2 min' },
    { icon: TrendingUp, text: '3 personas están viendo este vehículo', time: 'ahora' },
    { icon: Users, text: 'María de Santiago comparó este auto', time: '5 min' },
    { icon: TrendingUp, text: 'Carlos de San Pedro contactó por WhatsApp', time: '8 min' },
    { icon: Users, text: 'Ana de La Vega guardó en su garaje', time: '12 min' },
    { icon: TrendingUp, text: '5 personas vieron este auto hoy', time: '1 hora' }
];

export const SocialProofWidget: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % ACTIVITY_MESSAGES.length);
                setIsVisible(true);
            }, 500);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    const currentActivity = ACTIVITY_MESSAGES[currentIndex];
    const Icon = currentActivity.icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="fixed bottom-24 left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 max-w-sm z-40 border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#00aed9] to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">
                                {currentActivity.text}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Hace {currentActivity.time}
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
