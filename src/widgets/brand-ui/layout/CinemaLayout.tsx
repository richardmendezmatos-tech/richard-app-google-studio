// CinemaLayout.tsx
import React, { useState, useContext, useEffect, Suspense, lazy, useCallback } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/widgets/brand-ui/layout/Sidebar';
import ReloadPrompt from '@/widgets/brand-ui/layout/ReloadPrompt';
import OfflineIndicator from '@/widgets/brand-ui/layout/OfflineIndicator';
import ChatErrorBoundary from '@/shared/ui/error-boundary/ChatErrorBoundary';
import { FloatingActionOrbit } from '@/widgets/brand-ui/layout/FloatingActionOrbit';

import { ThemeContext } from '@/shared/ui/providers/ThemeProvider';
import { useLocation } from 'react-router-dom';
import { Car } from '@/shared/types/types';

/**
 * Safe lazy import helper.
 */
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  sessionKey: string,
): React.LazyExoticComponent<T> {
  return lazy(
    () =>
      factory().catch((err: unknown) => {
        const isChunkError =
          err instanceof TypeError &&
          /failed to fetch dynamically imported module/i.test((err as Error).message);

        if (isChunkError && !sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, '1');
          window.location.reload();
        }

        return { default: (() => null) as unknown as T };
      }) as Promise<{ default: T }>,
  );
}

const AIChatWidget = safeLazy(
  () => import('@/widgets/ai-chat/AIChatWidget').then((m) => ({ default: (m as any).default || m })),
  'chat_chunk_reloaded',
) as any;

const VoiceWidget = safeLazy(
  () =>
    import('@/widgets/ai-chat/VoiceWidget').then((mod) => ({
      default: (mod as any).default || mod.VoiceWidget || mod,
    })),
  'voice_chunk_reloaded',
);

const WhatsAppFloat = safeLazy(
  () =>
    import('@/features/leads').then((mod) => ({
      default: (mod as any).default || mod.WhatsAppFloat || mod,
    })),
  'whatsapp_chunk_reloaded',
) as any;

interface CinemaLayoutProps {
  children: React.ReactNode;
  inventory?: Car[];
}

export const CinemaLayout: React.FC<CinemaLayoutProps> = ({ children, inventory = [] }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFloatingWidget, setActiveFloatingWidget] = useState<'chat' | 'voice' | 'whatsapp' | null>(null);
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

  // Defer non-critical floating widgets
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

  const handleWidgetSelect = useCallback((widget: 'chat' | 'voice' | 'whatsapp' | null) => {
    setActiveFloatingWidget(widget);
  }, []);

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
        

        {/* Dynamic Content */}
        <div className="relative z-10 min-h-full">{children}</div>
      </main>

      {/* Global Portals / Floating Widgets (Moved to Root for Mobile Visibility) */}
      {showDeferredWidgets && (
        <FloatingActionOrbit 
          activeWidget={activeFloatingWidget}
          onWidgetSelect={handleWidgetSelect}
          chatWidget={
            <ChatErrorBoundary>
              <Suspense fallback={null}>
                <AIChatWidget inventory={inventory} />
              </Suspense>
            </ChatErrorBoundary>
          }
          voiceWidget={
            <ChatErrorBoundary>
              <Suspense fallback={null}>
                <VoiceWidget />
              </Suspense>
            </ChatErrorBoundary>
          }
          whatsappWidget={
            <ChatErrorBoundary>
              <Suspense fallback={null}>
                <WhatsAppFloat isEmbedded={true} inventory={inventory} />
              </Suspense>
            </ChatErrorBoundary>
          }
        />
      )}
    </div>
  );
};
