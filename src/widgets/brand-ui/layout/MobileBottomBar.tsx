'use client';

import React from 'react';
import { useNavigate, useLocation } from '@/shared/lib/next-route-adapter';
import { motion } from 'framer-motion';
import { Compass, ShieldCheck, User, Calculator, LayoutDashboard, BrainCircuit, BookOpen } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard =
    location.pathname.startsWith('/panel-control') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/consultant') ||
    location.pathname.startsWith('/compare');

  if (isDashboard) {
    const dashItems = [
      { label: 'Centro', icon: LayoutDashboard, path: '/panel-control' },
      { label: 'Admin', icon: BrainCircuit, path: '/admin' },
      { label: 'Consultor', icon: User, path: '/consultant' },
      { label: 'Perfil', icon: User, path: '/profile' },
    ];

    return (
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
        <div className="glass-liquid rounded-4xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4 py-3">
          <div className="flex items-center justify-between">
            {dashItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                  className="relative flex flex-col items-center justify-center p-2 transition-all duration-300 group min-w-[56px] min-h-[48px]"
                >
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ${
                      isActive
                        ? 'bg-cyan-400/10 text-cyan-400'
                        : 'text-white/40 group-hover:text-white/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-active"
                        className="absolute inset-0 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                  </div>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-1 text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400"
                    >
                      _
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Public pages — 2 nav items | raised CTA | 2 nav items
  const leftItems = [
    { label: 'Unidades', icon: Compass, path: '/' },
    { label: 'Blog', icon: BookOpen, path: '/blog' },
  ];
  const rightItems = [
    { label: 'GAP', icon: ShieldCheck, path: '/gap' },
    { label: 'Perfil', icon: User, path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md">
      <div className="glass-liquid rounded-4xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Left nav items */}
          {leftItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center p-2 transition-all duration-300 group min-w-[48px] min-h-[48px]"
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-500 ${
                    isActive
                      ? 'bg-cyan-400/10 text-cyan-400'
                      : 'text-white/40 group-hover:text-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active-public"
                      className="absolute inset-0 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                </div>
                <span className={`text-[9px] font-bold mt-0.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Center raised CTA */}
          <button
            onClick={() => navigate('/qualify')}
            aria-label="Calcular mi pago mensual"
            className="relative -mt-8 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-400 to-blue-600 shadow-[0_8px_32px_rgba(34,211,238,0.5)] transition-all duration-200 active:scale-95 hover:scale-105 border border-cyan-300/30 group"
          >
            <motion.div
              animate={{ boxShadow: ['0 8px 24px rgba(34,211,238,0.4)', '0 8px 40px rgba(34,211,238,0.7)', '0 8px 24px rgba(34,211,238,0.4)'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl"
            />
            <Calculator size={22} className="text-white relative z-10" strokeWidth={2.5} />
            <span className="text-[8px] font-black uppercase tracking-wider text-white/90 mt-0.5 relative z-10 leading-none">
              Mi Pago
            </span>
          </button>

          {/* Right nav items */}
          {rightItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                className="relative flex flex-col items-center justify-center p-2 transition-all duration-300 group min-w-[48px] min-h-[48px]"
              >
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-500 ${
                    isActive
                      ? 'bg-cyan-400/10 text-cyan-400'
                      : 'text-white/40 group-hover:text-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active-public"
                      className="absolute inset-0 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                </div>
                <span className={`text-[9px] font-bold mt-0.5 transition-colors ${isActive ? 'text-cyan-400' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
