import React, { useState, useEffect, useCallback } from 'react';
import { useDealer } from '@/contexts/DealerContext';
import { useNavigate } from 'react-router-dom';
import { Car as CarType, Lead, Subscriber } from '@/types/types';
import { Plus, BarChart3, Package, Search, DatabaseZap, Smartphone, Monitor, Server, CarFront, ShieldAlert, Sparkles, User as UserIcon, CreditCard, ShieldCheck, Zap, Scale, FlaskConical, Radio } from 'lucide-react';
import { getLeadsOnce, auth, getSubscribers } from '@/services/firebaseService';
import { optimizeImage } from '@/services/firebaseShared';
import { useAntigravity } from '@/hooks/useAntigravity';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/store';

import { InventoryHeatmap } from '@/features/inventory/components/InventoryHeatmap';
// import { useReactToPrint } from 'react-to-print'; // Removed
// import DealSheet from './DealSheet'; // Deprecated in favor of jsPDF

// Lazy modules loaded by tab/interaction to keep Admin shell lighter
const CRMBoard = React.lazy(() => import('./CRMBoard'));
const SalesCopilot = React.lazy(() => import('./SalesCopilot'));
const AdminModal = React.lazy(() => import('./AdminModal').then((m) => ({ default: m.AdminModal })));
const AuditLogViewer = React.lazy(() => import('./AuditLogViewer').then((m) => ({ default: m.AuditLogViewer })));
const GapAnalyticsWidget = React.lazy(() => import('./GapAnalyticsWidget').then((m) => ({ default: m.GapAnalyticsWidget })));
const B2BBillingDashboard = React.lazy(() => import('./B2BBillingDashboard'));
const EnterpriseStatus = React.lazy(() => import('./EnterpriseStatus').then((m) => ({ default: m.EnterpriseStatus })));
const MarketingModal = React.lazy(() => import('./MarketingModal').then((m) => ({ default: m.MarketingModal })));
const ViralGeneratorModal = React.lazy(() => import('@/features/marketing/components/ViralGeneratorModal'));
const AdminInventoryTab = React.lazy(() => import('./AdminInventoryTab'));
const AILabView = React.lazy(() => import('@/features/ai/components/AILabView'));
const VehicleMonitor = React.lazy(() => import('./VehicleMonitor'));

interface Props {
  inventory: CarType[];
  onUpdate: (car: CarType) => Promise<void>;
  onAdd: (car: Omit<CarType, 'id'>) => Promise<void>;
  onDelete: (id: string) => void;
  onInitializeDb?: () => Promise<void>;
}



