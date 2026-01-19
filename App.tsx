import React, { useState, useEffect, Suspense, useContext } from 'react';
import { HashRouter, BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ViewMode, Car } from './types';
import Storefront from './components/Storefront'; // Keep Eager
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const AIConsultant = React.lazy(() => import('./components/AIConsultant'));
import AIChatWidget from './components/AIChatWidget'; // Eager Load for global availability
import ThemeToggle from './components/ThemeToggle';
const AILabView = React.lazy(() => import('./components/AILabView'));
const UserLogin = React.lazy(() => import('./components/UserLogin'));
const VehicleDetail = React.lazy(() => import('./components/VehicleDetail'));
const TradeInView = React.lazy(() => import('./components/TradeInView'));
const AppraisalView = React.lazy(() => import('./components/AppraisalView'));
const ComparisonView = React.lazy(() => import('./components/ComparisonView'));
const AdminLogin = React.lazy(() => import('./components/AdminLogin'));
const BlogView = React.lazy(() => import('./components/BlogView'));
const DigitalGarage = React.lazy(() => import('./components/DigitalGarage'));
const PreQualifyView = React.lazy(() => import('./components/PreQualifyView'));
const PrivacyView = React.lazy(() => import('./components/PrivacyView'));
const TermsView = React.lazy(() => import('./components/TermsView'));
import CookieConsent from './components/CookieConsent';
import { LayoutDashboard, ShoppingBag, BotMessageSquare, Phone, FlaskConical, LogIn, LogOut, Menu, Newspaper, Warehouse, FileCheck2, ShieldAlert, Lock, User as UserIcon, Car as CarIcon } from 'lucide-react';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import LoadingScreen from './components/LoadingScreen';
import ReloadPrompt from './components/ReloadPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import ComparisonBar from './components/ComparisonBar';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { logoutUser, syncInventory, addCar, updateCar, deleteCar, uploadInitialInventory, registerUser } from './services/firebaseService';
import { initializePushNotifications } from './services/pushService';
import { startGeofenceMonitoring } from './services/geofenceService';

// Initial data for DB setup
const initialInventoryData: Omit<Car, 'id'>[] = [
  {
    name: 'Hyundai Tucson 2025',
    price: 38500,
    type: 'suv',
    badge: 'Rediseñado',
    img: 'https://images.unsplash.com/photo-1695221971766-3d778d910dc7?q=80&w=1200&auto=format&fit=crop', // Modern Grey SUV
    featured: true,
  },
  {
    name: 'Hyundai Santa Fe 2024',
    price: 42300,
    type: 'suv',
    badge: 'Más Vendido',
    img: 'https://images.unsplash.com/photo-1631522858632-1b157bd752e2?q=80&w=1200&auto=format&fit=crop', // Boxy SUV
    featured: true,
  },
  {
    name: 'Hyundai Palisade 2025',
    price: 55900,
    type: 'suv',
    badge: 'Flagship',
    img: 'https://images.unsplash.com/photo-1647494480572-c2834b6e56ad?q=80&w=1200&auto=format&fit=crop', // White Luxury SUV
    featured: true,
  },
  {
    name: 'Hyundai IONIQ 5 2025',
    price: 48900,
    type: 'suv',
    badge: '100% Eléctrico',
    img: 'https://images.unsplash.com/photo-1658314643093-5757788e895c?q=80&w=1200&auto=format&fit=crop', // White EV
    featured: true,
  },
  {
    name: 'Genesis GV80 2024',
    price: 78500,
    type: 'luxury',
    badge: 'Ultra Lujo',
    img: 'https://images.unsplash.com/photo-1627916533596-3392305a2789?q=80&w=1200&auto=format&fit=crop', // Luxury Genesis
    featured: true,
  },
];

// Loading Component
const FullScreenLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-[#00aed9]">
    <div className="animate-spin w-12 h-12 border-4 border-[#00aed9] rounded-full border-t-transparent mb-4"></div>
    <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Cargando Sistema...</p>
  </div>
);

