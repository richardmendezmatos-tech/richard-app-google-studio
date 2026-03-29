import React, { Suspense } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/entities/session';
import { motion, AnimatePresence } from 'motion/react';
import { Car } from '@/entities/shared';

// --- Lazy Imports ---
interface StorefrontProps {
  inventory: Car[];
  initialVisualSearch: string | null;
  onClearVisualSearch: () => void;
  onMagicFix?: () => Promise<void>;
  onOpenGarage: () => void;
}
const Storefront = React.lazy(() =>
  lazyRetry(() => import('@/pages/storefront/ui/Storefront')),
) as unknown as React.ComponentType<StorefrontProps>;
interface AdminRoutesProps {
  inventory: Car[];
  onUpdate: (car: Car) => Promise<void>;
  onAdd: (car: Omit<Car, 'id'>) => Promise<void>;
  onDelete: (id: string) => void;
  onInitializeDb: () => Promise<void>;
}
const AdminRoutes = React.lazy(() =>
  lazyRetry(() => import('@/pages/admin/command-center/ui/AdminRoutes').then(m => ({ default: m.AdminRoutes || m.default }))),
) as unknown as React.ComponentType<AdminRoutesProps>;
const DigitalTwinDashboard = React.lazy(() =>
  lazyRetry(() => import('@/pages/digital-twin/ui/DigitalTwinDashboard')),
);
interface AIConsultantProps {
  inventory: Car[];
}
const AIConsultant = React.lazy(() =>
  lazyRetry(() => import('@/widgets/ai-chat/AIConsultant')),
) as unknown as React.ComponentType<AIConsultantProps>;
const AILabPage = React.lazy(() => lazyRetry(() => import('@/pages/ai-lab/ui/AILabPage')));
const UserLogin = React.lazy(() => lazyRetry(() => import('@/pages/auth/ui/UserLogin')));
interface VehicleDetailProps {
  inventory: Car[];
}
const VehicleDetail = React.lazy(() =>
  lazyRetry(() => import('@/pages/storefront/ui/VehicleDetail')),
) as unknown as React.ComponentType<VehicleDetailProps>;
const TradeInView = React.lazy(() =>
  lazyRetry(() => import('@/pages/leads/ui/TradeInView')),
);
const AppraisalView = React.lazy(() =>
  lazyRetry(() => import('@/pages/leads/ui/AppraisalView')),
);
const ComparisonView = React.lazy(() =>
  lazyRetry(() => import('@/pages/comparison/ui/ComparisonView')),
);
const SystemAccessLogin = React.lazy(() =>
  lazyRetry(() => import('@/pages/auth/ui/SystemAccessLogin')),
);
const BlogPage = React.lazy(() => lazyRetry(() => import('@/pages/blog/ui/BlogPage')));

// --- SEO Programático: Colecciones ---
interface CollectionProps {
  inventory: Car[];
}
const CollectionPage = React.lazy(() =>
  lazyRetry(() => import('@/pages/storefront/ui/CollectionPage')),
) as unknown as React.ComponentType<CollectionProps>;

