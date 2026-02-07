import React, { useState, useEffect, useCallback } from 'react';
import { Car } from '@/types/types';
import { getCookie, setCookie } from '@/services/cookieService';
import { analyzeGarageSelection } from '@/services/geminiService';
import { BiometricService } from '@/services/biometricService';
import { ArrowLeft, Car as CarIcon, FileText, RefreshCw, User, Loader2, Sparkles, ScanFace, Lock } from 'lucide-react';
import CarCard from '@/features/inventory/components/storefront/CarCard';
import PhotoAppraisal from '@/features/garage/components/PhotoAppraisal';

interface Props {
    inventory: Car[];
    onExit: () => void;
}

type Tab = 'cars' | 'applications' | 'trade-ins' | 'profile';

const DigitalGarage: React.FC<Props> = ({ inventory, onExit }) => {
    const [activeTab, setActiveTab] = useState<Tab>('cars');
    const [savedCars, setSavedCars] = useState<Car[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    const applications = [
        { id: 'APP-001', date: '2025-10-24', status: 'approved', vehicle: 'Toyota RAV4 2024', amount: '$35,000' },
        { id: 'APP-002', date: '2025-12-15', status: 'pending', vehicle: 'Dodge Ram 1500', amount: '$42,000' }
    ];

    const tradeIns = [
        { id: 'TRD-992', date: '2025-12-30', vehicle: 'Honda Civic 2018', estimatedValue: '$14,500', status: 'valid' }
    ];

    const runAnalysis = useCallback(async (cars: Car[]) => {
        if (aiAnalysis || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeGarageSelection(cars);
            setAiAnalysis(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAnalyzing(false);
        }
    }, [aiAnalysis, isAnalyzing]);

    useEffect(() => {
        const savedIds = JSON.parse(getCookie('richard_saved_cars') || '[]');
        const cars = inventory.filter(c => savedIds.includes(c.id));
        setSavedCars(cars);

        if (cars.length > 0 && activeTab === 'cars') {
            runAnalysis(cars);
        }
    }, [inventory, activeTab, runAnalysis]);

    const toggleSave = (e: React.MouseEvent, car: Car) => {
        e.stopPropagation();
        const exists = savedCars.find(c => c.id === car.id);
        let updatedCars;
        if (exists) {
            updatedCars = savedCars.filter(c => c.id !== car.id);
        } else {
            updatedCars = [...savedCars, car];
        }
        setSavedCars(updatedCars);
        const updatedIds = updatedCars.map(c => c.id);
        setCookie('richard_saved_cars', JSON.stringify(updatedIds), 30);
    };

    const renderTabs = () => (
        <div className="flex flex-wrap gap-4 mb-8">
            <TabButton active={activeTab === 'cars'} onClick={() => setActiveTab('cars')} icon={<CarIcon size={18} />} label="Mis Autos" />
            <TabButton active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} icon={<FileText size={18} />} label="Solicitudes" />
            <TabButton active={activeTab === 'trade-ins'} onClick={() => setActiveTab('trade-ins')} icon={<RefreshCw size={18} />} label="Trade-Ins" />
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={18} />} label="Mi Perfil" />
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'cars':
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
                                    {savedCars.map(car => (
                                        <div key={car.id} className="h-[400px]">
                                            <CarCard
                                                car={car}
                                                isSaved={true}
                                                isComparing={false}
                                                onCompare={(e) => { e.stopPropagation(); }}
                                                onToggleSave={(e) => toggleSave(e, car)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Sparkles size={20} className="text-[#00aed9]" />
                                            <h3 className="text-lg font-black uppercase tracking-wide">Análisis de Cartera</h3>
                                        </div>
                                        {isAnalyzing ? (
                                            <div className="flex items-center gap-2 text-[#00aed9] animate-pulse">
                                                <Loader2 size={16} className="animate-spin" /> Analizando...
                                            </div>
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: aiAnalysis }} className="prose prose-invert prose-sm text-slate-300" />
                                        )}
                                    </div>
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-slate-400 text-sm font-bold uppercase">Valor Total</span>
                                            <span className="text-2xl font-black text-white">${savedCars.reduce((acc, car) => acc + car.price, 0).toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Basado en precios de lista actuales.</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'applications':
                return (
                    <div className="grid gap-4 max-w-4xl">
                        {applications.map(app => (
                            <div key={app.id} className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-white text-lg">{app.vehicle}</h3>
                                        <StatusBadge status={app.status as 'approved' | 'pending' | 'rejected'} />
                                    </div>
                                    <p className="text-slate-400 text-sm">ID: {app.id} • Enviada: {app.date}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-black text-white">{app.amount}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Monto</div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'trade-ins':
                return (
                    <div className="space-y-12">
                        <PhotoAppraisal />
                        <div className="grid gap-4 max-w-4xl">
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">Valoraciones Previas</h3>
                            {tradeIns.map(offer => (
                                <div key={offer.id} className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#00aed9]/30 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-white text-lg">{offer.vehicle}</h3>
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded">Oferta Visible</span>
                                        </div>
                                        <p className="text-slate-400 text-sm">Fecha: {offer.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-[#00aed9]">{offer.estimatedValue}</div>
                                        <div className="text-xs text-slate-500 uppercase font-bold">Valor Estimado</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="max-w-2xl bg-slate-800/50 p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#00aed9] to-blue-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl">
                                RM
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Richard Mendez</h2>
                                <p className="text-slate-400">Miembro desde 2024</p>
                            </div>
                        </div>
                        <div className="grid gap-6">
                            <div className="p-4 bg-slate-900/50 rounded-xl">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                                <div className="text-white font-medium">richard@example.com</div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Teléfono</label>
                                <div className="text-white font-medium">+1 (787) 555-0199</div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    <ScanFace size={16} className="text-[#00aed9]" /> Biometría (FaceID)
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                                    {isBiometricEnabled ? 'Activado' : 'Desactivado'}
                                </div>
                            </div>
                            <button
                                onClick={toggleBiometric}
                                title={isBiometricEnabled ? 'Desactivar FaceID' : 'Activar FaceID'}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${isBiometricEnabled ? 'bg-[#00aed9]' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isBiometricEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
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
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Mi Garaje <span className="text-[#00aed9]">Digital</span></h1>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Centro de Comando Personal</p>
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
                                    <div className="absolute inset-0 bg-[#00aed9]/20 animate-pulse"></div>
                                    <ScanFace size={64} className="text-[#00aed9] relative z-10 animate-pulse" />
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[#00aed9] shadow-[0_0_15px_#00aed9] animate-[scan_1.5s_ease-in-out_infinite]"></div>
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
                            className="px-8 py-4 bg-[#00aed9] hover:bg-cyan-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isScanning ? (
                                <><Loader2 className="animate-spin" /> Verificando...</>
                            ) : (
                                <><ScanFace /> Escanear FaceID</>
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
        className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${active ? 'bg-[#00aed9] text-slate-900 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
    >
        {icon} {label}
    </button>
);

const StatusBadge = ({ status }: { status: 'approved' | 'pending' | 'rejected' }) => {
    const styles: Record<string, string> = {
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    const labels: Record<string, string> = {
        approved: 'Aprobada',
        pending: 'Pendiente',
        rejected: 'Rechazada'
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${styles[status] || styles.pending}`}>
            {labels[status]}
        </span>
    );
};

export default DigitalGarage;
