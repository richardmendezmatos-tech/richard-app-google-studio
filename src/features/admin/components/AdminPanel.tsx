import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car as CarType } from '@/types/types';
import {
  BarChart3,
  Package,
  ShieldAlert,
  Sparkles,
  CreditCard,
  Monitor,
  FlaskConical,
  Radio,
  User as UserIcon,
  Smartphone,
  Zap
} from 'lucide-react';
import { auth } from '@/services/firebaseService';
import { optimizeImage } from '@/services/firebaseShared';
import { useAntigravity } from '@/hooks/useAntigravity';
import { InventoryHeatmap } from '@/features/inventory/ui/InventoryHeatmap';
import { useMouseGlow } from '@/hooks/useMouseGlow';
import { BrandErrorBoundary } from '@/shared/brand-ui/common/BrandErrorBoundary';

import { useAdminPanelState } from '../hooks/useAdminPanelState';
import { AdminHeader } from './AdminHeader';
import { AdminDashboardTab } from './AdminDashboardTab';

// Lazy modules
const CRMBoard = React.lazy(() => import('./CRMBoard'));
const SalesCopilot = React.lazy(() => import('./SalesCopilot'));
const AdminModal = React.lazy(() => import('./AdminModal').then((m) => ({ default: m.AdminModal })));
const AuditLogViewer = React.lazy(() => import('./AuditLogViewer').then((m) => ({ default: m.AuditLogViewer })));
const GapAnalyticsWidget = React.lazy(() => import('./GapAnalyticsWidget').then((m) => ({ default: m.GapAnalyticsWidget })));
const B2BBillingDashboard = React.lazy(() => import('./B2BBillingDashboard'));
const EnterpriseStatus = React.lazy(() => import('./EnterpriseStatus').then((m) => ({ default: m.EnterpriseStatus })));
const MarketingCreativeStudio = React.lazy(() => import('./MarketingCreativeStudio').then((m) => ({ default: m.MarketingCreativeStudio })));
const ViralGeneratorModal = React.lazy(() => import('@/features/marketing/components/ViralGeneratorModal'));
const AdminInventoryTab = React.lazy(() => import('./AdminInventoryTab'));
const AILabView = React.lazy(() => import('@/features/ai/components/AILabView'));
const VehicleMonitor = React.lazy(() => import('./VehicleMonitor'));
const MissionControlWidget = React.lazy(() => import('./MissionControlWidget'));
const SentinelStatusBar = React.lazy(() => import('./SentinelStatusBar').then((m) => ({ default: m.SentinelStatusBar })));

interface Props {
  inventory: CarType[];
  onUpdate: (car: CarType) => Promise<void>;
  onAdd: (car: Omit<CarType, 'id'>) => Promise<void>;
  onDelete: (id: string) => void;
  onInitializeDb?: () => Promise<void>;
}

