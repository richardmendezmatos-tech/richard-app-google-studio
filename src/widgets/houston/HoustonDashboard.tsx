'use client';

import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HoustonDashboard.module.css';
import {
  Activity,
  Zap,
  Shield,
  Cpu,
  Terminal as TerminalIcon,
  ArrowUpRight,
  AlertCircle,
  Server,
  Radio,
  CheckCircle2,
  Car as CarIcon,
  DollarSign,
  Gauge,
  LineChart,
  MessageSquare,
  PackageSearch,
  Sparkles,
  TrendingUp,
  Download,
  Share2,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
} from 'lucide-react';
import { DI } from '@/shared/di/registry';
import { HoustonTelemetry } from '@/entities/houston';
import { OutreachOpportunity } from '@/entities/lead';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { BusinessHealthWidget } from '@/features/houston/ui/components/BusinessHealthWidget';
import { SourcingLogWidget } from '@/features/houston/ui/components/SourcingLogWidget';
import { useBusinessTelemetry } from '@/entities/houston/api/useBusinessTelemetry';

import { PipelineTab } from './HoustonPipelineTab';
import { TelemetryTab } from './HoustonTelemetryTab';
import { LogsTab } from './HoustonLogsTab';

// ─── Tab Definitions ──────────────────────────────────────────────────────────
type DashboardTab = 'PIPELINE' | 'SOURCING' | 'TELEMETRY' | 'LOGS';

const TABS: { id: DashboardTab; label: string; icon: React.ReactNode; accentColor: string }[] = [
  {
    id: 'PIPELINE',
    label: 'Financial Pipeline',
    icon: <DollarSign size={14} />,
    accentColor: 'emerald',
  },
  {
    id: 'TELEMETRY',
    label: 'IT Telemetry',
    icon: <Gauge size={14} />,
    accentColor: 'cyan',
  },
  {
    id: 'SOURCING',
    label: 'Abasto Inteligente',
    icon: <PackageSearch size={14} />,
    accentColor: 'purple',
  },
  {
    id: 'LOGS',
    label: 'Registros',
    icon: <TerminalIcon size={14} />,
    accentColor: 'amber',
  },
];

const useNetworkStatus = () => {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true,
  );
};

// ─── PWA Install Prompt Hook ──────────────────────────────────────────────────
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return { isInstallable, installPWA };
};