const ProfilePage = React.lazy(() =>
  lazyRetry(() => import('@/pages/profile/ui/ProfilePage')),
);
interface DigitalGarageProps {
  inventory: Car[];
  onExit: () => void;
}
const DigitalGaragePage = React.lazy(() =>
  lazyRetry(() => import('@/pages/digital-garage/ui/DigitalGaragePage')),
) as unknown as React.ComponentType<DigitalGarageProps>;
interface PreQualifyViewProps {
  onExit: () => void;
}
const PreQualifyView = React.lazy(() =>
  lazyRetry(() => import('@/pages/leads/ui/PreQualifyView')),
) as unknown as React.ComponentType<PreQualifyViewProps>;
const PrivacyView = React.lazy(() =>
  lazyRetry(() => import('@/pages/privacy/ui/PrivacyView')),
);
const TermsView = React.lazy(() => lazyRetry(() => import('@/widgets/brand-ui/layout/TermsView')));
const NotFound = React.lazy(() => lazyRetry(() => import('@/widgets/brand-ui/layout/NotFound')));
const FrameworkDashboard = React.lazy(() =>
  lazyRetry(() => import('@/widgets/brand-ui/layout/FrameworkDashboard')),
);
const BetaOnboard = React.lazy(() =>
  lazyRetry(() => import('@/pages/admin/command-center/ui/BetaOnboard')),
);
const EarlyAdopterOnboard = React.lazy(() =>
  lazyRetry(() => import('@/pages/admin/command-center/ui/EarlyAdopterOnboard')),
);
const B2BBillingDashboard = React.lazy(() =>
  lazyRetry(() => import('@/pages/admin/command-center/ui/B2BBillingDashboard')),
);
const LeadAnalyticsPage = React.lazy(() =>
  lazyRetry(() => import('@/features/leads').then(m => ({ default: m.LeadAnalyticsPage }))),
);
const HoustonDashboard = React.lazy(() =>
  lazyRetry(() => import('@/widgets/houston/HoustonDashboard')),
);
const ChaosTest = React.lazy(() => lazyRetry(() => import('@/widgets/brand-ui/layout/ChaosTest')));
const LocalClusterView = React.lazy(() =>
  lazyRetry(() => import('@/features/inventory').then(m => ({ default: m.LocalClusterView }))),
);
const CreditAppPage = React.lazy(() => 
  lazyRetry(() => import('@/pages/storefront/ui/CreditAppPage')),
);
const FinanciamientoPage = React.lazy(() =>
  lazyRetry(() => import('@/pages/financiamiento/ui/FinanciamientoPage')),
);
const ContactoPage = React.lazy(() =>
  lazyRetry(() => import('@/pages/contacto/ui/ContactoPage')),
);
const CitySEOPage = React.lazy(() =>
  lazyRetry(() => import('@/pages/storefront/ui/CitySEOPage')),
);

const CRMBoard = React.lazy(() =>
  lazyRetry(() => import('@/pages/admin/command-center/ui/CRMBoard')),
) as unknown as React.ComponentType<any>;
import { uploadInitialInventory } from '@/entities/inventory/api/adapters/inventoryService';
import { initialInventoryData } from '@/entities/inventory';
import { lazyRetry } from '@/shared/lib/utils/lazyRetry';

// --- Guards ---
const FullScreenLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0d2232] text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyan-900/20 to-[#0d2232]"></div>
    <div className="z-10 flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(0,174,217,0.3)]"></div>
      <h1 className="text-2xl font-black tracking-tighter mb-2">
        RICHARD <span className="text-primary">AUTOMOTIVE</span>
      </h1>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Loading Module...
        </p>
      </div>
    </div>
  </div>
);

const AuthGuard = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const AdminGuard = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading, logout } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [isBypassed, setIsBypassed] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    // E2E Bypass check
    if (localStorage.getItem('e2e_bypass') === 'true') {
      setIsBypassed(true);
      setCheckingAuth(false);
      return;
    }

    let unsubscribe: () => void;
    import('@/shared/api/firebase/firebaseService').then(({ auth }) => {
      unsubscribe = auth.onAuthStateChanged(() => {
        setCheckingAuth(false);
      });
    });
    return () => unsubscribe?.();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || checkingAuth) return <FullScreenLoader />;
  if (isBypassed) return <>{children}</>;
  if (!user) {
    console.warn('[AdminGuard] No active session, redirecting to login.');
    return <Navigate to="/admin-login" replace />;
  }

  const role = user.role || 'user';
  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-900">
        <ShieldAlert size={48} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase mb-2">
          Acceso Denegado
        </h2>
        <p className="text-slate-500 max-w-md mb-8">
          Nivel de seguridad insuficiente para esta sección.
        </p>
        <button
          onClick={handleLogout}
          className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

