import React, { useState, useEffect, useCallback } from 'react';
import { useDealer } from '@/contexts/DealerContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { container } from '@/infra/di/container';
import { Car, Lead, AppUser } from '@/domain/entities';
import { Subscriber } from '@/types/types';
import {
  Plus,
  BarChart3,
  Package,
  Search,
  DatabaseZap,
  Smartphone,
  Monitor,
  Server,
  CarFront,
  ShieldAlert,
  Sparkles,
  User as UserIcon,
  CreditCard,
  ShieldCheck,
  Zap,
  Scale,
  FlaskConical,
  Radio,
  ArrowRight,
  ShoppingBag,
  Activity,
  DollarSign,
} from 'lucide-react';
import { leadService } from '@/services/leadService';
import { getSubscribers, auth } from '@/services/firebaseService';
import { optimizeImage } from '@/services/firebaseShared';
import { useAntigravity } from '@/hooks/useAntigravity';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store';

import { GetLeads } from '@/application/use-cases/GetLeads';
import { FirestoreLeadRepository } from '@/infra/repositories/FirestoreLeadRepository';
import { InventoryHeatmap } from '@/features/inventory/ui/InventoryHeatmap';
import { useMouseGlow } from '@/hooks/useMouseGlow';
// import { useReactToPrint } from 'react-to-print'; // Removed
// import DealSheet from './DealSheet'; // Deprecated in favor of jsPDF

// Lazy modules loaded by tab/interaction to keep Admin shell lighter
const CRMBoard = React.lazy(() => import('./CRMBoard'));
const SalesCopilot = React.lazy(() => import('./SalesCopilot'));
const CommandCenterModal = React.lazy(() =>
  import('./CommandCenterModal').then((m) => ({ default: m.CommandCenterModal })),
);
const AuditLogViewer = React.lazy(() =>
  import('./AuditLogViewer').then((m) => ({ default: m.AuditLogViewer })),
);
const GapAnalyticsWidget = React.lazy(() =>
  import('./GapAnalyticsWidget').then((m) => ({ default: m.GapAnalyticsWidget })),
);
const B2BBillingDashboard = React.lazy(() => import('./B2BBillingDashboard'));
const EnterpriseStatus = React.lazy(() =>
  import('./EnterpriseStatus').then((m) => ({ default: m.EnterpriseStatus })),
);
const MarketingCreativeStudio = React.lazy(() =>
  import('./MarketingCreativeStudio').then((m) => ({ default: m.MarketingCreativeStudio })),
);
const ViralGeneratorModal = React.lazy(
  () => import('@/features/marketing/components/ViralGeneratorModal'),
);
const SentinelInventoryTab = React.lazy(() => import('./SentinelInventoryTab'));
const AILabView = React.lazy(() => import('@/features/ai/components/AILabView'));
const VehicleMonitor = React.lazy(() => import('./VehicleMonitor'));
const MissionControlWidget = React.lazy(() => import('./MissionControlWidget'));
const SentinelStatusBar = React.lazy(() =>
  import('./SentinelStatusBar').then((m) => ({ default: m.SentinelStatusBar })),
);
const InventoryProfitabilityWidget = React.lazy(() => import('./InventoryProfitabilityWidget'));
const IntakeView = React.lazy(() => import('./IntakeView'));
const HoustonTelemetryTab = React.lazy(() =>
  import('./HoustonTelemetryTab').then((m) => ({ default: m.HoustonTelemetryTab })),
);
const QuickQualifyCard = React.lazy(() => import('@/features/loans/ui/QuickQualifyCard'));

import { BrandErrorBoundary } from '@/shared/brand-ui/common/BrandErrorBoundary';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Refactored Sub-components (Lazy loaded to reduce initial bundle)
const MissionControlDashboard = React.lazy(() =>
  import('./MissionControlDashboard').then((m) => ({ default: m.MissionControlDashboard })),
);
const SentinelAnalyticsTab = React.lazy(() =>
  import('./SentinelAnalyticsTab').then((m) => ({ default: m.SentinelAnalyticsTab })),
);

interface Props {
  inventory: Car[];
  onUpdate: (car: Car) => Promise<void>;
  onAdd: (car: Omit<Car, 'id'>) => Promise<void>;
  onDelete: (id: string) => void;
  onInitializeDb?: () => Promise<void>;
}

