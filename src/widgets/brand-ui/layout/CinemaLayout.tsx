import React, { useState, useContext, useEffect, Suspense, lazy } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/widgets/brand-ui/layout/Sidebar';
import ReloadPrompt from '@/widgets/brand-ui/layout/ReloadPrompt';
import OfflineIndicator from '@/widgets/brand-ui/layout/OfflineIndicator';

import { ThemeContext } from '@/shared/ui/providers/ThemeProvider';
import { useLocation } from 'react-router-dom';
import { Car } from '@/shared/types/types';

const AIChatWidget = lazy(() => import('@/widgets/ai-chat/AIChatWidget').then(m => ({ default: (m as any).default || m }))) as any;
const VoiceWidget = lazy(() => 
  import('@/widgets/ai-chat/VoiceWidget').then((mod) => ({ default: (mod as any).default || mod.VoiceWidget || mod }))
) as any;
const WhatsAppFloat = lazy(() => 
  import('@/features/leads').then((mod) => ({ default: (mod as any).default || mod.WhatsAppFloat || mod }))
) as any;

interface CinemaLayoutProps {
  children: React.ReactNode;
  inventory?: Car[]; // Passed down for widgets
}

export const CinemaLayout: React.FC<CinemaLayoutProps> = ({ children, inventory = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });
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

  // Sidebar Persistence
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-transparent overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Premium Glass Mobile Header */}
      <header className="z-50 flex items-center justify-between p-4 text-white lg:hidden glass-premium m-2">
        <span className="font-cinematic text-3xl tracking-[0.16em] text-cyan-400 text-glow">
          RICHARD AUTO
        </span>
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
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        className={`relative h-screen flex-1 overflow-x-hidden overflow-y-auto bg-transparent text-slate-100 scroll-smooth transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-[calc(100vw-80px)]' : 'lg:w-[calc(100vw-288px)]'}`}
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
        <div className="relative z-10 min-h-full">{children}</div>
      </main>
    </div>
  );
};