interface AnimatedRoutesProps {
  inventory: Car[];
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
  handleDelete,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Storefront
                  inventory={inventory}
                  initialVisualSearch={pendingVisualSearch}
                  onClearVisualSearch={() => setPendingVisualSearch(null)}
                  onMagicFix={import.meta.env.DEV ? handleMagicFix : undefined}
                  onOpenGarage={() => navigate('/garage')}
                />
              </PageWrapper>
            }
          />
          <Route
            path="/v/:slug/:id"
            element={
              <PageWrapper>
                <VehicleDetail inventory={inventory} />
              </PageWrapper>
            }
          />
          <Route
            path="/vehicle/:id"
            element={
              <PageWrapper>
                <VehicleDetail inventory={inventory} />
              </PageWrapper>
            }
          />
          <Route
            path="/comprar/:location/:category?"
            element={
              <PageWrapper>
                <LocalClusterView inventory={inventory} />
              </PageWrapper>
            }
          />
          <Route
            path="/coleccion/:brand"
            element={
              <PageWrapper>
                <CollectionPage inventory={inventory} />
              </PageWrapper>
            }
          />
          <Route
            path="/presupuesto/:maxPrice"
            element={
              <PageWrapper>
                <CollectionPage inventory={inventory} />
              </PageWrapper>
            }
          />
          <Route
            path="/trade-in"
            element={
              <PageWrapper>
                <TradeInView />
              </PageWrapper>
            }
          />
          <Route
            path="/apply"
            element={
              <PageWrapper>
                <CreditAppPage />
              </PageWrapper>
            }
          />
          <Route
            path="/financiamiento"
            element={
              <PageWrapper>
                <FinanciamientoPage />
              </PageWrapper>
            }
          />
          <Route
            path="/contacto"
            element={
              <PageWrapper>
                <ContactoPage />
              </PageWrapper>
            }
          />
          <Route
            path="/usados-en/:city"
            element={
              <PageWrapper>
                <CitySEOPage />
              </PageWrapper>
            }
          />
          <Route
            path="/appraisal"
            element={
              <PageWrapper>
                <AppraisalView />
              </PageWrapper>
            }
          />
          <Route
            path="/compare"
            element={
              <PageWrapper>
                <ComparisonView />
              </PageWrapper>
            }
          />
          <Route
            path="/garage"
            element={
              <AuthGuard>
                <PageWrapper>
                <DigitalGaragePage inventory={inventory} onExit={() => navigate('/')} />
              </PageWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/qualify"
            element={
              <PageWrapper>
                <PreQualifyView onExit={() => navigate('/')} />
              </PageWrapper>
            }
          />
          <Route
            path="/privacidad"
            element={
              <PageWrapper>
                <PrivacyView />
              </PageWrapper>
            }
          />
          <Route
            path="/terminos"
            element={
              <PageWrapper>
                <TermsView />
              </PageWrapper>
            }
          />
          <Route
            path="/consultant"
            element={
              <PageWrapper>
                <AIConsultant inventory={inventory} />
              </PageWrapper>
            }
          />
          <Route
            path="/blog"
            element={
              <BlogPage />
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <PageWrapper>
                  <ProfilePage />
                </PageWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/lab"
            element={
              <AuthGuard>
                <PageWrapper>
                  <AILabPage />
                </PageWrapper>
              </AuthGuard>
            }
          />
          <Route
            path="/login"
            element={
              <PageWrapper>
                <UserLogin />
              </PageWrapper>
            }
          />
          <Route
            path="/admin-login"
            element={
              <PageWrapper>
                <SystemAccessLogin />
              </PageWrapper>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <PageWrapper>
                  <AdminRoutes
                    inventory={inventory}
                    onUpdate={handleUpdate}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    onInitializeDb={() => uploadInitialInventory(initialInventoryData)}
                  />
                </PageWrapper>
              </AdminGuard>
            }
          />
          <Route
            path="/chaos"
            element={
              <PageWrapper>
                <ChaosTest />
              </PageWrapper>
            }
          />
          <Route
            path="/framework-lab"
            element={
              <AdminGuard>
                <PageWrapper>
                  <FrameworkDashboard />
                </PageWrapper>
              </AdminGuard>
            }
          />
          <Route
            path="/strategy-lab"
            element={
              <AdminGuard>
                <PageWrapper>
                  <DigitalTwinDashboard />
                </PageWrapper>
              </AdminGuard>
            }
          />
          <Route
            path="/debug-onboard"
            element={
              <PageWrapper>
                <BetaOnboard />
              </PageWrapper>
            }
          />
          <Route
            path="/coo-provision"
            element={
              <PageWrapper>
                <EarlyAdopterOnboard />
              </PageWrapper>
            }
          />

          <Route
            path="/e2e-framework"
            element={
              <AdminGuard>
                <PageWrapper>
                  <FrameworkDashboard />
                </PageWrapper>
              </AdminGuard>
            }
          />
          <Route
            path="/e2e-kanban"
            element={
              <AdminGuard>
                <PageWrapper>
                  <CRMBoard onUpdate={handleUpdate} onDelete={handleDelete} />
                </PageWrapper>
              </AdminGuard>
            }
          />
          <Route
            path="*"
            element={
              <PageWrapper>
                <NotFound />
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

// Wrapper for repeated animation logic
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="min-h-full"
  >
    {children}
  </motion.div>
);