const AdminPanel: React.FC<Props> = ({ inventory, onUpdate, onAdd, onDelete, onInitializeDb }) => {
  const state = useAdminPanelState(onInitializeDb);
  const { status: antigravityStatus, refresh: refreshAntigravity } = useAntigravity();
  const { containerRef } = useMouseGlow();
  const navigate = useNavigate();

  return (
    <div
      ref={containerRef as any}
      className="min-h-screen bg-slate-950 text-slate-200 font-sans transition-colors duration-300 relative overflow-hidden bg-noise"
    >
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8 relative z-10">
        <AdminHeader
          currentDealer={state.currentDealer}
          antigravityStatus={antigravityStatus}
          refreshAntigravity={refreshAntigravity}
          securityScore={state.securityScore}
          navigate={navigate}
          setEditingCar={state.setEditingCar}
          setIsModalOpen={state.setIsModalOpen}
          fetchDashboardData={state.fetchDashboardData}
          EnterpriseStatus={EnterpriseStatus}
        />

        <div className="flex p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner w-full md:w-fit overflow-x-auto gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Monitor },
            { id: 'inventory', label: 'Inventario', icon: Package },
            { id: 'pipeline', label: 'CRM Leads', icon: BarChart3 },
            { id: 'copilot', label: 'Copilot', icon: Zap },
            { id: 'marketing', label: 'Marketing', icon: Sparkles },
            { id: 'security', label: 'Seguridad', icon: ShieldAlert },
            { id: 'billing', label: 'Facturación', icon: CreditCard },
            { id: 'lab', label: 'Laboratorio', icon: FlaskConical },
            { id: 'telemetry', label: 'Telemetría', icon: Radio },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => state.setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-6 h-[44px] rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all whitespace-nowrap ${
                state.activeTab === tab.id
                  ? 'bg-[#00aed9] text-white shadow-lg shadow-[#00aed9]/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
            </button>
          ))}
        </div>

        <main className="animate-in fade-in zoom-in-95 duration-300 min-h-[600px]">
          <BrandErrorBoundary>
            {state.activeTab === 'dashboard' && (
              <AdminDashboardTab
                inventory={inventory}
                leads={state.leads}
                deviceType={state.deviceType}
                navigate={navigate}
                setActiveTab={state.setActiveTab}
                MissionControlWidget={MissionControlWidget}
              />
            )}

            {state.activeTab === 'analytics' && (
              <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/10">
                <InventoryHeatmap inventory={inventory} />
              </div>
            )}

            {state.activeTab === 'marketing' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 shadow-xl space-y-6">
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
                        onClick={() => state.setMarketingCar(car)}
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
                  </div>
                </div>
                <div className="lg:col-span-1 h-full space-y-6">
                  <Suspense fallback={<div className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />}>
                    <GapAnalyticsWidget />
                  </Suspense>

                  <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-xl overflow-hidden flex flex-col max-h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          <UserIcon size={12} /> Newsroom Audience
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                          Suscriptores
                        </h3>
                      </div>
                      <span className="text-2xl font-black text-white">{state.subscribers.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                      {state.subscribers.map((sub: any, i: number) => (
                        <div key={sub.id || i} className="p-3 bg-slate-800/50 rounded-xl border border-white/5 flex flex-col">
                          <span className="text-xs font-bold text-white">{sub.email}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            {sub.timestamp?.seconds
                              ? new Date(sub.timestamp.seconds * 1000).toLocaleDateString()
                              : 'Reciente'}
                          </span>
                        </div>
                      ))}
                      {state.subscribers.length === 0 && (
                        <p className="text-xs text-slate-500 p-4 text-center italic">Sin suscriptores aún.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.activeTab === 'pipeline' && (
              <div className="h-[calc(100vh-350px)] min-h-[500px]">
                <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando CRM...</div>}>
                  <CRMBoard />
                </Suspense>
              </div>
            )}

            {state.activeTab === 'copilot' && (
              <div className="min-h-[600px]">
                <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando Copilot...</div>}>
                  <SalesCopilot />
                </Suspense>
              </div>
            )}

            {state.activeTab === 'telemetry' && (
              <Suspense fallback={
                <div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">
                  Iniciando Puente IoT...
                </div>
              }>
                <VehicleMonitor vehicleId="UNIT-001" />
              </Suspense>
            )}

            {state.activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Smartphone className="text-[#00aed9]" size={20} />
                      Acceso Biométrico (Passkeys)
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">
                      Vincula este dispositivo para iniciar sesión sin contraseña usando FaceID o TouchID.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!auth.currentUser) return alert('Debes estar logueado.');
                      try {
                        const { registerPasskey } = await import('@/features/auth/services/authService');
                        await registerPasskey(auth.currentUser);
                        alert('✅ Dispositivo vinculado exitosamente.');
                      } catch (err: any) {
                        alert('Error: ' + err.message);
                      }
                    }}
                    className="px-6 py-3 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white border border-[#00aed9]/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <Smartphone size={16} /> Vincular Dispositivo
                  </button>
                </div>

                <div className="min-h-[600px]">
                  <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando auditoria...</div>}>
                    <AuditLogViewer />
                  </Suspense>
                </div>
              </div>
            )}

            {state.activeTab === 'billing' && (
              <div className="min-h-[600px]">
                <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando facturacion...</div>}>
                  <B2BBillingDashboard />
                </Suspense>
              </div>
            )}

            {state.activeTab === 'lab' && (
              <div className="min-h-[600px] border border-white/10 rounded-[2rem] overflow-hidden bg-slate-900">
                <Suspense fallback={<div className="p-10 text-center">Cargando Laboratorio...</div>}>
                  <AILabView />
                </Suspense>
              </div>
            )}

            {state.activeTab === 'inventory' && (
              <Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando inventario...</div>}>
                <AdminInventoryTab
                  inventory={inventory}
                  leads={state.leads}
                  onDelete={onDelete}
                  onCreateNew={() => {
                    state.setEditingCar(null);
                    state.setIsModalOpen(true);
                  }}
                  onEdit={(car) => {
                    state.setEditingCar(car);
                    state.setIsModalOpen(true);
                  }}
                  onPlanContent={(car) => state.setViralCar(car)}
                  onInitializeDb={onInitializeDb}
                  handleInitClick={state.handleInitClick}
                  isInitializing={state.isInitializing}
                />
              </Suspense>
            )}
          </BrandErrorBoundary>
        </main>
      </div>

      {state.isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <AdminModal
            car={state.editingCar}
            onClose={() => state.setIsModalOpen(false)}
            onPhotoUploaded={state.handlePhotoUploaded}
            onSave={async (data: Omit<CarType, 'id'>) => {
              if (state.editingCar) await onUpdate({ ...state.editingCar, ...data, id: state.editingCar.id } as CarType);
              else await onAdd(data);
            }}
          />
        </Suspense>
      )}

      {state.marketingCar && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <MarketingCreativeStudio car={state.marketingCar} onClose={() => state.setMarketingCar(null)} />
        </Suspense>
      )}

      {state.viralCar && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <ViralGeneratorModal
            car={state.viralCar as any}
            isOpen={!!state.viralCar}
            onClose={() => state.setViralCar(null)}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <SentinelStatusBar />
      </Suspense>
    </div>
  );
};

export default AdminPanel;
