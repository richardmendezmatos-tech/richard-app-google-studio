import React from 'react';
import { motion } from 'framer-motion';
import {
  CarFront,
  BarChart3,
  Package,
  Search,
  User as UserIcon,
  ShoppingBag,
  Activity,
  DollarSign,
  Server,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Car, Lead } from '@/entities/shared';
import { StatusWidget, CountUp } from './CommandCenterWidgets';

// Lazy components used within the tab
const MissionControlWidget = React.lazy(() => import('./MissionControlWidget'));
const InventoryProfitabilityWidget = React.lazy(() => import('./InventoryProfitabilityWidget'));
const QuickQualifyCard = React.lazy(() => import('@/features/loans').then(m => ({ default: m.QuickQualifyCard })));

interface Props {
  inventory: Car[];
  leads: Lead[];
  deviceType: string;
}

export const MissionControlDashboard: React.FC<Props> = ({ inventory, leads, deviceType }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <React.Suspense fallback={<div className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MissionControlWidget />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <QuickQualifyCard />
            <InventoryProfitabilityWidget inventory={inventory} />
          </div>
        </div>
      </React.Suspense>

      {/* KPI WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusWidget
          icon={CarFront}
          label="Total Unidades"
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

      {/* QUICK ACCESS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Digital Twin Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-white/10 p-8 hover:border-primary/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/digital-twin')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <UserIcon
            className="text-primary mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h3 className="text-2xl font-black text-white uppercase mb-2">Gemelo Digital</h3>
          <p className="text-slate-400 text-sm mb-6">
            Crea contenido de marketing viral con tu avatar IA.
          </p>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
            Abrir Laboratorio <ArrowRight size={14} />
          </div>
        </div>

        {/* In-Take Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-emerald-500/20 p-8 hover:border-emerald-500/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/intake')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <ShoppingBag
            className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h3 className="text-2xl font-black text-white uppercase mb-2">In-Take Digital</h3>
          <p className="text-slate-400 text-sm mb-6">Recibe y evalúa nuevas unidades con IA.</p>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
            Iniciar Protocolo <ArrowRight size={14} />
          </div>
        </div>

        {/* CRM Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-white/10 p-8 hover:border-cyan-500/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/pipeline')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
          <Activity
            className="text-cyan-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-green-400" /> Gestión de Oportunidades
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Gestiona tus oportunidades de venta activas.
          </p>
          <div className="flex items-center gap-2 text-cyan-500 font-black text-[10px] uppercase tracking-widest">
            Ver Embudo <ArrowRight size={14} />
          </div>
        </div>

        {/* Framework Lab Card */}
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

        {/* Analytics Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-sentinel border border-white/10 p-8 hover:border-emerald-500/50 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/analytics')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <BarChart3
            className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={40}
          />
          <h3 className="text-2xl font-black text-white uppercase mb-2">Analytics Pro</h3>
          <p className="text-slate-400 text-sm mb-6">Mapa de calor de inventario y tendencias.</p>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            Ver Datos <div className="w-4 h-[1px] bg-emerald-500" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