// --- WIDGETS SECTION ---
const CountUp = ({ end, prefix = '', suffix = '', duration = 1500 }: { end: number, prefix?: string, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = (x: number) => 1 - Math.pow(1 - x, 3); // Cubic ease out
      setCount(Math.floor(end * ease(percentage)));
      if (progress < duration) animationFrame = requestAnimationFrame(updateCount);
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{(count || 0).toLocaleString()}{suffix}</span>;
};


const StatusWidget = ({ icon: Icon, label, value, color, subValue }: { icon: React.ElementType, label: string, value: string | React.ReactNode, color: string, subValue?: string }) => (
  <div className="glass-premium p-6 rounded-[2rem] flex items-center gap-5 group cursor-default route-fade-in hover:-translate-y-1 hover:scale-[1.01] transition-transform">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-transform group-hover:rotate-12 duration-500`}>
      <Icon className={color.replace('bg-', 'text-').replace('text-opacity-100', '')} size={32} strokeWidth={2.5} />
    </div>
    <div>
      <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</h4>
      <div className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tighter text-glow">{value}</div>
      {subValue && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{subValue}</div>
        </div>
      )}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AdminPanel: React.FC<Props> = ({ inventory, onUpdate, onAdd, onDelete, onInitializeDb }) => {
  const { currentDealer } = useDealer();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pipeline' | 'copilot' | 'analytics' | 'security' | 'marketing' | 'billing' | 'lab' | 'telemetry'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [marketingCar, setMarketingCar] = useState<CarType | null>(null);
  const [viralCar, setViralCar] = useState<CarType | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Widget States
  const [deviceType, setDeviceType] = useState<'Mac' | 'iPhone'>('Mac');
  const securityScore = 98;

  const navigate = useNavigate(); // For Quick Actions
  const { status: antigravityStatus, refresh: refreshAntigravity } = useAntigravity();

  const fetchDashboardData = useCallback(async () => {
    try {
      const updatedLeads = await getLeadsOnce();
      setLeads(updatedLeads);
    } catch (e) {
      console.error("Leads Fetch Error:", e);
    }
  }, []);

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
    try { await onInitializeDb(); }
    catch (e) { console.error(e); }
    finally { setIsInitializing(false); }
  }, [onInitializeDb]);

  const handlePhotoUploaded = useCallback(() => {
    // Refresh data if needed
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans transition-colors duration-300 relative overflow-hidden">
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
            <React.Suspense fallback={<div className="h-10 w-40 rounded-xl bg-white/5 animate-pulse" />}>
              <EnterpriseStatus />
            </React.Suspense>
          </div>


          {/* Strategic: Security Copilot Widget */}
          <div className="hidden xl:flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl group cursor-default route-fade-in">
            <div className="relative">
              <ShieldCheck className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Security Copilot</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[8px] font-black rounded-md uppercase">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Zero Trust Integrity: {securityScore}%</div>
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
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Latency: 24ms</div>
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
              onClick={() => { setEditingCar(null); setIsModalOpen(true); }}
              className="h-[44px] px-6 bg-[#00aed9] hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Nueva Unidad</span><span className="sm:hidden">Nuevo</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="w-[44px] h-[44px] bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all active:rotate-180 duration-500"
              title="Recargar Datos"
            >
              <DatabaseZap size={18} />
            </button>
          </div>
        </header >

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
            { id: 'telemetry', label: 'Telemetría', icon: Radio }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'dashboard' | 'inventory' | 'pipeline' | 'copilot' | 'analytics' | 'security' | 'marketing' | 'billing' | 'lab' | 'telemetry')}
              className={`flex-1 md:flex-none px-6 h-[44px] rounded-xl font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-[#00aed9] text-white shadow-lg shadow-[#00aed9]/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
            >
              <tab.icon size={16} strokeWidth={2.5} /> {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <main className="animate-in fade-in zoom-in-95 duration-300 min-h-[600px]">

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* KPI WIDGETS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusWidget
                  icon={CarFront}
                  label="Total Inventario"
                  value={<CountUp end={inventory.length} prefix="" />}
                  color="bg-blue-500 text-blue-500"
                  subValue={inventory.length > 0 ? "Actualizado" : "Sin stock"}
                />
                <StatusWidget
                  icon={BarChart3}
                  label="Leads Activos"
                  value={<CountUp end={leads.filter(l => l.status === 'new').length} />}
                  color="bg-emerald-500 text-emerald-500"
                  subValue="Potenciales hoy"
                />
                <StatusWidget
                  icon={Package}
                  label="Valor Total"
                  value={<CountUp end={inventory.reduce((sum, car) => sum + (Number(car.price) || 0), 0)} prefix="$" />}
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
                <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0d2232] to-[#081520] border border-white/10 p-8 hover:border-[#00aed9]/50 transition-all cursor-pointer" onClick={() => navigate('/digital-twin')}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00aed9]/10 rounded-full blur-3xl group-hover:bg-[#00aed9]/20 transition-all" />
                  <UserIcon className="text-[#00aed9] mb-4" size={40} />
                  <h3 className="text-2xl font-black text-white uppercase mb-2">Gemelo Digital</h3>
                  <p className="text-slate-400 text-sm mb-6">Crea contenido de marketing viral con tu avatar IA.</p>
                  <span className="text-xs font-bold text-[#00aed9] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">Ingresar <div className="w-4 h-[1px] bg-[#00aed9]" /></span>
                </div>

                {/* Framework Lab Card */}
                <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1a1225] to-[#0f0a15] border border-white/10 p-8 hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => navigate('/framework-lab')}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
                  <Server className="text-purple-500 mb-4" size={40} />
                  <h3 className="text-2xl font-black text-white uppercase mb-2">Framework Lab</h3>
                  <p className="text-slate-400 text-sm mb-6">Gestiona integraciones experimentales (Svelte, Astro).</p>
                  <span className="text-xs font-bold text-purple-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">Configurar <div className="w-4 h-[1px] bg-purple-500" /></span>
                </div>

                {/* Analytics Card */}
                <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f1f18] to-[#050f0a] border border-white/10 p-8 hover:border-emerald-500/50 transition-all cursor-pointer" onClick={() => setActiveTab('analytics')}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
                  <BarChart3 className="text-emerald-500 mb-4" size={40} />
                  <h3 className="text-2xl font-black text-white uppercase mb-2">Analytics Pro</h3>
                  <p className="text-slate-400 text-sm mb-6">Mapa de calor de inventario y tendencias.</p>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">Ver Datos <div className="w-4 h-[1px] bg-emerald-500" /></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/10">
              <InventoryHeatmap inventory={inventory} />
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 shadow-xl space-y-6">
                <div className="flex items-center gap-3 text-[#00aed9] font-black text-xs uppercase tracking-[0.2em]">
                  <Sparkles size={20} /> Content Engine
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Estrategia Semántica</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Richard IA utiliza búsqueda semántica para identificar qué modelos de tu inventario tienen más "momentum" basado en las consultas de los usuarios. Selecciona una unidad abajo para generar contenido viral.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inventory.slice(0, 4).map(car => (
                    <button
                      key={car.id}
                      onClick={() => setMarketingCar(car)}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-[#00aed9] hover:bg-slate-800 transition-all text-left group"
                    >
                      <img src={optimizeImage(car.img, 100)} alt={car.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="text-sm font-black text-white uppercase tracking-tight">{car.name}</div>
                        <div className="text-[10px] text-[#00aed9] font-bold uppercase tracking-widest">Planear Post ✨</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 h-full space-y-6">
                <React.Suspense fallback={<div className="h-48 rounded-[2rem] bg-white/5 animate-pulse" />}>
                  <GapAnalyticsWidget />
                </React.Suspense>

                {/* Subscribers Widget */}
                <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-xl overflow-hidden flex flex-col max-h-[400px]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <UserIcon size={12} /> Newsroom Audience
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Suscriptores</h3>
                    </div>
                    <span className="text-2xl font-black text-white">{subscribers.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    {subscribers.map((sub, i) => (
                      <div key={sub.id || i} className="p-3 bg-slate-800/50 rounded-xl border border-white/5 flex flex-col">
                        <span className="text-xs font-bold text-white">{sub.email}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                          {sub.timestamp?.seconds ? new Date(sub.timestamp.seconds * 1000).toLocaleDateString() : 'Reciente'}
                        </span>
                      </div>
                    ))}
                    {subscribers.length === 0 && <p className="text-xs text-slate-500 p-4 text-center italic">Sin suscriptores aún.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="h-[calc(100vh-350px)] min-h-[500px]">
              <React.Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando CRM...</div>}>
                <CRMBoard />
              </React.Suspense>
            </div>
          )}

          {activeTab === 'copilot' && (
            <div className="min-h-[600px]">
              <React.Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando Copilot...</div>}>
                <SalesCopilot />
              </React.Suspense>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <React.Suspense fallback={<div className="p-20 text-center animate-pulse text-slate-500 font-bold uppercase tracking-widest">Iniciando Puente IoT...</div>}>
              <VehicleMonitor vehicleId="UNIT-001" />
            </React.Suspense>
          )}

          {activeTab === 'security' && (
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
                    if (!auth.currentUser) return alert("Debes estar logueado.");
                    try {
                      const { registerPasskey } = await import('@/features/auth/services/authService');
                      await registerPasskey(auth.currentUser);
                      alert("✅ Dispositivo vinculado exitosamente.");
                    } catch (err: unknown) {
                      const error = err as { message: string };
                      alert("Error: " + error.message);
                    }
                  }}
                  className="px-6 py-3 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white border border-[#00aed9]/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Smartphone size={16} /> Vincular Dispositivo
                </button>
              </div>

              <div className="min-h-[600px]">
                <React.Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando auditoria...</div>}>
                  <AuditLogViewer />
                </React.Suspense>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="min-h-[600px]">
              <React.Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando facturacion...</div>}>
                <B2BBillingDashboard />
              </React.Suspense>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="min-h-[600px] border border-white/10 rounded-[2rem] overflow-hidden bg-slate-900">
              <React.Suspense fallback={<div className="p-10 text-center">Cargando Laboratorio...</div>}>
                <AILabView />
              </React.Suspense>
            </div>
          )}

          {activeTab === 'inventory' && (
            <React.Suspense fallback={<div className="p-12 text-center text-slate-500">Cargando inventario...</div>}>
              <AdminInventoryTab
                inventory={inventory}
                leads={leads}
                onDelete={onDelete}
                onCreateNew={() => { setEditingCar(null); setIsModalOpen(true); }}
                onEdit={(car) => { setEditingCar(car); setIsModalOpen(true); }}
                onPlanContent={(car) => setViralCar(car)}
                onInitializeDb={onInitializeDb}
                handleInitClick={handleInitClick}
                isInitializing={isInitializing}
              />
            </React.Suspense>
          )}
        </main>
      </div >

      {/* MODAL EDITOR */}
      {
        isModalOpen && (
          <React.Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
            <AdminModal
              car={editingCar}
              onClose={() => setIsModalOpen(false)}
              onPhotoUploaded={handlePhotoUploaded}
              onSave={async (data: Omit<CarType, 'id'>) => {
                if (editingCar) await onUpdate({ ...data, id: editingCar.id });
                else await onAdd(data);
              }}
            />
          </React.Suspense>
        )
      }

      {/* MARKETING MODAL */}
      {marketingCar && (
        <React.Suspense fallback={<div className="fixed inset-0 z-[100] bg-black/60" />}>
          <MarketingModal
            car={marketingCar}
            onClose={() => setMarketingCar(null)}
          />
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
    </div >
  );
};

export default AdminPanel;
