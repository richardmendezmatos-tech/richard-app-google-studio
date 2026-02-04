import React, { Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
// --- Lazy Imports ---
import Storefront from '@/features/inventory/components/Storefront';
const AdminPanel = React.lazy(() => lazyRetry(() => import('@/features/admin/components/AdminPanel')));
const DigitalTwinDashboard = React.lazy(() => lazyRetry(() => import('@/features/digital-twin/components/DigitalTwinDashboard')));
const AIConsultant = React.lazy(() => lazyRetry(() => import('@/features/ai/components/AIConsultant')));
const AILabView = React.lazy(() => lazyRetry(() => import('@/features/ai/components/AILabView')));
const UserLogin = React.lazy(() => lazyRetry(() => import('@/features/auth/components/UserLogin')));
const VehicleDetail = React.lazy(() => lazyRetry(() => import('@/features/inventory/components/VehicleDetail')));
const TradeInView = React.lazy(() => lazyRetry(() => import('@/features/leads/components/TradeInView')));
const AppraisalView = React.lazy(() => lazyRetry(() => import('@/features/leads/components/AppraisalView')));
const ComparisonView = React.lazy(() => lazyRetry(() => import('@/features/inventory/components/ComparisonView')));
const AdminLogin = React.lazy(() => lazyRetry(() => import('@/features/auth/components/AdminLogin')));
const BlogView = React.lazy(() => lazyRetry(() => import('@/components/layout/BlogView')));
const UserProfile = React.lazy(() => lazyRetry(() => import('@/components/layout/UserProfile')));
const DigitalGarage = React.lazy(() => lazyRetry(() => import('@/components/layout/DigitalGarage')));
const PreQualifyView = React.lazy(() => lazyRetry(() => import('@/features/leads/components/PreQualifyView')));
const PrivacyView = React.lazy(() => lazyRetry(() => import('@/features/privacy/components/PrivacyView')));
const TermsView = React.lazy(() => lazyRetry(() => import('@/components/layout/TermsView')));
const NotFound = React.lazy(() => lazyRetry(() => import('@/components/layout/NotFound')));
const FrameworkDashboard = React.lazy(() => lazyRetry(() => import('@/components/layout/FrameworkDashboard')));
const KanbanDemo = React.lazy(() => lazyRetry(() => import('@/components/layout/KanbanDemo')));
const BetaOnboard = React.lazy(() => lazyRetry(() => import('@/features/admin/components/BetaOnboard')));
const EarlyAdopterOnboard = React.lazy(() => lazyRetry(() => import('@/features/admin/components/EarlyAdopterOnboard')));
const B2BBillingDashboard = React.lazy(() => lazyRetry(() => import('@/features/admin/components/B2BBillingDashboard')));
import ChaosTest from '@/components/layout/ChaosTest';
import { uploadInitialInventory } from '@/features/inventory/services/inventoryService';
import { initialInventoryData } from '@/constants/initialInventory';
import { RootState } from '@/store';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { lazyRetry } from '@/utils/lazyRetry';

// --- Guards ---
const FullScreenLoader = () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0d2232] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 to-[#0d2232]"></div>
        <div className="z-10 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(0,174,217,0.3)]"></div>
            <h1 className="text-2xl font-black tracking-tighter mb-2">RICHARD <span className="text-[#00aed9]">AUTOMOTIVE</span></h1>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Loading Module...</p>
            </div>
        </div>
    </div>
);

const AuthGuard = ({ children }: { children?: React.ReactNode }) => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div></div>;
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
};

const AdminGuard = ({ children }: { children?: React.ReactNode }) => {
    const { user, loading } = useSelector((state: RootState) => state.auth);
    const [checkingAuth, setCheckingAuth] = React.useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    React.useEffect(() => {
        let unsubscribe: () => void;
        import('@/services/firebaseService').then(({ auth }) => {
            unsubscribe = auth.onAuthStateChanged(() => {
                setCheckingAuth(false);
            });
        });
        return () => unsubscribe?.();
    }, []);

    const handleLogout = () => {
        dispatch(logoutAction());
        navigate('/');
    };

    if (loading || checkingAuth) return <FullScreenLoader />;

    if (!user) {
        console.warn("[AdminGuard] No active session, redirecting to login.");
        return <Navigate to="/admin-login" replace />;
    }

    const role = user.role || 'user';
    if (role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-900">
                <ShieldAlert size={48} className="text-red-500 mb-6" />
                <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase mb-2">Acceso Denegado</h2>
                <p className="text-slate-500 max-w-md mb-8">Nivel de seguridad insuficiente para esta sección.</p>
                <button onClick={handleLogout} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase">Cerrar Sesión</button>
            </div>
        );
    }
    return <>{children}</>;
};

