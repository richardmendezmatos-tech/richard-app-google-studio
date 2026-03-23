import React from 'react';
import { User as UserIcon, Server, BarChart3, CarFront, Package, Search } from 'lucide-react';
import { StatusWidget, CountUp } from './widgets/AdminWidgets';
import { Car as CarType, Lead } from '@/shared/types/types';

interface Props {
  inventory: CarType[];
  leads: Lead[];
  deviceType: string;
  navigate: (path: string) => void;
  setActiveTab: (tab: any) => void;
  MissionControlWidget: React.LazyExoticComponent<any>;
}

export const AdminDashboardTab: React.FC<Props> = ({
  inventory,
  leads,
  deviceType,
  navigate,
  setActiveTab,
  MissionControlWidget
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <React.Suspense
        fallback={<div className="h-48 rounded-4xl bg-slate-900/40 animate-pulse border border-white/5" />}
      >
        <MissionControlWidget />
      </React.Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusWidget
          icon={CarFront}
          label="Total Inventario"
          value={<CountUp end={inventory.length} prefix="" />}
          color="bg-blue-500 text-blue-500"
          subValue={inventory.length > 0 ? 'Actualizado' : 'Sin stock'}
        />
        <StatusWidget
          icon={BarChart3}
          label="Leads Activos"
          value={<CountUp end={leads.filter((l) => l.status === 'new').length} />}
          color="bg-emerald-500 text-emerald-500"
          subValue="Potenciales hoy"
        />
        <StatusWidget
          icon={Package}
          label="Valor Total"
          value={
            <CountUp
              end={inventory.reduce((sum, car) => sum + (Number(car.price) || 0), 0)}
              prefix="$"
            />
          }
          color="bg-purple-500 text-purple-500"
          subValue="Estimado"
        />
        <StatusWidget
          icon={Search}
          label="Sistema"
          value="100%"
          color="bg-amber-500 text-amber-500"
          subValue={`v3.0 • ${deviceType}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="group relative overflow-hidden rounded-4xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:border-primary/50 hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(0,174,217,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/digital-twin')}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
          <div className="relative z-10">
            <UserIcon
              className="text-primary mb-6 group-hover:scale-110 transition-transform duration-500"
              size={44}
              strokeWidth={1.5}
            />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
              Gemelo Digital
            </h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Crea contenido de marketing viral con tu avatar IA conectado al inventario.
            </p>
            <span className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-3 group-hover:gap-5 transition-all">
              Ingresar <div className="w-8 h-px bg-primary group-hover:w-12 transition-all" />
            </span>
          </div>
        </div>

        <div
          className="group relative overflow-hidden rounded-4xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:border-purple-500/50 hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          onClick={() => navigate('/framework-lab')}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <Server
              className="text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-500"
              size={44}
              strokeWidth={1.5}
            />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-purple-400 transition-colors">Framework Lab</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Gestiona despliegues, workers, e integraciones experimentales (Vercel, AI Servers).
            </p>
            <span className="text-xs font-black text-purple-500 uppercase tracking-widest flex items-center gap-3 group-hover:gap-5 transition-all">
              Configurar <div className="w-8 h-px bg-purple-500 group-hover:w-12 transition-all" />
            </span>
          </div>
        </div>

        <div
          className="group relative overflow-hidden rounded-4xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 hover:border-emerald-500/50 hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          onClick={() => setActiveTab('analytics')}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="relative z-10">
            <BarChart3
              className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform duration-500"
              size={44}
              strokeWidth={1.5}
            />
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-emerald-400 transition-colors">Analytics Pro</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Mapa de calor de inventario, retención de leads y métricas de ROI.
            </p>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-3 group-hover:gap-5 transition-all">
              Ver Datos <div className="w-8 h-px bg-emerald-500 group-hover:w-12 transition-all" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