// ─── Main Component ───────────────────────────────────────────────────────────
const HoustonDashboard: React.FC = () => {
  const [telemetry, setTelemetry] = useState<HoustonTelemetry | null>(null);
  const [opportunities, setOpportunities] = useState<OutreachOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('PIPELINE');
  const { isInstallable, installPWA } = usePWAInstall();
  const isOnline = useNetworkStatus();
  const { businessData, refresh: refreshBusiness } = useBusinessTelemetry();
  const { containerRef } = useMouseGlow();

  const [killSwitch, setKillSwitch] = useState(false);

  useEffect(() => {
    // Defer execution to avoid synchronous setState in effect body
    const savedState = window.sessionStorage.getItem('RA_KILL_SWITCH') === 'true';
    Promise.resolve().then(() => setKillSwitch(savedState));
  }, []);

  const toggleKillSwitch = () => {
    const newState = !killSwitch;
    setKillSwitch(newState);
    if (newState) {
      window.sessionStorage.setItem('RA_KILL_SWITCH', 'true');
    } else {
      window.sessionStorage.removeItem('RA_KILL_SWITCH');
    }
  };

  const getHoustonTelemetry = useMemo(() => DI.getHoustonTelemetryUseCase(), []);
  const identifyOutreachOpportunities = useMemo(
    () => DI.getIdentifyOutreachOpportunitiesUseCase(),
    [],
  );

  useEffect(() => {
    let unsubscribeFn: (() => void) | undefined;

    const init = async () => {
      unsubscribeFn = await getHoustonTelemetry.subscribe((data: HoustonTelemetry) =>
        setTelemetry(data),
      );
      const opportunitiesData = await identifyOutreachOpportunities.execute(80);
      setOpportunities(opportunitiesData);
    };

    init();

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [getHoustonTelemetry, identifyOutreachOpportunities]);

  if (!telemetry)
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <Radio className="text-cyan-500 animate-pulse mb-4" size={48} />
          <p className="text-cyan-500 font-mono tracking-widest uppercase text-xs">
            Uplink: Establishing Terminal...
          </p>
        </motion.div>
      </div>
    );

  return (
    <div
      ref={containerRef as any}
      className="min-h-screen bg-[#02060a] text-slate-300 font-mono p-4 md:p-8 pb-24 md:pb-8 relative overflow-hidden mesh-bg select-none"
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 blur-[160px] rounded-full animate-pulse [animation-delay:3s]" />
      </div>
      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10"
      >
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 flex items-center gap-4 group">
            <TerminalIcon
              className="text-cyan-500 group-hover:rotate-12 transition-transform"
              size={36}
              aria-hidden="true"
            />
            Houston
            <span className="text-cyan-500 text-lg font-mono tracking-[0.5em] ml-4 opacity-70">
              RA MONITOR
            </span>
          </h1>
          <div className="flex items-center gap-6 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
            <span className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${telemetry.systemHealth === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 'bg-red-500'}`}
                aria-hidden="true"
              />
              {telemetry.systemHealth.toUpperCase()}
            </span>
            <span className="border-l border-white/10 pl-6 flex items-center gap-2">
              {isOnline ? (
                <Wifi size={12} className="text-emerald-500" aria-hidden="true" />
              ) : (
                <WifiOff size={12} className="text-red-500 animate-bounce" aria-hidden="true" />
              )}
              <span className={isOnline ? 'text-slate-300' : 'text-red-500'}>
                {isOnline ? 'ENLACE_ACTIVO' : 'ENLACE_CAIDO'}
              </span>
            </span>
            <span className="border-l border-white/10 pl-6 hidden sm:inline">HQ_SAN_JUAN</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 ml-auto md:ml-0 w-full md:w-auto justify-end">
          {/* Autonomy Score Badge */}
          <div className="glass-premium px-6 md:px-8 py-5 flex items-center gap-4 md:gap-8 border border-white/5 hover:scale-[1.02] transition-all cursor-pointer shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.3em] mb-1">
                Autonomy Score
              </p>
              <p className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">
                {telemetry.metrics.autonomyRate.value}
                <span className="text-lg text-cyan-500/50">%</span>
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-2xl group-hover:bg-cyan-500/20 transition-colors">
              <Activity className="text-cyan-500 animate-pulse" size={28} />
            </div>
          </div>

          {/* Kill Switch */}
          <button
            onClick={toggleKillSwitch}
            title="Activar o desactivar escucha de base de datos"
            className={`glass-premium px-6 py-5 flex items-center gap-4 border transition-all cursor-pointer shadow-xl group/kill ${
              killSwitch
                ? 'border-red-500/40 bg-red-500/10'
                : 'border-emerald-500/20 hover:bg-emerald-500/10'
            }`}
          >
            <div className="text-right hidden sm:block">
              <p
                className={`text-[10px] uppercase font-black tracking-[0.3em] mb-1 ${killSwitch ? 'text-red-500/70' : 'text-emerald-500/70'}`}
              >
                {killSwitch ? 'Reposo' : 'Conexión DB'}
              </p>
              <p
                className={`text-xl font-black tracking-tighter ${killSwitch ? 'text-red-400' : 'text-emerald-400'}`}
              >
                {killSwitch ? 'APAGADA' : 'ACTIVA'}
              </p>
            </div>
            <div
              className={`p-3 rounded-2xl transition-all ${killSwitch ? 'bg-red-500/20 animate-pulse' : 'bg-emerald-500/20'}`}
            >
              {killSwitch ? (
                <PowerOff className="text-red-400" size={28} />
              ) : (
                <Power className="text-emerald-400" size={28} />
              )}
            </div>
          </button>

          {/* PWA Install Action */}
          {isInstallable && (
            <motion.button
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={installPWA}
              className="glass-premium px-6 py-5 flex items-center gap-4 border border-cyan-500/20 hover:bg-cyan-500/10 transition-all cursor-pointer shadow-xl group/install"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-cyan-500/70 uppercase font-black tracking-[0.3em] mb-1">
                  Mobile Access
                </p>
                <p className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors tracking-tighter">
                  INSTALL APP
                </p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-2xl group-hover:animate-bounce">
                <Download className="text-cyan-400" size={28} />
              </div>
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="relative z-10 mb-8 hidden md:block">
        <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl w-fit">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const accentMap: Record<string, string> = {
              emerald:
                'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
              cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.15)]',
              purple:
                'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
              amber:
                'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-300 ${
                  isActive
                    ? accentMap[tab.accentColor]
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'PIPELINE' && (
            <PipelineTab key="pipeline" opportunities={opportunities} telemetry={telemetry} />
          )}
          {activeTab === 'SOURCING' && (
            <motion.div
              key="sourcing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <SourcingLogWidget
                  orders={businessData?.purchaseOrders || []}
                  onUpdate={refreshBusiness}
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-premium p-6 border border-purple-500/20 bg-purple-500/[0.02] relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={80} className="text-purple-400" />
                  </div>
                  <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em] mb-8">
                    ROI Financial Forecast
                  </h3>

                  <div className="space-y-8">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-4">
                        Pipeline Profitability
                      </p>
                      <div className="flex items-end gap-3 mb-4">
                        <span className="text-5xl font-black text-white tracking-tighter">
                          ${((businessData?.purchaseOrders?.length || 0) * 1250).toLocaleString()}
                        </span>
                        <span className="text-sm text-emerald-400 font-bold mb-2">+14.2% Est.</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '68%' }}
                          className="h-full bg-linear-to-r from-purple-600 to-violet-400 shadow-[0_0_15px_#8b5cf6]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">
                          Cap. en Riesgo
                        </p>
                        <p className="text-lg font-black text-white">$42.5k</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">
                          Turn Rate
                        </p>
                        <p className="text-lg font-black text-emerald-400">18.4d</p>
                      </div>
                    </div>

                    <div className="p-4 border border-purple-500/20 bg-purple-500/5 rounded-2xl">
                      <p className="text-[9px] text-purple-400 font-bold leading-relaxed">
                        "Richard detectó 12.4% de incremento en la demanda de SUVs compactas en el
                        norte de la isla."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === 'TELEMETRY' && <TelemetryTab key="telemetry" telemetry={telemetry} />}
          {activeTab === 'LOGS' && <LogsTab key="logs" telemetry={telemetry} />}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-[#02060a]/95 backdrop-blur-xl border-t border-white/5 p-2 pb-8">
        <div className="flex justify-around items-center">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 p-2 transition-all ${
                  isActive ? 'text-cyan-400' : 'text-slate-500'
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20' : ''}`}
                >
                  {tab.icon}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HoustonDashboard;
