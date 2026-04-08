'use client';

// CinemaLayout.tsx
import React, { useState, useContext, useEffect, Suspense, lazy, useCallback } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/widgets/brand-ui/layout/Sidebar';
import OfflineIndicator from '@/widgets/brand-ui/layout/OfflineIndicator';
import SentinelFlashTicker from '@/widgets/brand-ui/layout/SentinelFlashTicker';
import ChatErrorBoundary from '@/shared/ui/error-boundary/ChatErrorBoundary';
import { FloatingActionOrbit } from '@/widgets/brand-ui/layout/FloatingActionOrbit';
import { MobileBottomBar } from '@/widgets/brand-ui/layout/MobileBottomBar';
import { NeuroTrajectoryDriver } from '@/features/predictive/ui/NeuroTrajectoryDriver';
import { NeuroUIAdapter } from '@/widgets/brand-ui/layout/NeuroUIAdapter';
import { ThemeContext } from '@/shared/ui/providers/ThemeProvider';
import { usePathname } from 'next/navigation';
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
          if (typeof window !== 'undefined') window.location.reload();
        }

        return { default: (() => null) as unknown as T };
      }) as Promise<{ default: T }>,
  );
}

const AIChatWidget = safeLazy(
  () =>
    import('@/widgets/ai-chat/AIChatWidget').then((m) => ({ default: (m as any).default || m })),
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
  const [activeFloatingWidget, setActiveFloatingWidget] = useState<
    'chat' | 'voice' | 'whatsapp' | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDeferredWidgets, setShowDeferredWidgets] = useState(false);

  // Nivel 18 Hydration Bridge: Carga de sidebar_collapsed segura en cliente.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved !== null) setIsSidebarCollapsed(saved === 'true');
    }
  }, []);
  const { theme } = useContext(ThemeContext);
  const pathname = usePathname();

  // Theme Sync
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  // Scroll to top on route change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const main = document.getElementById('main-content');
      if (main) main.scrollTo(0, 0);
    }
  }, [pathname]);

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
      {/* Premium Glass Mobile Header (Nivel 18 Refinement) */}
      <header className="z-50 flex items-center justify-between p-5 text-white lg:hidden glass-premium m-4 border-white/20 shadow-[0_0_40px_rgba(0,229,255,0.15)]">
        <span className="font-cinematic text-3xl tracking-[0.2em] text-white text-glow">
          RICHARD<span className="text-primary italic">AUTO</span>
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Abrir menú"
          aria-label="Abrir menú"
          className="rounded-2xl p-3 bg-white/5 border border-white/10 transition-all hover:bg-primary/20 hover:border-primary/40 active:scale-95"
        >
          <Menu className="text-primary" />
        </button>
      </header>

      {/* Nivel 18: Living Background Parallax Layer */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-[-10%] opacity-40 blur-[120px] transition-transform duration-1000 ease-out animate-spin-slow"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, hsla(var(--cyber-cyan), 0.15), transparent 40%),
              radial-gradient(circle at 80% 70%, hsla(var(--plasma-purple), 0.15), transparent 40%),
              radial-gradient(circle at 50% 50%, hsla(var(--sentinel-amber), 0.05), transparent 60%)
            `
          }}
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'var(--texture-grain)' }} />
      </div>

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
        className={`relative h-screen flex-1 overflow-x-hidden overflow-y-auto bg-transparent text-slate-100 scroll-smooth transition-all duration-300 pb-20 md:pb-0 ${isSidebarCollapsed ? 'lg:w-[calc(100vw-80px)]' : 'lg:w-[calc(100vw-288px)]'}`}
      >
        {/* Global Floating Notification Layer */}
        <div className="sticky top-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <OfflineIndicator />
            <SentinelFlashTicker />
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative z-10 min-h-full transition-all duration-500">{children}</div>

        {/* Nivel 13: Autonomous Drivers & Adaptive UI */}
        <NeuroTrajectoryDriver />
        <NeuroUIAdapter />
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
      <MobileBottomBar />
    </div>
  );
};