const AppContent: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [inventory, setInventory] = useState<Car[]>([]);
  const [pendingVisualSearch, setPendingVisualSearch] = useState<string | null>(null);

  const { theme } = useContext(ThemeContext);
  const { user, role, loading } = useContext(AuthContext);
  const { addNotification } = useNotification();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = syncInventory((updatedInventory) => {
      setInventory(updatedInventory);
    });

    // Initialize Push Notifications (Native only)
    initializePushNotifications();

    // Initialize Geofencing (Free Native Feature)
    startGeofenceMonitoring();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
      addNotification('info', 'Has cerrado sesión correctamente.');
    } catch (error) {
      console.error("Logout error:", error);
      addNotification('error', 'Error al cerrar sesión.');
    }
  };

  const handleMagicFix = async () => {
    // Security Guard: Prevent execution in production
    if (!import.meta.env.DEV) {
      addNotification('error', '⛔️ Función restringida. Solo disponible en modo desarrollo.');
      return;
    }

    try {
      addNotification('info', 'Iniciando reparación automática...');
      const tempId = Date.now();
      const tempEmail = "admin_fix_" + tempId + "@richard.com"; // Fixed string concatenation
      const tempPass = "fix123456";
      await registerUser(tempEmail, tempPass);
      await uploadInitialInventory(initialInventoryData);
      addNotification('success', '✅ REPARACIÓN COMPLETA.');
    } catch (error: any) {
      addNotification('error', 'Error en reparación: ' + error.message);
    }
  };

  const getCurrentViewMode = (): ViewMode | string => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return ViewMode.ADMIN;
    if (path === '/garage') return ViewMode.DIGITAL_GARAGE;
    if (path === '/qualify') return ViewMode.PRE_QUALIFY;
    if (path === '/consultant') return ViewMode.AI_CONSULTANT;
    if (path === '/blog') return ViewMode.BLOG;
    if (path === '/trade-in') return ViewMode.TRADE_IN;
    if (path === '/lab') return ViewMode.AI_LAB;
    if (path.startsWith('/login')) return 'login';
    return ViewMode.STOREFRONT;
  };

  // AuthGuard that remembers where the user wanted to go
  const AuthGuard = ({ children }: { children?: React.ReactNode }) => {
    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div></div>;
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  };

  const AdminGuard = ({ children }: { children?: React.ReactNode }) => {
    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div></div>;
    if (!user) return <Navigate to="/admin-login" />;
    if (role !== 'admin') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50 dark:bg-slate-900">
          <ShieldAlert size={48} className="text-red-500 mb-6" />
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase mb-2">Acceso Denegado</h2>
          <p className="text-slate-500 max-w-md mb-8">Esta sección es exclusiva para administradores.</p>
          <button onClick={handleLogout} className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold uppercase">Cerrar Sesión</button>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-900 overflow-hidden relative">

      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-[#173d57] text-white flex justify-between items-center shadow-md z-50">
        <span className="font-black text-xl tracking-tight">RICHARD<span className="text-[#00aed9]">AUTO</span></span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
      </div>

      {/* Main Sidebar Navigation */}
      <nav className={"fixed inset-y-0 left-0 w-72 bg-[#173d57]/95 dark:bg-[#0d2232]/95 backdrop-blur-2xl border-r border-white/5 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen pointer-events-auto " + (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="p-10 flex justify-between items-center cursor-pointer group" onClick={() => navigate('/')}>
          <h1 className="text-3xl font-black tracking-tighter leading-none group-hover:scale-105 transition-transform">
            <span className="text-[#00aed9]">RICHARD</span>
            <br />AUTOMOTIVE
          </h1>
        </div>

        <div className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavButton active={getCurrentViewMode() === ViewMode.STOREFRONT} onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} icon={<ShoppingBag size={20} />} label="Tienda Digital" />
          <NavButton active={getCurrentViewMode() === ViewMode.DIGITAL_GARAGE} onClick={() => { navigate('/garage'); setIsMobileMenuOpen(false); }} icon={<Warehouse size={20} />} label="Mi Garaje" />
          <NavButton active={getCurrentViewMode() === ViewMode.PRE_QUALIFY} onClick={() => { navigate('/qualify'); setIsMobileMenuOpen(false); }} icon={<FileCheck2 size={20} />} label="Pre-Cualificación" />
          <NavButton active={getCurrentViewMode() === ViewMode.TRADE_IN} onClick={() => { navigate('/trade-in'); setIsMobileMenuOpen(false); }} icon={<CarIcon size={20} />} label="Vender mi Auto" />
          <NavButton active={getCurrentViewMode() === ViewMode.AI_CONSULTANT} onClick={() => { navigate('/consultant'); setIsMobileMenuOpen(false); }} icon={<BotMessageSquare size={20} />} label="Consultor IA" />
          <NavButton active={getCurrentViewMode() === ViewMode.BLOG} onClick={() => { navigate('/blog'); setIsMobileMenuOpen(false); }} icon={<Newspaper size={20} />} label="AI Newsroom" />

          <div className="pt-4 my-2 border-t border-white/5" />

          {/* Persistent Login/User Button */}
          {!loading && user ? (
            <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00aed9] to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                  <UserIcon size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black truncate text-white uppercase tracking-tight">{user.email}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#00aed9] font-black">{role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border border-red-500/10">
                  <LogOut size={14} /> Salir
                </button>
                {role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border border-cyan-500/10">
                    <ShieldAlert size={14} /> Admin
                  </button>
                )}
              </div>
            </div>
          ) : (
            <NavButton active={false} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} icon={<LogIn size={20} />} label="Iniciar Sesión" isAction />
          )}

          <div className="pt-2 my-2 border-t border-white/5" />

          <NavButton active={getCurrentViewMode() === ViewMode.AI_LAB} onClick={() => { navigate('/lab'); setIsMobileMenuOpen(false); }} icon={<FlaskConical size={20} />} label="Laboratorio IA" highlight />
        </div>

        <div className="p-6 border-t border-white/5 bg-black/10 backdrop-blur-md">
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-screen overflow-y-auto bg-slate-950 text-slate-100">
        <ReloadPrompt />
        <OfflineIndicator />
        <AIChatWidget inventory={inventory} /> { /* Global Chat Widget */}
        <Suspense fallback={<FullScreenLoader />}>
          <Routes>
            <Route path="/" element={
              <Storefront
                inventory={inventory}
                initialVisualSearch={pendingVisualSearch}
                onClearVisualSearch={() => setPendingVisualSearch(null)}
                onMagicFix={import.meta.env.DEV ? handleMagicFix : undefined}
                onOpenGarage={() => navigate('/garage')}
              />
            } />
            <Route path="/vehicle/:id" element={<VehicleDetail inventory={inventory} />} />
            <Route path="/trade-in" element={<TradeInView />} />
            <Route path="/appraisal" element={<AppraisalView />} />
            <Route path="/compare" element={<ComparisonView />} />
            <Route path="/garage" element={<AuthGuard><DigitalGarage inventory={inventory} onExit={() => navigate('/')} /></AuthGuard>} />
            <Route path="/qualify" element={<PreQualifyView onExit={() => navigate('/')} />} />
            <Route path="/privacidad" element={<PrivacyView />} />
            <Route path="/terminos" element={<TermsView />} />
            <Route path="/consultant" element={<AIConsultant inventory={inventory} />} />
            <Route path="/blog" element={<BlogView />} />
            <Route path="/lab" element={<AuthGuard><AILabView onExit={() => navigate('/')} onVisualSearch={(img) => { setPendingVisualSearch(img); navigate('/'); }} /></AuthGuard>} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminPanel inventory={inventory} onUpdate={() => { }} onAdd={() => { }} onDelete={() => { }} onInitializeDb={() => uploadInitialInventory(initialInventoryData)} /></AdminGuard>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
        <CookieConsent />
      </main>

    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, isAction = false, highlight = false }: any) => {
  let classes = "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ";

  if (active) {
    classes += "bg-[#00aed9] text-white shadow-xl shadow-[#00aed9]/20";
  } else if (highlight) {
    classes += "bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-500 border border-amber-500/30 hover:shadow-lg hover:shadow-orange-500/20";
  } else if (isAction) {
    classes += "bg-gradient-to-r from-[#00aed9]/10 to-[#00aed9]/5 text-[#00aed9] hover:bg-[#00aed9]/20";
  } else {
    classes += "text-slate-400 hover:bg-white/5 hover:text-white";
  }

  return (
    <button onClick={onClick} className={classes}>
      <div className={`absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${active ? 'hidden' : ''}`} />
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
      {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />}
    </button>
  );
};

// Fix for index.tsx error: added missing App component and default export.

// Conditional Router to support clean URLs on web and HashRouter on mobile (Capacitor)
const SmartRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNative = !!((window as any).Capacitor && (window as any).Capacitor.isNative);

  const Router = isNative ? HashRouter : BrowserRouter;

  useEffect(() => {
    console.log(`[SmartRouter] Active mode: ${isNative ? 'HashRouter (Native/Capacitor)' : 'BrowserRouter (Web)'}`);
  }, [isNative]);

  return <Router>{children}</Router>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ComparisonProvider>
            <SmartRouter>
              <AppContent />
              <ComparisonBar />
            </SmartRouter>
          </ComparisonProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
