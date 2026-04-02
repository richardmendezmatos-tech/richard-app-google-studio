"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Car } from '@/entities/inventory';
// Feature FSD imports
import { useSavedCarIds, useToggleSavedCar } from '@/features/garage/hooks/useGarage';
import { analyzeGarageSelection } from '@/shared/api/ai';
import { BiometricService } from '@/shared/api/security/biometricService';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import {
  ArrowLeft,
  Car as CarIcon,
  FileText,
  RefreshCw,
  User,
  Loader2,
  Sparkles,
  ScanFace,
  Lock,
  Zap
} from 'lucide-react';
import CarCard from '@/entities/inventory/ui/CarCard';
import { PhotoAppraisal } from '@/features/garage';
import { useAppraisals } from '@/entities/appraisal';
import { useApplications } from '@/features/garage/hooks/useApplications';
import DOMPurify from 'dompurify';
import { SkeletonCarCard } from '@/shared/ui/loaders/SkeletonCarCard';

interface Props {
  inventory: Car[];
  onExit: () => void;
}

type Tab = 'cars' | 'applications' | 'trade-ins' | 'profile';

const DigitalGaragePage: React.FC<Props> = ({ inventory, onExit }) => {
  const [activeTab, setActiveTab] = useState<Tab>('cars');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addNotification } = useNotification();

  // Hook FSD
  const { data: savedIds = [], isLoading: isLoadingSavedIds } = useSavedCarIds();
  const toggleSaveMutation = useToggleSavedCar();

  // Biometric State
  const [isLocked, setIsLocked] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    const enabled = await BiometricService.isEnabled();
    setIsBiometricEnabled(enabled);
    if (!enabled) setIsLocked(false);
  };

  const handleUnlock = async () => {
    setIsScanning(true);
    const success = await BiometricService.verifyIdentity();
    setIsScanning(false);
    if (success) {
      setIsLocked(false);
    } else {
      alert('No se pudo verificar la identidad.');
    }
  };

  const toggleBiometric = async () => {
    const newState = !isBiometricEnabled;
    await BiometricService.setEnabled(newState);
    setIsBiometricEnabled(newState);
  };

  // Derived state from inventory and FSD hook
  const savedCars = inventory.filter((c) => savedIds.includes(c.id));

  const runAnalysis = useCallback(
    async (cars: Car[]) => {
      if (aiAnalysis || isAnalyzing || cars.length === 0) return;
      setIsAnalyzing(true);
      try {
        const result = await analyzeGarageSelection(cars);
        setAiAnalysis(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [aiAnalysis, isAnalyzing],
  );

  useEffect(() => {
    if (savedCars.length > 0 && activeTab === 'cars') {
      runAnalysis(savedCars);
    }
  }, [savedCars, activeTab, runAnalysis]);

  const toggleSave = (e: React.MouseEvent, car: Car) => {
    e.stopPropagation();
    toggleSaveMutation.mutate(car.id);
  };

  const { data: savedAppraisals = [], isLoading: isLoadingAppraisals } = useAppraisals();
  const { data: savedApplications = [], isLoading: isLoadingApplications } = useApplications();

  const applications = savedApplications.map(app => ({
    id: app.id,
    date: app.date,
    status: app.status,
    bank: 'Richard Financial',
    details: app.vehicle ? `Interés en ${app.vehicle.name}` : 'General Pre-Qual'
  }));

  const tradeIns = savedAppraisals.map(a => ({
    id: a.id,
    date: a.date,
    vehicle: `${a.vehicle.year} ${a.vehicle.make} ${a.vehicle.model}`,
    estimatedValue: `$${a.value.estimated.toLocaleString()}`,
    status: a.status
  }));

  const renderTabs = () => (
    <div className="flex flex-wrap gap-4 mb-8">
      <TabButton
        active={activeTab === 'cars'}
        onClick={() => setActiveTab('cars')}
        icon={<CarIcon size={18} />}
        label="Mis Autos"
      />
      <TabButton
        active={activeTab === 'applications'}
        onClick={() => setActiveTab('applications')}
        icon={<FileText size={18} />}
        label="Solicitudes"
      />
      <TabButton
        active={activeTab === 'trade-ins'}
        onClick={() => setActiveTab('trade-ins')}
        icon={<RefreshCw size={18} />}
        label="Trade-Ins"
      />
      <TabButton
        active={activeTab === 'profile'}
        onClick={() => setActiveTab('profile')}
        icon={<User size={18} />}
        label="Mi Perfil"
      />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'cars':
        if (isLoadingSavedIds) {
          // Skeleton UX State
          return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full max-w-[1700px]">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((idx) => (
                  <SkeletonCarCard key={idx} />
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-slate-800/40 border border-white/5 rounded-3xl h-board-column-md animate-pulse" />
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 h-[100px] animate-pulse" />
              </div>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {savedCars.length === 0 ? (
              <div className="xl:col-span-3 text-center py-20 opacity-50">
                <CarIcon size={64} className="mx-auto text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-400">Garaje Vacío</h2>
                <p className="text-slate-500">Agrega autos desde la tienda para verlos aquí.</p>
              </div>
            ) : (
              <>
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedCars.map((car) => (
                    <div key={car.id} className="h-[400px]">
                      <CarCard
                        car={car}
                        isSaved={true}
                        isComparing={false}
                        onCompare={(e) => e.stopPropagation()}
                        onToggleSave={(e) => toggleSave(e, car)}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles size={20} className="text-primary" />
                      <h3 className="text-lg font-black uppercase tracking-wide">
                        Análisis de Cartera
                      </h3>
                    </div>
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2 text-primary animate-pulse">
                        <Loader2 size={16} className="animate-spin" /> Analizando...
                      </div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiAnalysis) }}
                        className="prose prose-invert prose-sm text-slate-300"
                      />
                    )}
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm font-bold uppercase">
                        Valor Total
                      </span>
                      <span className="text-2xl font-black text-white">
                        ${savedCars.reduce((acc, car) => acc + car.price, 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Basado en precios de lista actuales.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      case 'applications':
        if (applications.length === 0) {
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 opacity-50 bg-slate-800/20 rounded-3xl border border-dashed border-white/10"
            >
              <FileText size={64} className="mx-auto text-slate-600 mb-4" />
              <h2 className="text-2xl font-bold text-slate-400">Sin Solicitudes</h2>
              <p className="text-slate-500">Tus pre-cualificaciones de crédito aparecerán aquí.</p>
            </motion.div>
          );
        }
        return (
          <div className="grid gap-4 max-w-4xl">
            {applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group bg-slate-800/50 p-6 rounded-2xl border border-white/5 flex items-center justify-between hover:border-primary/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-white text-lg uppercase tracking-tight">{app.details}</h3>
                    <StatusBadge status={app.status as any} />
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(app.id);
                      addNotification('success', `ID ${app.id} copiado al portapapeles`);
                    }}
                    className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    CASO: {app.id} <span className="opacity-0 group-hover:opacity-100 transition-opacity">(Click para copiar)</span> • {app.date}
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-primary uppercase tracking-tighter">{app.bank}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-right">Procesador</div>
                </div>
              </motion.div>
            ))}
          </div>
        );
      case 'trade-ins':
        return (
          <div className="space-y-12">
            <PhotoAppraisal />
            <div className="grid gap-4 max-w-4xl">
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">
                Historial de Ofertas RA
              </h3>
              {tradeIns.length === 0 ? (
                <div className="text-center py-10 opacity-30 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-slate-400 italic">No hay ofertas anteriores registradas.</p>
                </div>
              ) : (
                tradeIns.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-white uppercase">{t.vehicle}</h4>
                        <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded uppercase">Certificada</div>
                      </div>
                      <p className="text-slate-500 text-[10px] font-mono tracking-widest">ID: {t.id} • {t.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-400">${t.estimatedValue}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">VALOR RA</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-2xl bg-slate-800/50 p-8 rounded-3xl border border-white/5">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl">
                RM
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Richard Mendez</h2>
                <p className="text-slate-400">Miembro desde 2024</p>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="p-4 bg-slate-900/50 rounded-xl">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Email
                </label>
                <div className="text-white font-medium">richard@example.com</div>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-xl">
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Teléfono
                </label>
                <div className="text-white font-medium">+1 (787) 555-0199</div>
              </div>
              
              {/* Digital Twin Intelligence Section */}
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-all text-primary rotate-12">
                    <Sparkles size={80} />
                 </div>
                 <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Zap size={14} /> RA Digital Status
                 </h4>
                 <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400 font-bold uppercase text-[10px]">Unidades Tasadas</span>
                       <span className="text-white font-black">{savedAppraisals.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400 font-bold uppercase text-[10px]">Integrity Score (RA)</span>
                       <span className="text-emerald-400 font-black">94/100</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                       <p className="text-[9px] text-slate-500 uppercase leading-relaxed">
                          Tu perfil está certificado nivel **Titanium**. Incrementa tu score completando inspecciones físicas en nuestro Performance Center.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <ScanFace size={16} className="text-primary" /> Biometría (FaceID)
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  {isBiometricEnabled ? 'Activado' : 'Desactivado'}
                </div>
              </div>
              <button
                onClick={toggleBiometric}
                title={isBiometricEnabled ? 'Desactivar FaceID' : 'Activar FaceID'}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${isBiometricEnabled ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${isBiometricEnabled ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <button className="w-full mt-8 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all">
              Cerrar Sesión
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d2232] text-white relative flex flex-col">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

      <header className="p-8 pb-0 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onExit}
            title="Regresar a la tienda"
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">
              Mi Garaje <span className="text-primary">Digital</span>
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
              Centro de Comando Personal
            </p>
          </div>
        </div>
        {renderTabs()}
      </header>
      <main className="flex-1 p-8 pt-4 relative z-10 overflow-y-auto custom-scrollbar">
        {isLocked ? (
          <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="w-32 h-32 bg-slate-800 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl border border-white/5">
              {isScanning ? (
                <>
                  <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                  <ScanFace size={64} className="text-primary relative z-10 animate-pulse" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_#00aed9] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                </>
              ) : (
                <Lock size={48} className="text-slate-500" />
              )}
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Acceso Seguro</h2>
              <p className="text-slate-400 text-sm">Requiere autenticación biométrica</p>
            </div>
            <button
              onClick={handleUnlock}
              disabled={isScanning}
              className="px-8 py-4 bg-primary hover:bg-cyan-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" /> Verificando...
                </>
              ) : (
                <>
                  <ScanFace /> Escanear FaceID
                </>
              )}
            </button>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${active ? 'bg-primary text-slate-900 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
  >
    {icon} {label}
  </button>
);

const StatusBadge = ({ status }: { status: 'approved' | 'pending' | 'rejected' }) => {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  const labels: Record<string, string> = {
    approved: 'Aprobada',
    pending: 'Pendiente',
    rejected: 'Rechazada',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${styles[status] || styles.pending}`}
    >
      {labels[status]}
    </span>
  );
};

export default DigitalGaragePage;
