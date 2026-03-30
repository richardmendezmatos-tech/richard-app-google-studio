import React from 'react';
import { motion } from 'motion/react';
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
  Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Car } from '@/entities/inventory';
import { StatusWidget, CountUp } from './CommandCenterWidgets';
import { NeuralInsightsHeadlines } from './components/NeuralInsightsHeadlines';

// Lazy components used within the tab
const MissionControlWidget = React.lazy(() => import('./MissionControlWidget'));
const InventoryProfitabilityWidget = React.lazy(() => import('./InventoryProfitabilityWidget'));
const QuickQualifyCard = React.lazy(() =>
  import('@/features/loans').then((m) => ({ default: m.QuickQualifyCard })),
);

interface Props {
  inventory: Car[];
  leads: Lead[];
  deviceType: string;
}

export const MissionControlDashboard: React.FC<Props> = ({ inventory, leads, deviceType }) => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div
      key="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6 pb-12"
    >
      <NeuralInsightsHeadlines />
      <React.Suspense fallback={<div className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />}>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
          <div className="md:col-span-1">
            <QuickQualifyCard />
          </div>
          <div className="md:col-span-1">
            <InventoryProfitabilityWidget inventory={inventory} />
          </div>
        </motion.div>
      </React.Suspense>

      {/* KPI WIDGETS ROW */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatusWidget
          icon={CarFront}
          label="Total Unidades"
          value={<CountUp end={inventory.length} prefix="" />}
          color="bg-gradient-to-br from-blue-500/20 to-cyan-400/20 text-cyan-400 border border-cyan-500/30"
          subValue={inventory.length > 0 ? 'OPTIMAL' : 'OUT OF STOCK'}
          trendData={[20, 22, 21, 25, 24, 28, inventory.length]}
        />
        <StatusWidget
          icon={BarChart3}
          label="Leads Activos"
          value={<CountUp end={leads.filter((l) => l.status === 'new').length} />}
          color="bg-gradient-to-br from-emerald-500/20 to-teal-400/20 text-emerald-400 border border-emerald-500/30"
          subValue="CONV. PIPELINE"
          trendData={[10, 15, 12, 18, 20, 25, leads.length]}
        />
        <StatusWidget
          icon={Package}
          label="Valor de Inventario"
          value={
            <CountUp
              end={inventory.reduce((sum, car) => sum + (Number(car.price) || 0), 0)}
              prefix="$"
            />
          }
          color="bg-gradient-to-br from-purple-500/20 to-indigo-400/20 text-purple-400 border border-purple-500/30"
          subValue="CAPITAL ASSETS"
          trendData={[50, 45, 55, 60, 58, 65, 70]}
        />
        <StatusWidget
          icon={Activity}
          label="Salud del Sistema"
          value="100%"
          color="bg-amber-500/20 text-amber-500 border border-amber-500/30"
          subValue={`API v3.2`}
          trendData={[98, 99, 100, 100, 99, 100, 100]}
        />
      </motion.div>

      {/* QUICK ACCESS GRID */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Strategy Lab Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-premium border border-white/5 p-6 hover:border-primary/40 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/strategy-lab')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all" />
          <UserIcon
            className="text-primary mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700"
            size={32}
          />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
            Strategy Lab
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
            Ingeniería de marketing y simulación de demanda con tu avatar IA.
          </p>
          <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.2em]">
            RA PROTOCOL{' '}
            <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* In-Take Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-premium border border-emerald-500/10 p-6 hover:border-emerald-500/30 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/intake')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <ShoppingBag
            className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={32}
          />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
            In-Take Digital
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
            Evalúa nuevas unidades con visión artificial computarizada.
          </p>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
            Protocolo{' '}
            <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* CRM Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-premium border border-white/5 p-6 hover:border-cyan-500/30 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/pipeline')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
          <Activity
            className="text-cyan-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={32}
          />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
            Pipeline Central
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
            Gestión de oportunidades y cierre de ventas omnicanal.
          </p>
          <div className="flex items-center gap-2 text-cyan-500 font-black text-[9px] uppercase tracking-widest">
            Tablero{' '}
            <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Framework Lab Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-premium border border-white/5 p-6 hover:border-purple-500/30 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/framework-lab')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
          <Server
            className="text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={32}
          />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
            Framework Lab
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
            Configuración de integraciones y despliegues experimentales.
          </p>
          <div className="flex items-center gap-2 text-purple-500 font-black text-[9px] uppercase tracking-widest">
            Terminal{' '}
            <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Analytics Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-premium border border-white/5 p-6 hover:border-emerald-500/30 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/analytics')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <BarChart3
            className="text-emerald-500 mb-4 group-hover:scale-110 transition-transform duration-500"
            size={32}
          />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
            Analytics Pro
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
            Inteligencia predictiva sobre inventario y tendencias locales.
          </p>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
            Ver Datos{' '}
            <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Houston Intelligence Hub Card */}
        <div
          className="group relative overflow-hidden rounded-[2rem] glass-premium border border-cyan-500/10 p-6 hover:border-cyan-500/30 transition-all cursor-pointer hover-kinetic"
          onClick={() => navigate('/admin/houston')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all" />
          <Radio className="text-cyan-400 mb-4 group-hover:animate-pulse" size={32} />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
            Houston Hub
          </h3>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
            Terminal de telemetría avanzada y control maestro.
          </p>
          <div className="flex items-center gap-2 text-cyan-400 font-black text-[9px] uppercase tracking-widest">
            Terminal{' '}
            <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
