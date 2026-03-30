import React from 'react';
import { ShieldCheck, Radio, Scale, Zap, User as UserIcon, Plus, DatabaseZap } from 'lucide-react';
import { Car as CarType } from '@/shared/types/types';

interface Props {
  currentDealer: any;
  antigravityStatus: string;
  refreshAntigravity: () => void;
  securityScore: number;
  navigate: (path: string) => void;
  setEditingCar: (car: CarType | null) => void;
  setIsModalOpen: (open: boolean) => void;
  fetchDashboardData: () => void;
  EnterpriseStatus: React.LazyExoticComponent<any>;
}

export const AdminHeader: React.FC<Props> = ({
  currentDealer,
  antigravityStatus,
  refreshAntigravity,
  securityScore,
  navigate,
  setEditingCar,
  setIsModalOpen,
  fetchDashboardData,
  EnterpriseStatus,
}) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
      <div>
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.25em] mb-2 animate-in fade-in slide-in-from-left-5">
          <ShieldCheck size={12} />
          <span>Command Center v2.0</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentDealer.name}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={refreshAntigravity}
          className={`h-10 rounded-xl border px-4 text-[10px] font-black uppercase tracking-widest transition-all ${
            antigravityStatus === 'online'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : antigravityStatus === 'checking'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : antigravityStatus === 'disabled'
                  ? 'border-slate-600 bg-slate-800 text-slate-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
          }`}
          title="Verificar estado de Antigravity"
        >
          AG: {antigravityStatus}
        </button>
        <React.Suspense
          fallback={<div className="h-10 w-40 rounded-xl bg-white/5 animate-pulse" />}
        >
          <EnterpriseStatus />
        </React.Suspense>

        <React.Suspense
          fallback={<div className="h-10 w-40 rounded-xl bg-white/5 animate-pulse" />}
        >
          <EnterpriseStatus />
        </React.Suspense>
      </div>

      <div className="hidden xl:flex items-center gap-4 px-6 py-3 glass-premium border border-white/10 rounded-2xl backdrop-blur-3xl group cursor-default route-fade-in hover-kinetic">
        <div className="relative">
          <ShieldCheck
            className="text-emerald-500 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"
            size={24}
          />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Security Copilot
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[8px] font-black rounded-md uppercase">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">
              Zero Trust Integrity: {securityScore}%
            </div>
            <div className="w-1 h-1 bg-slate-700 rounded-full" />
            <div className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <Scale size={8} /> AI Fairness: 99%
            </div>
          </div>
        </div>
        <div className="w-[1px] h-8 bg-white/10 mx-2" />
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
            <Zap size={10} fill="currentColor" /> Platform Health
          </div>
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            Latency: 24ms
          </div>
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto">
        <button
          onClick={() => navigate('/digital-twin')}
          className="h-[44px] px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <UserIcon size={18} /> Gemelo Digital
        </button>

        <button
          onClick={() => {
            setEditingCar(null);
            setIsModalOpen(true);
          }}
          className="h-[44px] px-6 bg-primary hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Nueva Unidad</span>
          <span className="sm:hidden">Nuevo</span>
        </button>

        <button
          onClick={fetchDashboardData}
          className="w-[44px] h-[44px] bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:rotate-180 duration-500"
          title="Recargar Datos"
        >
          <DatabaseZap size={18} />
        </button>
      </div>
    </header>
  );
};
