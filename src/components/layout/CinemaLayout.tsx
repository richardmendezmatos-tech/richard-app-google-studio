import React, { useState, useContext, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { WhatsAppFloat } from '@/features/leads/components/WhatsAppFloat';
import { VoiceWidget } from '@/features/ai/components/VoiceWidget';
import AIChatWidget from '@/features/ai/components/AIChatWidget';
import ReloadPrompt from '@/components/layout/ReloadPrompt';
import OfflineIndicator from '@/components/layout/OfflineIndicator';

import { ScrollNavigator } from '@/components/common/ScrollNavigator';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { Car } from '@/types';

interface CinemaLayoutProps {
    children: React.ReactNode;
    inventory?: Car[]; // Passed down for widgets
}

export const CinemaLayout: React.FC<CinemaLayoutProps> = ({ children, inventory = [] }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-900 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">

            {/* Mobile Header */}
            <div className="lg:hidden p-4 bg-[#173d57] text-white flex justify-between items-center shadow-md z-50">
                <span className="font-black text-xl tracking-tight">RICHARD<span className="text-[#00aed9]">AUTO</span></span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    title="Abrir menú"
                    aria-label="Abrir menú"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Menu />
                </button>
            </div>

            {/* Main Sidebar Component */}
            <Sidebar isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />

            {/* Main Content Area */}
            <main
                id="main-content"
                className="flex-1 relative w-full h-screen overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 scroll-smooth"
            >
                {/* Global Floating Widgets */}
                <ReloadPrompt />
                <OfflineIndicator />
                <AIChatWidget inventory={inventory} />
                <VoiceWidget />
                <WhatsAppFloat />
                <ScrollNavigator />

                {/* Dynamic Content */}
                <div className="relative z-10 min-h-full">
                    {children}
                </div>


            </main>

        </div>
    );
};
