import React from 'react';
import { User as UserIcon, Server, BarChart3, CarFront, Package, Search } from 'lucide-react';
import { StatusWidget, CountUp } from './widgets/AdminWidgets';
import { Car as CarType, Lead } from '@/types/types';

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
    <div className="space-y-8">
      <React.Suspense
        fallback={<div className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />}
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
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-white/10 p-8 hover:border-[#00aed9]/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/digital-twin')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00aed9]/10 rounded-full blur-3xl group-hover:bg-[#00aed9]/20 transition-all" />
          <UserIcon
            className="text-[#00aed9] mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h3 className="text-2xl font-black text-white uppercase mb-2">
            Gemelo Digital
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            Crea contenido de marketing viral con tu avatar IA.
          </p>
          <span className="text-xs font-bold text-[#00aed9] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            Ingresar <div className="w-4 h-[1px] bg-[#00aed9]" />
          </span>
        </div>

        <div
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-white/10 p-8 hover:border-purple-500/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/framework-lab')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
          <Server
            className="text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h3 className="text-2xl font-black text-white uppercase mb-2">Framework Lab</h3>
          <p className="text-slate-400 text-sm mb-6">
            Gestiona integraciones experimentales (Svelte, Astro).
          </p>
          <span className="text-xs font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            Configurar <div className="w-4 h-[1px] bg-purple-500" />
          </span>
        </div>

        <div
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-white/10 p-8 hover:border-emerald-500/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => setActiveTab('analytics')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <BarChart3
            className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h3 className="text-2xl font-black text-white uppercase mb-2">Analytics Pro</h3>
          <p className="text-slate-400 text-sm mb-6">
            Mapa de calor de inventario y tendencias.
          </p>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            Ver Datos <div className="w-4 h-[1px] bg-emerald-500" />
          </span>
        </div>
      </div>
    </div>
  );
};
