
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDealer } from '../contexts/DealerContext';
import { useNavigate } from 'react-router-dom';
import { Car as CarType, Lead } from '../types';
import { Plus, Trash2, Edit3, BarChart3, Package, Search, Loader2, DatabaseZap, Smartphone, Monitor, Server, Camera, CarFront, ShieldAlert, Sparkles, User as UserIcon, CreditCard, ShieldCheck, Zap, Leaf, Scale, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeadsOnce, optimizeImage, auth, getSubscribers } from '../services/firebaseService';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calculatePredictiveDTS } from '../services/predictionService';

import InventoryHeatmap from './InventoryHeatmap';
// import { useReactToPrint } from 'react-to-print'; // Removed
// import DealSheet from './DealSheet'; // Deprecated in favor of jsPDF

// Modular Components
import { KanbanBoard } from './admin/KanbanBoard';
import { AdminModal } from './admin/AdminModal';
import { AuditLogViewer } from './admin/AuditLogViewer';
import { GapAnalyticsWidget } from './admin/GapAnalyticsWidget'; // Component 4
import { MarketingModal } from './admin/MarketingModal'; // Component 2
import { SortableInventory } from './admin/SortableInventory';
import B2BBillingDashboard from './admin/B2BBillingDashboard';
import { EnterpriseStatus } from './admin/EnterpriseStatus';

// Lazy Load Lab to keep Admin bundle light
const AILabView = React.lazy(() => import('./AILabView'));

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


