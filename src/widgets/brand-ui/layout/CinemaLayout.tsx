'use client';

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Menu, Car as CarIcon } from 'lucide-react';
import { Link } from '@/shared/lib/next-route-adapter';
import dynamic from 'next/dynamic';
import { ThemeContext } from '@/shared/ui/providers/ThemeProvider';
import { usePathname } from 'next/navigation';
import { Car } from '@/shared/types/types';

const Sidebar = dynamic(() => import('@/widgets/brand-ui/layout/Sidebar'), { ssr: false });
const OfflineIndicator = dynamic(() => import('@/widgets/brand-ui/layout/OfflineIndicator'), { ssr: false });
const FloatingWidgetsHost = dynamic(() => import('@/widgets/brand-ui/layout/FloatingWidgetsHost'), { ssr: false });

interface CinemaLayoutProps {
  children: React.ReactNode;
  inventory?: Car[];
  showSidebar?: boolean;
  showFloatingWidgets?: boolean;
}

export const CinemaLayout: React.FC<CinemaLayoutProps> = ({ children, inventory = [], showSidebar = false, showFloatingWidgets = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFloatingWidget, setActiveFloatingWidget] = useState<
    'chat' | 'voice' | 'whatsapp' | null
  >(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      const main = document.getElementById('cinema-content');
      if (main) main.scrollTo(0, 0);
    }
  }, [pathname]);

  // Sidebar Persistence
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleWidgetSelect = useCallback((widget: 'chat' | 'voice' | 'whatsapp' | null) => {
    setActiveFloatingWidget(widget);
  }, []);

  const displaySidebar = showSidebar && pathname !== '/recompensas-vip' && pathname !== '/qualify';
  const displayHeader = pathname !== '/recompensas-vip' && pathname !== '/qualify';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-transparent overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Premium Glass Mobile Header (Nivel 22 Edge-to-Edge) */}
      {displayHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 text-white lg:hidden glass-liquid border-b border-white/5 shadow-2xl">
          <span className="font-cinematic text-3xl tracking-[0.2em] text-white text-glow">
            RICHARD<span className="text-cyan-400 italic">AUTO</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Ver Inventario"
              className="rounded-2xl p-3 bg-white/5 border border-white/10 transition-all hover:bg-cyan-400/20 hover:border-cyan-400/40 active:scale-95"
            >
              <CarIcon className="text-cyan-400" size={20} />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Abrir menú"
              aria-label="Abrir menú"
              className="rounded-2xl p-3 bg-white/5 border border-white/10 transition-all hover:bg-cyan-400/20 hover:border-cyan-400/40 active:scale-95"
            >
              <Menu className="text-cyan-400" />
            </button>
          </div>
        </header>
      )}

      {/* Nivel 22: Living Background Parallax Layer */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div
          className="absolute inset-[-20%] opacity-40 blur-[140px] transition-transform duration-1000 ease-out animate-spin-slow"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, hsla(var(--cyber-cyan), 0.2), transparent 45%),
              radial-gradient(circle at 80% 70%, hsla(var(--plasma-purple), 0.2), transparent 45%),
              radial-gradient(circle at 50% 50%, hsla(var(--sentinel-amber), 0.08), transparent 65%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay scale-125"
          style={{ backgroundImage: 'var(--texture-grain)' }}
        />
      </div>

      {/* Main Sidebar Component */}
      {displaySidebar && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <main
        id="cinema-content"
        className={`relative h-screen flex-1 overflow-x-hidden overflow-y-auto bg-transparent text-slate-100 scroll-smooth transition-all duration-300 pb-20 md:pb-0 ${displaySidebar ? (isSidebarCollapsed ? 'lg:w-[calc(100vw-80px)]' : 'lg:w-[calc(100vw-288px)]') : 'w-full'}`}
      >
        {/* Global Floating Notification Layer */}
        <div className="sticky top-0 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <OfflineIndicator />
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative z-10 min-h-full transition-all duration-500">{children}</div>
      </main>

      {showFloatingWidgets && (
        <FloatingWidgetsHost
          inventory={inventory}
          activeWidget={activeFloatingWidget}
          onWidgetSelect={handleWidgetSelect}
        />
      )}
    </div>
  );
};