// --- Animation Variants ---
const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        y: -20,
        scale: 0.98
    }
};

const pageTransition: any = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
};

interface AnimatedRoutesProps {
    inventory: any[];
    pendingVisualSearch: string | null;
    setPendingVisualSearch: (val: string | null) => void;
    handleMagicFix: () => Promise<void>;
    handleAdd: (car: Omit<Car, 'id'>) => Promise<void>;
    handleUpdate: (car: Car) => Promise<void>;
    handleDelete: (id: string) => void;
}

export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
    inventory,
    pendingVisualSearch,
    setPendingVisualSearch,
    handleMagicFix,
    handleAdd,
    handleUpdate,
    handleDelete
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <AnimatePresence mode="wait">
            <Suspense fallback={<FullScreenLoader />}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                        <PageWrapper>
                            <Storefront
                                inventory={inventory}
                                initialVisualSearch={pendingVisualSearch}
                                onClearVisualSearch={() => setPendingVisualSearch(null)}
                                onMagicFix={import.meta.env.DEV ? handleMagicFix : undefined}
                                onOpenGarage={() => navigate('/garage')}
                            />
                        </PageWrapper>
                    } />
                    <Route path="/vehicle/:id" element={<PageWrapper><VehicleDetail inventory={inventory} /></PageWrapper>} />
                    <Route path="/trade-in" element={<PageWrapper><TradeInView /></PageWrapper>} />
                    <Route path="/appraisal" element={<PageWrapper><AppraisalView /></PageWrapper>} />
                    <Route path="/compare" element={<PageWrapper><ComparisonView /></PageWrapper>} />
                    <Route path="/garage" element={<AuthGuard><PageWrapper><DigitalGarage inventory={inventory} onExit={() => navigate('/')} /></PageWrapper></AuthGuard>} />
                    <Route path="/qualify" element={<PageWrapper><PreQualifyView onExit={() => navigate('/')} /></PageWrapper>} />
                    <Route path="/privacidad" element={<PageWrapper><PrivacyView /></PageWrapper>} />
                    <Route path="/terminos" element={<PageWrapper><TermsView /></PageWrapper>} />
                    <Route path="/consultant" element={<PageWrapper><AIConsultant inventory={inventory} /></PageWrapper>} />
                    <Route path="/blog" element={<PageWrapper><BlogView /></PageWrapper>} />
                    <Route path="/profile" element={<AuthGuard><PageWrapper><UserProfile /></PageWrapper></AuthGuard>} />
                    <Route path="/lab" element={<AuthGuard><PageWrapper><AILabView /></PageWrapper></AuthGuard>} />
                    <Route path="/login" element={<PageWrapper><UserLogin /></PageWrapper>} />
                    <Route path="/admin-login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
                    <Route path="/admin" element={<AdminGuard><PageWrapper><AdminPanel inventory={inventory} onUpdate={handleUpdate} onAdd={handleAdd} onDelete={handleDelete} onInitializeDb={() => uploadInitialInventory(initialInventoryData)} /></PageWrapper></AdminGuard>} />
                    <Route path="/chaos" element={<PageWrapper><ChaosTest /></PageWrapper>} />
                    <Route path="/framework-lab" element={<AdminGuard><PageWrapper><FrameworkDashboard /></PageWrapper></AdminGuard>} />
                    <Route path="/digital-twin" element={<AdminGuard><PageWrapper><DigitalTwinDashboard /></PageWrapper></AdminGuard>} />
                    <Route path="/kanban-demo" element={<PageWrapper><KanbanDemo /></PageWrapper>} />
                    <Route path="/debug-onboard" element={<PageWrapper><BetaOnboard /></PageWrapper>} />
                    <Route path="/coo-provision" element={<PageWrapper><EarlyAdopterOnboard /></PageWrapper>} />
                    <Route path="/admin/billing" element={<AdminGuard><PageWrapper><B2BBillingDashboard /></PageWrapper></AdminGuard>} />
                    <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
                </Routes>
            </Suspense>
        </AnimatePresence>
    );
};

// Wrapper for repeated animation logic
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-full"
    >
        {children}
    </motion.div>
);
