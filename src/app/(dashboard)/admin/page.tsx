'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SEO from '@/shared/ui/seo/SEO';
import { Activity, TrendingUp, Bot, FlaskConical, Calculator } from 'lucide-react';

// Hub unificado: acceso a las demás superficies admin desde un punto único
const ADMIN_TOOLS = [
  { href: '/admin/deal-desker', label: 'Deal Desker F&I', icon: Calculator, desc: 'Estructuración de negocios F&I (four-square)' },
  { href: '/panel-control', label: 'Panel de Control', icon: Activity, desc: 'Monitoreo de sistema en tiempo real' },
  { href: '/panel-control/marketing', label: 'Marketing', icon: TrendingUp, desc: 'Fuentes de leads y embudo de conversión' },
  { href: '/consultant', label: 'Consultor IA', icon: Bot, desc: 'Chat asesor cara al cliente' },
  { href: '/laboratorio', label: 'AI Lab', icon: FlaskConical, desc: 'Chat, voz, visión, video y sandbox' },
];

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

const LeadsListView = dynamic(() => import('@/features/command-center/ui/LeadsListView'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl bg-white/5 animate-pulse" />,
});

/**
 * Houston Command Center - Admin Dashboard
 * Punto de entrada oficial de Richard Automotive.
 */
export default function AdminPage() {
  const [activeView, setActiveView] = React.useState<'crm' | 'houston' | 'users' | 'leads'>('crm');

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
            onClick={() => setActiveView('leads')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeView === 'leads'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Leads
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

      {/* Hub unificado de herramientas admin */}
      <div className="px-4 py-2.5 border-b border-white/5 bg-slate-950/40 flex items-center gap-2 overflow-x-auto flex-nowrap">
        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] shrink-0 mr-1">
          Herramientas
        </span>
        {ADMIN_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <a
              key={tool.href}
              href={tool.href}
              title={tool.desc}
              className="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all"
            >
              <Icon size={12} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              {tool.label}
            </a>
          );
        })}
      </div>

      <main className="p-6">
        <React.Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="animate-spin w-12 h-12 border-4 border-cyan-500 rounded-full border-t-transparent" />
            </div>
          }
        >
          {activeView === 'crm' ? <CRMBoard /> : activeView === 'houston' ? <HoustonDashboard /> : activeView === 'leads' ? <LeadsListView /> : <UsersTab />}
        </React.Suspense>
      </main>
    </div>
  );
}
