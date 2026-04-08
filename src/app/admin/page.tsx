'use client';

import React from 'react';
import CRMBoard from '@/features/command-center/legacy/CRMBoard';
import HoustonDashboard from '@/widgets/houston/HoustonDashboard';
import SEO from '@/shared/ui/seo/SEO';

/**
 * Houston Command Center - Admin Dashboard
 * Punto de entrada oficial de Richard Automotive.
 */
export default function AdminPage() {
  const [activeView, setActiveView] = React.useState<'crm' | 'houston'>('crm');

  return (
    <div className="min-h-screen bg-[#0d2232] text-white overflow-x-hidden">
      <SEO 
        title="Houston Mission Control | Richard Automotive" 
        description="Panel de comando inteligente para la gestión de leads e inventario."
        noIndex={true}
      />
      
      {/* Mini Header / Houston Switcher */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
          <h1 className="text-sm font-black uppercase tracking-[0.3em] font-orbitron">
            Houston <span className="text-cyan-400">Mission Control</span>
          </h1>
        </div>
        
        <nav className="flex bg-slate-900/50 rounded-full p-1 border border-white/5">
          <button 
            onClick={() => setActiveView('crm')}
            className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === 'crm' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            CRM Board
          </button>
          <button 
            onClick={() => setActiveView('houston')}
            className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === 'houston' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Telemetría
          </button>
        </nav>
      </header>

      <main className="p-6">
        <React.Suspense fallback={
          <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500 rounded-full border-t-transparent" />
          </div>
        }>
          {activeView === 'crm' ? <CRMBoard /> : <HoustonDashboard />}
        </React.Suspense>
      </main>
    </div>
  );
}
