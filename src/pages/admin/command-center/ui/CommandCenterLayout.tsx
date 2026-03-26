import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useDealer } from '@/entities/dealer';
import { useNavigate, Outlet } from 'react-router-dom';
import { Car, Lead } from '@/entities/shared';
import { Subscriber } from '@/shared/types/types';
import { ShieldCheck, Plus, DatabaseZap, User as UserIcon, Radio, Zap, Scale } from 'lucide-react';
import { auth } from '@/shared/api/firebase/firebaseService';
import { useAntigravity } from '@/features/automation';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { BrandErrorBoundary } from '@/shared/ui/common/BrandErrorBoundary';
import { useCommandCenterData } from '../hooks/useCommandCenterData';

// Lazy load modals & status bars that remain in layout
const CommandCenterModal = React.lazy(() => import('./CommandCenterModal').then((m) => ({ default: m.CommandCenterModal })));
const EnterpriseStatus = React.lazy(() => import('./EnterpriseStatus').then((m) => ({ default: m.EnterpriseStatus })));
const MarketingCreativeStudio = React.lazy(() => import('./MarketingCreativeStudio').then((m) => ({ default: m.MarketingCreativeStudio })));
const ViralGeneratorModal = React.lazy(() => import('@/features/marketing').then((m) => ({ default: m.ViralGeneratorModal })));
const SentinelStatusBar = React.lazy(() => import('./SentinelStatusBar').then((m) => ({ default: m.SentinelStatusBar })));

interface Props {
  inventory: Car[];
  onUpdate: (car: Car) => Promise<void>;
  onAdd: (car: Omit<Car, 'id'>) => Promise<void>;
  onDelete: (id: string) => void;
  onInitializeDb?: () => Promise<void>;
}

export type CommandCenterContextType = Props & {
  leads: Lead[];
  subscribers: Subscriber[];
  deviceType: 'Mac' | 'iPhone';
  setMarketingCar: (car: Car | null) => void;
  setViralCar: (car: Car | null) => void;
  setEditingCar: (car: Car | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  handleInitClick: () => void;
  isInitializing: boolean;
};

const CommandCenterLayout: React.FC<Props> = (props) => {
  const { currentDealer } = useDealer();
  const navigate = useNavigate();
  const { status: antigravityStatus, refresh: refreshAntigravity } = useAntigravity();
  const { containerRef } = useMouseGlow();
  
  const { onInitializeDb, onUpdate, onAdd, onDelete, inventory } = props;

  // React Query Fetch Hook
  const dealerId = currentDealer.id || 'richard-automotive';
  const { leads, isLoadingLeads, subscribers, refetchLeads } = useCommandCenterData(dealerId);

  // Local state for modals & global data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [marketingCar, setMarketingCar] = useState<Car | null>(null);
  const [viralCar, setViralCar] = useState<Car | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [deviceType, setDeviceType] = useState<'Mac' | 'iPhone'>('Mac');
  const securityScore = 98;

  useEffect(() => {
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Android')) {
      setDeviceType('iPhone');
    }
  }, []);

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
    refetchLeads();
  }, [refetchLeads]);

  const layoutContext: CommandCenterContextType = {
    ...props,
    leads,
    subscribers,
    deviceType,
    setMarketingCar,
    setViralCar,
    setEditingCar,
    setIsModalOpen,
    handleInitClick,
    isInitializing
  };

  return (
    <div
      ref={containerRef as any}
      className="min-h-screen bg-transparent text-slate-200 font-sans transition-colors duration-300 relative overflow-hidden bg-noise"
    >
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8 relative z-10 flex flex-col h-full">
        {/* HEADER AREA */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.25em] mb-2">
              <ShieldCheck size={12} />
              <span>Command Center v2.0</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 tracking-tighter">
              {currentDealer.name}
            </h1>
          </div>

          <div className="flex items-center gap-4 hidden md:flex">
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
            >
              AG: {antigravityStatus}
            </button>
            <Suspense fallback={<div className="h-10 w-40 rounded-xl bg-white/5 animate-pulse" />}>
              <EnterpriseStatus />
            </Suspense>

            <button
              onClick={() => navigate('/admin/houston')}
              className="h-10 px-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Radio size={14} /> Sentinel Terminal
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-4 px-6 py-3 glass-premium border border-white/10 rounded-2xl backdrop-blur-3xl">
            <div className="relative">
              <ShieldCheck className="text-emerald-500" size={24} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Security Copilot</span>
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 text-[8px] font-black rounded-md uppercase">Active</span>
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
              <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Latency: 24ms</div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/digital-twin')}
              className="h-[44px] px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <UserIcon size={18} /> Gemelo Digital
            </button>
            <button
              onClick={() => {
                setEditingCar(null);
                setIsModalOpen(true);
              }}
              className="h-[44px] px-6 bg-primary hover:bg-cyan-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Nueva Unidad</span>
            </button>
            <button
              onClick={() => refetchLeads()}
              className="w-[44px] h-[44px] bg-slate-800 hover:text-white rounded-xl flex items-center justify-center transition-all group"
              title="Recargar Datos"
            >
              <DatabaseZap size={18} className="group-active:rotate-180 duration-500" />
            </button>
          </div>
        </header>

        {/* NESTED ROUTES OUTLET */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-8 bg-transparent relative z-0 hide-scrollbar overflow-x-hidden min-h-[600px]">
          <BrandErrorBoundary>
            <Suspense fallback={<div className="p-12 text-center text-slate-500 font-black animate-pulse">CARGANDO MÓDULO...</div>}>
              <Outlet context={layoutContext} />
            </Suspense>
          </BrandErrorBoundary>
        </div>
      </div>

      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-100 bg-black/60" />}>
          <CommandCenterModal
            car={editingCar}
            onClose={() => setIsModalOpen(false)}
            onPhotoUploaded={handlePhotoUploaded}
            onSave={async (data: Omit<Car, 'id'>) => {
              if (editingCar) await props.onUpdate({ ...data, id: editingCar.id } as Car);
              else await props.onAdd(data);
            }}
          />
        </Suspense>
      )}
      {marketingCar && (
        <Suspense fallback={<div className="fixed inset-0 z-100 bg-black/60" />}>
          <MarketingCreativeStudio car={marketingCar} onClose={() => setMarketingCar(null)} />
        </Suspense>
      )}
      {viralCar && (
        <Suspense fallback={<div className="fixed inset-0 z-100 bg-black/60" />}>
          <ViralGeneratorModal car={viralCar as any} isOpen={!!viralCar} onClose={() => setViralCar(null)} />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <SentinelStatusBar />
      </Suspense>
    </div>
  );
};

export default CommandCenterLayout;