// --- MAIN COMPONENT: COMMAND CENTER ---
const CommandCenterPanel: React.FC<Props> = ({
  inventory,
  onUpdate,
  onAdd,
  onDelete,
  onInitializeDb,
}) => {
  const { currentDealer } = useDealer();
  const location = useLocation();
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.endsWith('/inventory')) return 'inventory';
    if (path.endsWith('/pipeline')) return 'pipeline';
    if (path.endsWith('/marketing')) return 'marketing';
    if (path.endsWith('/analytics')) return 'analytics';
    if (path.endsWith('/copilot')) return 'copilot';
    if (path.endsWith('/security')) return 'security';
    if (path.endsWith('/billing')) return 'billing';
    if (path.endsWith('/lab')) return 'lab';
    if (path.endsWith('/telemetry')) return 'telemetry';
    if (path.endsWith('/intake')) return 'intake';

    return 'dashboard';
  };
  const activeTab = getActiveTab();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [marketingCar, setMarketingCar] = useState<Car | null>(null);
  const [viralCar, setViralCar] = useState<Car | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Widget States
  const [deviceType, setDeviceType] = useState<'Mac' | 'iPhone'>('Mac');
  const securityScore = 98;

  const navigate = useNavigate(); // For Quick Actions
  const { status: antigravityStatus, refresh: refreshAntigravity } = useAntigravity();
  const { containerRef } = useMouseGlow();

  const fetchDashboardData = useCallback(async () => {
    try {
      const dealerId = currentDealer.id || 'richard-automotive';
      const useCase = container.getGetLeadsUseCase();
      const updatedLeads = await useCase.execute(dealerId);
      setLeads(updatedLeads);
    } catch (e) {
      console.error('Leads Fetch Error:', e);
    }
  }, [currentDealer.id]);

  useEffect(() => {
    fetchDashboardData();

    // Detect device (Basic)
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Android')) {
      setDeviceType('iPhone');
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    if (activeTab === 'marketing') {
      getSubscribers().then(setSubscribers).catch(console.error);
    }
  }, [activeTab]);

  /* 
  const triggerPrint = useCallback(async (lead: Lead) => {
    try {
      const { generateLeadPDF } = await import('@/utils/pdfGenerator');
      generateLeadPDF(lead);
    } catch (e) {
      console.error("PDF Error:", e);
      alert("Error generando PDF. Ver consola.");
    }
  }, []);
  */

  const handleInitClick = useCallback(async () => {
    if (!onInitializeDb) return;
    setIsInitializing(true);
    try {
      await onInitializeDb();
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitializing(false);
    }
  }, [onInitializeDb]);

  const handlePhotoUploaded = useCallback(() => {
    // Refresh data if needed
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div
      ref={containerRef as any}
      className="min-h-screen bg-transparent text-slate-200 font-sans transition-colors duration-300 relative overflow-hidden bg-noise"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8 relative z-10">
        {/* HEADER AREA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#00aed9] font-black text-[10px] uppercase tracking-[0.25em] mb-2 animate-in fade-in slide-in-from-left-5">
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

            {/* Houston Navigation */}
            <button
              onClick={() => navigate('/admin/houston')}
              className="h-10 px-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-2 group"
            >
              <Radio size={14} className="group-hover:animate-pulse" /> Sentinel Terminal
            </button>
          </div>

          {/* Strategic: Security Copilot Widget */}
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
              <div className="text-[10px] font-black text-[#00aed9] uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> Platform Health
              </div>
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                Latency: 24ms
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Quick Actions for Dashboard */}
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
              className="h-[44px] px-6 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />{' '}
              <span className="hidden sm:inline">Nueva Unidad</span>
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

        {/* Navigation moved to Sidebar (Nivel 13 Restoration) */}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-24 lg:pt-8 bg-transparent relative z-0 hide-scrollbar overflow-x-hidden">
          <BrandErrorBoundary>
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <MissionControlDashboard
                  inventory={inventory}
                  leads={leads}
                  deviceType={deviceType}
                />
              )}

              {activeTab === 'analytics' && (
                <SentinelAnalyticsTab inventory={inventory} leads={leads} />
              )}

              {activeTab === 'marketing' && (
                <motion.div
                  key="marketing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]"
                >
                  <div className="lg:col-span-2 glass-premium p-8 space-y-6">
                    <div className="flex items-center gap-3 text-[#00aed9] font-black text-xs uppercase tracking-[0.2em]">
                      <Sparkles size={20} /> Content Engine
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                      Estrategia Semántica
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Richard IA utiliza búsqueda semántica para identificar qué modelos de tu
                      inventario tienen más "momentum" basado en las consultas de los usuarios.
                      Selecciona una unidad abajo para generar contenido viral.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inventory.slice(0, 4).map((car) => (
                        <button
                          key={car.id}
                          onClick={() => setMarketingCar(car)}
                          className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-[#00aed9] hover:bg-slate-800 transition-all text-left group"
                        >
                          <img
                            src={optimizeImage(car.img, 100)}
                            alt={car.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-black text-white uppercase tracking-tight">
                              {car.name}
                            </div>
                            <div className="text-[10px] text-[#00aed9] font-bold uppercase tracking-widest">
                              Planear Post ✨
                            </div>
                          </div>
                        </button>
                      ))}
                      <p className="text-slate-400 text-xs md:text-sm mt-1">
                        Vincula este dispositivo para iniciar sesión sin contraseña usando FaceID o
                        TouchID.
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!auth.currentUser) return alert('Debes estar logueado.');
                        try {
                          const { registerPasskey } =
                            await import('@/features/auth/services/authService');
                          await registerPasskey(auth.currentUser);
                          alert('✅ Dispositivo vinculado exitosamente.');
                        } catch (err: unknown) {
                          const error = err as { message: string };
                          alert('Error: ' + error.message);
                        }
                      }}
                      className="px-6 py-3 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white border border-[#00aed9]/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <Smartphone size={16} /> Vincular Dispositivo
                    </button>
                  </div>

                  <div className="min-h-[600px]">
                    <React.Suspense
                      fallback={
                        <div className="p-12 text-center text-slate-500">Cargando auditoria...</div>
                      }
                    >
                      <AuditLogViewer />
                    </React.Suspense>
                  </div>
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[600px]"
                >
                  <React.Suspense
                    fallback={
                      <div className="p-12 text-center text-slate-500">Cargando facturacion...</div>
                    }
                  >
                    <B2BBillingDashboard />
                  </React.Suspense>
                </motion.div>
              )}

              {activeTab === 'lab' && (
                <motion.div
                  key="lab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[600px] glass-premium overflow-hidden"
                >
                  <React.Suspense
                    fallback={<div className="p-10 text-center">Cargando Laboratorio...</div>}
                  >
                    <AILabView />
                  </React.Suspense>
                </motion.div>
              )}

              {activeTab === 'intake' && (
                <motion.div
                  key="intake"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <React.Suspense
                    fallback={
                      <div className="p-12 text-center text-slate-500 animate-pulse">
                        Iniciando Protocolo de Recepción Digital...
                      </div>
                    }
                  >
                    <IntakeView />
                  </React.Suspense>
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <React.Suspense
                    fallback={
                      <div className="p-12 text-center text-slate-500">Cargando inventario...</div>
                    }
                  >
                    <SentinelInventoryTab
                      inventory={inventory}
                      leads={leads}
                      onDelete={onDelete}
                      onCreateNew={() => {
                        setEditingCar(null);
                        setIsModalOpen(true);
                      }}
                      onEdit={(car) => {
                        setEditingCar(car);
                        setIsModalOpen(true);
                      }}
                      onPlanContent={(car) => setViralCar(car)}
                      onInitializeDb={onInitializeDb}
                      handleInitClick={handleInitClick}
                      isInitializing={isInitializing}
                    />
                  </React.Suspense>
                </motion.div>
              )}
              {activeTab === 'telemetry' && (
                <motion.div
                  key="telemetry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[600px]"
                >
                  <React.Suspense
                    fallback={
                      <div className="p-12 text-center text-slate-500 animate-pulse font-mono tracking-widest uppercase">
                        Establishing Secure Link to Houston...
                      </div>
                    }
                  >
                    <HoustonTelemetryTab />
                  </React.Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </BrandErrorBoundary>
        </div>
      </div>

      {/* MODAL EDITOR */}
      {isModalOpen && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <CommandCenterModal
            car={editingCar}
            onClose={() => setIsModalOpen(false)}
            onPhotoUploaded={handlePhotoUploaded}
            onSave={async (data: Omit<Car, 'id'>) => {
              if (editingCar) await onUpdate({ ...data, id: editingCar.id });
              else await onAdd(data);
            }}
          />
        </React.Suspense>
      )}

      {/* MARKETING STUDIO */}
      {marketingCar && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <MarketingCreativeStudio car={marketingCar} onClose={() => setMarketingCar(null)} />
        </React.Suspense>
      )}

      {viralCar && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <ViralGeneratorModal
            car={viralCar}
            isOpen={!!viralCar}
            onClose={() => setViralCar(null)}
          />
        </React.Suspense>
      )}

      <Suspense fallback={null}>
        <SentinelStatusBar />
      </Suspense>
    </div>
  );
};

export default CommandCenterPanel;
