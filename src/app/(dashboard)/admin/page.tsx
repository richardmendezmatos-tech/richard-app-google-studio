'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SEO from '@/shared/ui/seo/SEO';

const CRMBoard = dynamic(() => import('@/features/command-center/ui/CRMBoard'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />,
});

const HoustonDashboard = dynamic(() => import('@/widgets/houston/HoustonDashboard'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />,
});

const UsersTab = dynamic(() => import('@/features/command-center/ui/UsersTab'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />,
});

/**
 * Houston Command Center - Admin Dashboard
 * Punto de entrada oficial de Richard Automotive.
 */
export default function AdminPage() {
  const [activeView, setActiveView] = React.useState<'crm' | 'houston' | 'users'>('crm');

  return (
    <div className="min-h-screen bg-[#0d2232] text-white overflow-x-hidden">
      <SEO
        title="Panel de Ventas | Richard Automotive"
        description="Panel de gestión de leads e inventario."
        noIndex={true}
      />

      {/* Mini Header / Houston Switcher */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
          <h1 className="text-sm font-black uppercase tracking-[0.3em] font-orbitron">
            Houston <span className="text-cyan-400">Panel de Ventas</span>
          </h1>
        </div>

        <nav className="flex bg-slate-900/50 rounded-full p-1 border border-white/5 items-center gap-1 overflow-x-auto flex-nowrap">
          <button
            onClick={() => setActiveView('crm')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeView === 'crm'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CRM Board
          </button>
          <button
            onClick={() => setActiveView('houston')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeView === 'houston'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Telemetría
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeView === 'users'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <a
            href="/admin/houston"
            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-md hover:scale-105"
          >
            Terminal Principal ⚡
          </a>
        </nav>
      </header>

      <main className="p-6">
        <React.Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-500 rounded-full border-t-transparent" />
            </div>
          }
        >
          {activeView === 'crm' ? <CRMBoard /> : activeView === 'houston' ? <HoustonDashboard /> : <UsersTab />}
        </React.Suspense>
      </main>
    </div>
  );
}