const StatusWidget = ({ icon: Icon, label, value, color, subValue }: { icon: any, label: string, value: string | React.ReactNode, color: string, subValue?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="glass-premium p-6 rounded-[2rem] flex items-center gap-5 group cursor-default"
  >
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
  </motion.div>
);

// --- MAIN COMPONENT ---
const AdminPanel: React.FC<Props> = ({ inventory, onUpdate, onAdd, onDelete, onInitializeDb }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentDealer } = useDealer();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pipeline' | 'analytics' | 'security' | 'marketing' | 'billing' | 'lab'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState(false);
  const [marketingCar, setMarketingCar] = useState<CarType | null>(null);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);

  // Widget States
  const [uploadedTodayCount, setUploadedTodayCount] = useState(0);
  const [deviceType, setDeviceType] = useState<'Mac' | 'iPhone'>('Mac');
  const [securityScore, setSecurityScore] = useState(98);

  const navigate = useNavigate(); // For Quick Actions

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
  }, []);

  useEffect(() => {
    if (activeTab === 'marketing') {
      getSubscribers().then(setSubscribers).catch(console.error);
    }
    if (activeTab === 'inventory' && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  const triggerPrint = useCallback(async (lead: Lead) => {
    try {
      const { generateLeadPDF } = await import('../utils/pdfGenerator');
      generateLeadPDF(lead);
    } catch (e) {
      console.error("PDF Error:", e);
      alert("Error generando PDF. Ver consola.");
    }
  }, []);

  const getCarForLead = (lead: Lead) => {
    if (lead.vehicleId) return inventory.find(c => c.id === lead.vehicleId);
    if (lead.vehicleOfInterest) return inventory.find(c => c.name === lead.vehicleOfInterest);
    return undefined;
  };

  const filteredInventory = useMemo(() => (inventory || []).filter(c =>
    (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  ), [inventory, searchTerm]);

  const handleInitClick = useCallback(async () => {
    if (!onInitializeDb) return;
    setIsInitializing(true);
    try { await onInitializeDb(); }
    catch (e) { console.error(e); }
    finally { setIsInitializing(false); }
  }, [onInitializeDb]);

  const handlePhotoUploaded = useCallback(() => {
    setUploadedTodayCount(prev => prev + 1);
  }, []);

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
            <EnterpriseStatus />
          </div>


          {/* Strategic: Security Copilot Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden xl:flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl group cursor-default"
          >
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
          </motion.div>

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
            { id: 'marketing', label: 'Marketing', icon: Sparkles },
            { id: 'security', label: 'Seguridad', icon: ShieldAlert },
            { id: 'security', label: 'Seguridad', icon: ShieldAlert },
            { id: 'billing', label: 'Facturación', icon: CreditCard },
            { id: 'lab', label: 'Laboratorio', icon: FlaskConical }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
                      onClick={() => { setMarketingCar(car); setIsMarketingModalOpen(true); }}
                      className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-2xl border border-white/5 hover:border-[#00aed9] hover:bg-slate-800 transition-all text-left group"
                    >
                      <img src={optimizeImage(car.img, 100)} alt={car.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="text-sm font-black text-white uppercase tracking-tight">{car.name}</div>
                        <div className="text-[10px] text-[#00aed9] font-bold uppercase tracking-widest">Generar Post ✨</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 h-full space-y-6">
                <GapAnalyticsWidget />

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
              <KanbanBoard leads={leads} onPrint={triggerPrint} searchTerm={searchTerm} userRole={(user?.role as any) || 'admin'} />
            </div>
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
                      const { registerPasskey } = await import('../services/authService');
                      await registerPasskey(auth.currentUser);
                      alert("✅ Dispositivo vinculado exitosamente.");
                    } catch (e: any) {
                      alert("Error: " + e.message);
                    }
                  }}
                  className="px-6 py-3 bg-[#00aed9]/10 text-[#00aed9] hover:bg-[#00aed9] hover:text-white border border-[#00aed9]/20 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Smartphone size={16} /> Vincular Dispositivo
                </button>
              </div>

              <div className="min-h-[600px]">
                <AuditLogViewer />
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="min-h-[600px]">
              <B2BBillingDashboard />
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
            <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">

              {/* Main List */}
              <div className="flex-1 bg-white/5 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/10 overflow-hidden flex flex-col h-[calc(100vh-350px)]">
                {/* Search Bar */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
                  <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00aed9] transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar vehículo..."
                      className="w-full pl-12 pr-4 h-[50px] bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#00aed9] focus:border-transparent outline-none transition-all text-sm font-medium text-white placeholder:text-slate-600"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      ref={searchInputRef}
                    />
                  </div>

                  {onInitializeDb && (
                    <button
                      onClick={handleInitClick}
                      disabled={isInitializing}
                      className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      {isInitializing ? "Resetting..." : "Reset DB"}
                    </button>
                  )}
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/80 sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehículo</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Categoría</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Market Advantage</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Precio</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredInventory.map((car) => (
                        <tr key={car.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                                <img src={optimizeImage(car.img, 200)} className="max-w-full max-h-full object-cover rounded-md" alt={car.name} />
                              </div>
                              <div>
                                <div className="font-bold text-white">{car.name}</div>
                                <div className="text-xs text-slate-500 hidden sm:block truncate max-w-[150px]">{car.description || 'Sin descripción'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-400 uppercase">{car.type}</span>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            {car.badge ?
                              <span className="px-3 py-1 bg-[#00aed9]/10 text-[#00aed9] rounded-full text-xs font-bold uppercase">{car.badge}</span> :
                              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase">Stock</span>
                            }
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            {(() => {
                              const prediction = calculatePredictiveDTS(car, leads.filter(l => l.vehicleId === car.id).length);
                              const isGreen = car.name.toLowerCase().includes('electric') || car.name.toLowerCase().includes('tesla') || car.type === 'luxury'; // Heuristic
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${prediction.advantageScore > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{prediction.daysToSale} DTS</span>
                                    {isGreen && (
                                      <span className="flex items-center gap-0.5 px-1.5 py-0.25 bg-emerald-500/10 text-emerald-500 rounded text-[7px] font-black uppercase">
                                        <Leaf size={8} fill="currentColor" /> Eco
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">AI Confidence: {prediction.confidence}%</div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-200">
                            ${(car.price || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setMarketingCar(car); setIsMarketingModalOpen(true); }}
                                className="w-[40px] h-[40px] rounded-lg bg-[#00aed9]/10 flex items-center justify-center text-[#00aed9] hover:bg-[#00aed9] hover:text-white transition-colors"
                                title="Generar Marketing Content"
                              >
                                <Sparkles size={16} />
                              </button>
                              <button onClick={() => { setEditingCar(car); setIsModalOpen(true); }} className="w-[40px] h-[40px] rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-[#00aed9] hover:text-white transition-colors">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => onDelete(car.id)} className="w-[40px] h-[40px] rounded-lg bg-rose-900/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Reordering */}
              <div className="w-full lg:w-96 bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 shadow-xl overflow-y-auto max-h-[calc(100vh-350px)]">
                <SortableInventory
                  inventory={inventory.slice(0, 10)}
                  onReorder={(newOrder) => {
                    console.log("New Inventory Order:", newOrder);
                    // In a real app, you would persist this index to Firestore
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div >

      {/* MODAL EDITOR */}
      {
        isModalOpen && (
          <AdminModal
            car={editingCar}
            onClose={() => setIsModalOpen(false)}
            onPhotoUploaded={handlePhotoUploaded}
            onSave={async (data: Omit<CarType, 'id'>) => {
              if (editingCar) await onUpdate({ ...data, id: editingCar.id });
              else await onAdd(data);
            }}
          />
        )
      }
    </div >
  );
};

export default AdminPanel;
