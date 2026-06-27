'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/entities/session';
import { Link, useNavigate } from '@/shared/lib/next-route-adapter';
import { Menu, X, User, LogOut, Car, Phone, ChevronRight } from 'lucide-react';

const NAV_LINKS = [
  { to: '/inventario', label: 'Inventario' },
  { to: '/financiamiento', label: 'Financiamiento' },
  { to: '/match-automotriz', label: 'Deal Matcher', badge: 'NEW' },
  { to: '/quienes-somos', label: 'Quiénes Somos' },
  { to: '/blog', label: 'Blog' },
  { to: '/contacto', label: 'Contacto' },
];

const WA_URL = 'https://wa.me/17873682880?text=Hola%2C%20quiero%20información%20sobre%20un%20auto';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-cyan-400/20 bg-slate-950/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'border-b border-white/8 bg-[rgba(6,15,24,0.80)] backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 to-cyan-700 text-white shadow-lg shadow-cyan-500/30">
              <Car size={18} strokeWidth={2.6} />
            </div>
            <span className="font-cinematic text-2xl tracking-[0.12em] text-white">
              RICHARD <span className="text-cyan-300">AUTO</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                className="group relative flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 transition-colors hover:text-white"
              >
                {label}
                {badge && (
                  <span className="px-1.5 py-0.5 bg-cyan-500/20 text-[7px] font-black text-cyan-300 border border-cyan-500/30 rounded-full animate-pulse">
                    {badge}
                  </span>
                )}
                <div className="absolute -bottom-0.5 left-0 h-px w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
            >
              <Phone size={12} />
              WhatsApp
            </a>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                    <User size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 transition-colors hover:text-rose-400"
                  aria-label="Cerrar Sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/precualificacion"
                className="rounded-xl bg-cyan-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-cyan-400 transition-colors shadow-[0_0_16px_rgba(34,211,238,0.3)]"
              >
                Aplica Gratis
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-200 p-1"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/8 bg-slate-950/98 backdrop-blur-2xl">
          <div className="p-4 space-y-1">
            {NAV_LINKS.map(({ to, label, badge }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 px-4 py-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-200 hover:bg-white/8 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {label}
                  {badge && (
                    <span className="rounded-full bg-cyan-500/25 px-2 py-0.5 text-[8px] font-black text-cyan-300 border border-cyan-500/30 animate-pulse">
                      {badge}
                    </span>
                  )}
                </span>
                <ChevronRight size={14} className="text-slate-500" />
              </Link>
            ))}

            <div className="pt-3 grid grid-cols-2 gap-3">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 py-3 text-[10px] font-black uppercase tracking-widest text-[#25D366]"
              >
                <Phone size={13} /> WhatsApp
              </a>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 py-3 text-[10px] font-black uppercase tracking-widest text-rose-400"
                >
                  <LogOut size={13} /> Salir
                </button>
              ) : (
                <Link
                  to="/precualificacion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-cyan-500 py-3 text-[10px] font-black uppercase tracking-widest text-black"
                >
                  Aplica Gratis
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
