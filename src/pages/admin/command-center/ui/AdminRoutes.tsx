import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Sparkles } from 'lucide-react';
import { auth } from '@/shared/api/firebase/firebaseService';
import { optimizeImage } from '@/shared/api/firebase/firebaseShared';

import CommandCenterLayout, { CommandCenterContextType } from './CommandCenterLayout';

// Lazy imports for admin tabs
const SentinelInventoryTab = React.lazy(() => import('./SentinelInventoryTab'));
const IntakeView = React.lazy(() => import('./IntakeView'));
const SentinelAnalyticsTab = React.lazy(() => import('./SentinelAnalyticsTab').then((m) => ({ default: m.SentinelAnalyticsTab })));
const MissionControlDashboard = React.lazy(() => import('./MissionControlDashboard').then((m) => ({ default: m.MissionControlDashboard })));
const AuditLogViewer = React.lazy(() => import('./AuditLogViewer').then((m) => ({ default: m.AuditLogViewer })));
const HoustonTelemetryTab = React.lazy(() => import('./HoustonTelemetryTab').then((m) => ({ default: m.HoustonTelemetryTab })));
const B2BBillingDashboard = React.lazy(() => import('./B2BBillingDashboard'));
const AILabPage = React.lazy(() => import('@/pages/ai-lab/ui/AILabPage'));
const CRMBoard = React.lazy(() => import('./CRMBoard'));
const HoustonDashboard = React.lazy(() => import('@/widgets/houston/HoustonDashboard'));
const DealDesker = React.lazy(() => import('./DealDesker'));

const LeadAnalyticsPage = React.lazy(() => import('@/features/leads').then(m => ({ default: m.LeadAnalyticsPage })));

// Wrappers binding Layout Context to Components
const DashboardWrapper = () => {
  const ctx = useOutletContext<CommandCenterContextType>();
  return <MissionControlDashboard inventory={ctx.inventory} leads={ctx.leads} deviceType={ctx.deviceType} />;
};

const InventoryWrapper = () => {
  const ctx = useOutletContext<CommandCenterContextType>();
  return (
    <SentinelInventoryTab
      onDelete={ctx.onDelete}
      onCreateNew={() => { ctx.setEditingCar(null); ctx.setIsModalOpen(true); }}
      onEdit={(car) => { ctx.setEditingCar(car); ctx.setIsModalOpen(true); }}
      onPlanContent={(car) => ctx.setViralCar(car)}
      onInitializeDb={ctx.onInitializeDb}
      handleInitClick={ctx.handleInitClick}
      isInitializing={ctx.isInitializing}
    />
  );
};

const AnalyticsWrapper = () => {
  const ctx = useOutletContext<CommandCenterContextType>();
  return <SentinelAnalyticsTab inventory={ctx.inventory} leads={ctx.leads} />;
};

const CRMBoardWrapper = () => {
  const ctx = useOutletContext<CommandCenterContextType>();
  return <CRMBoard onUpdate={ctx.onUpdate} onDelete={ctx.onDelete} />;
};

const MarketingWrapper = () => {
  const ctx = useOutletContext<CommandCenterContextType>();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]"
    >
      <div className="lg:col-span-2 glass-premium p-8 space-y-6">
        <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em]">
          <Sparkles size={20} /> Content Engine
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Estrategia Semántica</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Richard IA utiliza búsqueda semántica para identificar qué modelos de tu
          inventario tienen más "momentum" basado en las consultas de los usuarios.
          Selecciona una unidad abajo para generar contenido viral.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ctx.inventory.slice(0, 4).map((car) => (
            <button
              key={car.id}
              onClick={() => ctx.setMarketingCar(car)}
              className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-primary hover:bg-slate-800 transition-all text-left group"
            >
              <img src={optimizeImage(car.img, 100)} alt={car.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight">{car.name}</div>
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Planear Post ✨</div>
              </div>
            </button>
          ))}
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            Vincula este dispositivo para iniciar sesión sin contraseña usando FaceID o TouchID.
          </p>
        </div>
        <button
          onClick={async () => {
            if (!auth.currentUser) return alert('Debes estar logueado.');
            try {
              const { registerPasskey } = await import('@/features/auth');
              await registerPasskey(auth.currentUser);
              alert('✅ Dispositivo vinculado exitosamente.');
            } catch (err: unknown) {
              alert('Error: ' + (err as Error).message);
            }
          }}
          className="px-6 py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          <Smartphone size={16} /> Vincular Dispositivo
        </button>
      </div>
      <div className="min-h-[600px]">
        <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando auditoria...</div>}>
          <AuditLogViewer />
        </Suspense>
      </div>
    </motion.div>
  );
};

export const AdminRoutes = (props: any) => {
  return (
    <Routes>
      <Route element={<CommandCenterLayout {...props} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="inventory" element={<InventoryWrapper />} />
        <Route path="intake" element={<IntakeView />} />
        <Route path="analytics" element={<AnalyticsWrapper />} />
        <Route path="analytics/:leadId" element={<LeadAnalyticsPage />} />
        <Route path="billing" element={<B2BBillingDashboard />} />
        <Route path="lab" element={<AILabPage />} />
        <Route path="telemetry" element={<HoustonTelemetryTab />} />
        <Route path="pipeline" element={<CRMBoardWrapper />} />
        <Route path="desker" element={<Suspense fallback={<div className="p-8 text-slate-500">Cargando herramienta financiera...</div>}><DealDesker /></Suspense>} />
        <Route path="marketing" element={<MarketingWrapper />} />
        <Route path="houston" element={<HoustonDashboard />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
