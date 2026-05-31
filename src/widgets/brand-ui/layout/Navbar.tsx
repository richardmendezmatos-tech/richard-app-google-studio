'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/entities/session';
import { Link, useNavigate } from '@/shared/lib/next-route-adapter';
import { Menu, X, User, LogOut, Car, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { getInventoryCount } from '@/shared/api/supabase/supabaseClient';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stockCount, setStockCount] = useState<number | null>(null);

  React.useEffect(() => {
    getInventoryCount().then(setStockCount);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-cyan-300/15 bg-[rgba(6,15,24,0.82)] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-cyan-400 to-cyan-700 text-white shadow-lg shadow-cyan-500/25">
              <Car size={18} strokeWidth={2.6} />
            </div>
            <span className="font-cinematic text-2xl tracking-[0.12em] text-white">
              RICHARD <span className="text-cyan-300">AUTO</span>
            </span>
          </Link>

          <div className="hidden items-center space-x-8 md:flex">
            <Link
              to="/inventario"
              className="group relative flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 transition-all hover:text-white"
            >
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10">
                <Car
                  size={12}
                  className="relative z-10 text-cyan-400 transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 -z-0 hidden animate-pulse rounded-lg bg-cyan-400/20 blur-sm group-hover:block" />
              </div>
              <span className="relative">
                Inventario
                {stockCount !== null && (
                  <span className="absolute -top-3 -right-6 flex items-center gap-1 rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[7px] font-black text-cyan-300 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                    <Radio size={6} className="animate-pulse" />
                    {stockCount}
                  </span>
                )}
                <motion.div
                  className="absolute -bottom-1 left-0 h-[1px] w-0 bg-cyan-400"
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </span>
            </Link>
            <Link
              to="/financiamiento"
              className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-200"
            >
              Financiamiento
            </Link>
            <Link
              to="/deal-matcher"
              className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-200 flex items-center gap-1.5"
            >
              <span>Deal Matcher</span>
              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-[7px] font-black text-cyan-300 border border-cyan-500/30 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                NEW!
              </span>
            </Link>
            <Link
              to="/contacto"
              className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-200"
            >
              Contacto
            </Link>
            <Link
              to="/ai-lab"
              className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 transition-colors hover:text-cyan-200"
            >
              Laboratorio
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-none text-white">
                      {user?.email?.split('@')[0] || 'Usuario'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-300">
                      {user?.role || 'Cliente'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 transition-colors hover:text-rose-400"
                  aria-label="Cerrar Sesion"
                  title="Cerrar Sesion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300 hover:text-cyan-200"
                >
                  Ingresar
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg bg-cyan-500 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-cyan-400"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-200"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="space-y-4 border-t border-cyan-300/15 bg-[#07111b] p-4 md:hidden">
          <Link
            to="/inventario"
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-200"
          >
            <div className="flex items-center gap-3">
              <Car size={16} className="text-cyan-400" />
              <span>Inventario</span>
            </div>
            {stockCount !== null && (
              <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-[9px] text-cyan-300">
                {stockCount} UNIDADES
              </span>
            )}
          </Link>
          <Link
            to="/financiamiento"
            className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-200"
          >
            Financiamiento
          </Link>
          <Link
            to="/deal-matcher"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-slate-200"
          >
            <span>Deal Matcher</span>
            <span className="rounded-full bg-cyan-500/25 px-2 py-0.5 text-[9px] font-black text-cyan-300 animate-pulse border border-cyan-500/30">
              MATCH!
            </span>
          </Link>
          <Link
            to="/contacto"
            className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-200"
          >
            Contacto
          </Link>
          <Link
            to="/ai-lab"
            className="block text-xs font-bold uppercase tracking-[0.16em] text-slate-200"
          >
            Lab
          </Link>
          <div className="border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-cyan-300">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-bold text-white">{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold text-rose-400"
                >
                  <LogOut size={16} /> Cerrar Sesion
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="rounded-lg border border-white/10 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-200"
                >
                  Ingresar
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg bg-cyan-500 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-white"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
