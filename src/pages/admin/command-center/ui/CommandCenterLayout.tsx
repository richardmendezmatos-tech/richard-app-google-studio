import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useDealer } from '@/entities/dealer';
import { useNavigate, Outlet } from 'react-router-dom';
import { Car } from '@/entities/inventory';
import { Subscriber } from '@/shared/types/types';
import { ShieldCheck, Plus, DatabaseZap, User as UserIcon, Radio, Zap, Scale } from 'lucide-react';
import { auth } from '@/shared/api/firebase/firebaseService';
import { useAntigravity } from '@/features/automation';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { BrandErrorBoundary } from '@/shared/ui/common/BrandErrorBoundary';
import { useCommandCenterData } from '../hooks/useCommandCenterData';
import { TacticalSidebar } from './components/TacticalSidebar';
import { CommandCenterWidget } from '@/widgets/houston/CommandCenterWidget';

// Lazy load modals & status bars that remain in layout
const CommandCenterModal = React.lazy(() =>
  import('./CommandCenterModal').then((m) => ({ default: m.CommandCenterModal })),
);
const EnterpriseStatus = React.lazy(() =>
  import('./EnterpriseStatus').then((m) => ({ default: m.EnterpriseStatus })),
);
const MarketingCreativeStudio = React.lazy(() =>
  import('./MarketingCreativeStudio').then((m) => ({ default: m.MarketingCreativeStudio })),
);
const ViralGeneratorModal = React.lazy(() =>
  import('@/features/marketing').then((m) => ({ default: m.ViralGeneratorModal })),
);
const SentinelStatusBar = React.lazy(() =>
  import('./SentinelStatusBar').then((m) => ({ default: m.SentinelStatusBar })),
);

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
    isInitializing,
  };

  return (
    <div
      ref={containerRef as any}
      className="min-h-screen bg-transparent text-slate-200 font-sans transition-colors duration-300 relative overflow-hidden bg-noise"
    >
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <TacticalSidebar />

      <div className="px-4 md:pl-24 md:pr-10 pb-32 md:pb-6 max-w-[1800px] mx-auto py-6 space-y-6 relative z-10 flex flex-col h-full min-h-screen">
        {/* HEADER AREA */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 shrink-0 bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5">
          <div className="flex items-center gap-6">
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 text-primary font-black text-[8px] uppercase tracking-[0.4em] mb-1 opacity-60">
                <ShieldCheck size={10} />
                <span>MISSION CONTROL</span>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none">
                {currentDealer.name}
              </h1>
            </div>

            <div className="h-8 w-px bg-white/10 hidden lg:block" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={refreshAntigravity}
                className={`h-8 rounded-lg border px-3 text-[9px] font-black uppercase tracking-widest transition-all ${
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
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => navigate('/strategy-lab')}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none ring-1 ring-white/5 shadow-2xl transition-all hover:bg-slate-800"
              title="Nodo Houston Sentinel"
            >
              <Zap size={14} className="text-purple-400" />{' '}
              <span className="hidden sm:inline">Strategy Lab</span>
            </button>
            <button
              onClick={() => {
                setEditingCar(null);
                setIsModalOpen(true);
              }}
              className="h-[38px] px-4 bg-primary hover:bg-cyan-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Plus size={14} strokeWidth={3} /> <span className="hidden sm:inline">Unidad</span>
            </button>
            <button
              onClick={() => refetchLeads()}
              className="w-[38px] h-[38px] bg-slate-800 hover:text-white rounded-xl flex items-center justify-center transition-all group"
              title="Recargar Datos"
            >
              <DatabaseZap size={16} className="group-active:rotate-180 duration-500" />
            </button>
          </div>
        </header>

        {/* NESTED ROUTES OUTLET */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 bg-transparent relative z-0 hide-scrollbar overflow-x-hidden min-h-[400px]">
          <BrandErrorBoundary>
            <Suspense
              fallback={
                <div className="p-12 text-center text-slate-500 font-black animate-pulse">
                  CARGANDO MÓDULO...
                </div>
              }
            >
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
          <ViralGeneratorModal
            car={viralCar as any}
            isOpen={!!viralCar}
            onClose={() => setViralCar(null)}
          />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <SentinelStatusBar />
      </Suspense>
    </div>
  );
};

export default CommandCenterLayout;
