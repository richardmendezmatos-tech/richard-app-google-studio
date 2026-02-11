import React, { useState, useEffect } from 'react';
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

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-6 z-40 max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl route-fade-in dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00aed9] to-cyan-600 shadow-lg shadow-cyan-500/20">
                    <Icon size={18} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-slate-800 dark:text-white">
                        {currentActivity.text}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Hace {currentActivity.time}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>
        </div>
    );
};
