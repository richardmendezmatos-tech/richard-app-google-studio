import React, { useState, useContext, useEffect, Suspense, lazy } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import ReloadPrompt from '@/components/layout/ReloadPrompt';
import OfflineIndicator from '@/components/layout/OfflineIndicator';

import { ThemeContext } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { Car } from '@/types/types';

const AIChatWidget = lazy(() => import('@/features/ai/components/AIChatWidget'));
const VoiceWidget = lazy(() =>
    import('@/features/ai/components/VoiceWidget').then((mod) => ({ default: mod.VoiceWidget }))
);
const WhatsAppFloat = lazy(() =>
    import('@/features/leads/components/WhatsAppFloat').then((mod) => ({ default: mod.WhatsAppFloat }))
);

interface CinemaLayoutProps {
    children: React.ReactNode;
    inventory?: Car[]; // Passed down for widgets
}

export const CinemaLayout: React.FC<CinemaLayoutProps> = ({ children, inventory = [] }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showDeferredWidgets, setShowDeferredWidgets] = useState(false);
    const { theme } = useContext(ThemeContext);
    const location = useLocation();

    // Theme Sync
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    // Scroll to top on route change
    useEffect(() => {
        const main = document.getElementById('main-content');
        if (main) main.scrollTo(0, 0);
    }, [location.pathname]);

    // Defer non-critical floating widgets to reduce initial JS cost.
    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setShowDeferredWidgets(true);
        }, 1200);

        return () => window.clearTimeout(timeout);
    }, []);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* Premium Glass Mobile Header */}
            <header className="z-50 flex items-center justify-between border-b border-white/5 bg-slate-950/80 p-4 text-white shadow-2xl backdrop-blur-3xl lg:hidden">
                <span className="font-cinematic text-3xl tracking-[0.16em] text-cyan-400 text-glow">RICHARD AUTO</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    title="Abrir menú"
                    aria-label="Abrir menú"
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                >
                    <Menu />
                </button>
            </header>

            {/* Main Sidebar Component */}
            <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

            {/* Main Content Area */}
            <main
                id="main-content"
                className="relative h-screen w-full flex-1 overflow-x-hidden overflow-y-auto bg-transparent text-slate-100 scroll-smooth"
            >
                {/* Global Floating Widgets */}
                <ReloadPrompt />
                <OfflineIndicator />
                {showDeferredWidgets && (
                    <Suspense fallback={null}>
                        <AIChatWidget inventory={inventory} />
                        <VoiceWidget />
                        <WhatsAppFloat />
                    </Suspense>
                )}

                {/* Dynamic Content */}
                <div className="relative z-10 min-h-full">
                    {children}
                </div>


            </main>

        </div>
    );
};
