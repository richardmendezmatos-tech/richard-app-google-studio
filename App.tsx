
import React, { useState, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ViewMode, Car } from './types';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import AIConsultant from './components/AIConsultant';
import ThemeToggle from './components/ThemeToggle';
import AILabView from './components/AILabView';
import UserLogin from './components/UserLogin';
import AdminLogin from './components/AdminLogin';
import BlogView from './components/BlogView'; 
import DigitalGarage from './components/DigitalGarage';
import PreQualifyView from './components/PreQualifyView'; 
import CookieConsent from './components/CookieConsent'; 
import { LayoutDashboard, ShoppingBag, BotMessageSquare, Phone, FlaskConical, LogIn, LogOut, Menu, Newspaper, Warehouse, FileCheck2, ShieldAlert, Lock, User as UserIcon } from 'lucide-react';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { NotificationProvider, useNotification } from './contexts/NotificationContext'; 
import { logoutUser, syncInventory, addCar, updateCar, deleteCar, uploadInitialInventory, registerUser } from './services/firebaseService';

// Initial data for DB setup
const initialInventoryData: Omit<Car, 'id'>[] = [
  {
    name: 'Hyundai Tucson 2025',
    price: 38500,
    type: 'suv',
    badge: 'Rediseñado',
    img: 'https://s7d1.scene7.com/is/image/hyundai/2025-tucson-limited-amazon-gray-profile?fmt=png-alpha&wid=1200',
    featured: true,
  },
  {
    name: 'Hyundai Santa Fe 2024',
    price: 42300,
    type: 'suv',
    badge: 'Más Vendido',
    img: 'https://s7d1.scene7.com/is/image/hyundai/2024-santa-fe-calligraphy-earthy-brass-matte-profile?fmt=png-alpha&wid=1200',
    featured: true,
  },
  {
    name: 'Hyundai Palisade 2025',
    price: 55900,
    type: 'suv',
    badge: 'Flagship',
    img: 'https://s7d1.scene7.com/is/image/hyundai/2025-palisade-calligraphy-night-edition-hyper-white-profile?fmt=png-alpha&wid=1200',
    featured: true,
  },
  {
    name: 'Hyundai IONIQ 5 2025',
    price: 48900,
    type: 'suv',
    badge: '100% Eléctrico',
    img: 'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-limited-rwd-atlas-white-profile?fmt=png-alpha&wid=1200',
    featured: true,
  },
  {
    name: 'Genesis GV80 2024',
    price: 78500,
    type: 'luxury',
    badge: 'Ultra Lujo',
    img: 'https://vehicle-images.dealerinspire.com/stock-images/chrome/c623910c732488a07106c68388836511.png',
    featured: true,
  }
];

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
    try {
        addNotification('info', 'Iniciando reparación automática...');
        const tempId = Date.now();
        const tempEmail = `admin_fix_${tempId}@richard.com`;
        const tempPass = "fix123456";
        await registerUser(tempEmail, tempPass);
        await uploadInitialInventory(initialInventoryData);
        addNotification('success', '✅ REPARACIÓN COMPLETADA.');
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
      if (path === '/lab') return ViewMode.AI_LAB;
      if (path.startsWith('/login')) return 'login';
      return ViewMode.STOREFRONT;
  };
  
  // AuthGuard that remembers where the user wanted to go
  // Fix: Make children optional in the type definition to resolve TS error in Route elements
  const AuthGuard = ({ children }: { children?: React.ReactNode }) => {
      if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-cyan-500 rounded-full border-t-transparent"></div></div>;
      if (!user) {
        // We save the 'location' in the navigation state so the login page can redirect us back
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
      return <>{children}</>;
  };

  // Fix: Make children optional in the type definition to resolve TS error in Route elements
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
      <nav className={`
        fixed inset-y-0 left-0 w-72 bg-[#173d57] dark:bg-[#0d2232] text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-10 flex justify-between items-center cursor-pointer" onClick={() => navigate('/')}>
          <h1 className="text-3xl font-black tracking-tighter leading-none">
            <span className="text-[#00aed9]">RICHARD</span>
            <br />AUTOMOTIVE
          </h1>
        </div>
        
        <div className="flex-1 px-6 space-y-3 overflow-y-auto">
          <NavButton active={getCurrentViewMode() === ViewMode.STOREFRONT} onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }} icon={<ShoppingBag size={20} />} label="Tienda Digital" />
          <NavButton active={getCurrentViewMode() === ViewMode.DIGITAL_GARAGE} onClick={() => { navigate('/garage'); setIsMobileMenuOpen(false); }} icon={<Warehouse size={20} />} label="Mi Garaje" />
          <NavButton active={getCurrentViewMode() === ViewMode.PRE_QUALIFY} onClick={() => { navigate('/qualify'); setIsMobileMenuOpen(false); }} icon={<FileCheck2 size={20} />} label="Pre-Cualificación" />
          <NavButton active={getCurrentViewMode() === ViewMode.AI_CONSULTANT} onClick={() => { navigate('/consultant'); setIsMobileMenuOpen(false); }} icon={<BotMessageSquare size={20} />} label="Consultor IA" />
          <NavButton active={getCurrentViewMode() === ViewMode.BLOG} onClick={() => { navigate('/blog'); setIsMobileMenuOpen(false); }} icon={<Newspaper size={20} />} label="AI Newsroom" />
          
          <div className="pt-4 my-4 border-t border-white/10" />

          {/* Persistent Login/User Button */}
          {!loading && user ? (
            <div className="space-y-3">
              <div className="px-4 py-4 bg-white/5 rounded-2xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#00aed9] flex items-center justify-center text-white font-bold">
                    {user.email?.[0].toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Usuario Activo</p>
                    <p className="text-xs font-bold truncate text-white">{user.email}</p>
                 </div>
              </div>
              
              {role === 'admin' && (
                <>
                  <NavButton active={getCurrentViewMode() === ViewMode.ADMIN} onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }} icon={<LayoutDashboard size={20} />} label="Control Center" />
                  <NavButton active={getCurrentViewMode() === ViewMode.AI_LAB} onClick={() => { navigate('/lab'); setIsMobileMenuOpen(false); }} icon={<FlaskConical size={20} />} label="Laboratorio IA" highlight />
                </>
              )}

              <NavButton onClick={handleLogout} icon={<LogOut size={20} />} label="Cerrar Sesión" isAction />
            </div>
          ) : !loading && (
             <div className="pt-2">
                <NavButton active={getCurrentViewMode() === 'login'} onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} icon={<LogIn size={20} />} label="Acceso Clientes" highlight />
             </div>
          )}
        </div>

        <div className="p-6 bg-[#0d2232] dark:bg-black/20">
          <div className="flex justify-between items-center mb-4">
             <ThemeToggle />
             {/* Administrative portal link hidden from normal navigation */}
             <button 
                onClick={() => window.open('/#/admin-login', '_blank')} 
                className="text-[10px] uppercase font-bold text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
             >
                <Lock size={10} /> Portal Staff
             </button>
          </div>
          <a href="tel:7873682880" className="flex items-center justify-center gap-2 w-full py-3 bg-[#00aed9]/10 text-[#00aed9] rounded-xl text-sm font-bold hover:bg-[#00aed9] hover:text-white transition-all">
            <Phone size={16} /> Soporte Richard
          </a>
        </div>
      </nav>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth">
        <Routes>
            <Route path="/" element={
                <Storefront 
                    inventory={inventory} 
                    initialVisualSearch={pendingVisualSearch} 
                    onClearVisualSearch={() => setPendingVisualSearch(null)}
                    onMagicFix={handleMagicFix}
                    onOpenGarage={() => navigate('/garage')} 
                />
            } />
            <Route path="/garage" element={<AuthGuard><DigitalGarage inventory={inventory} onExit={() => navigate('/')} /></AuthGuard>} />
            <Route path="/qualify" element={<PreQualifyView onExit={() => navigate('/')} />} />
            <Route path="/consultant" element={<AIConsultant inventory={inventory} />} />
            <Route path="/blog" element={<BlogView />} />
            <Route path="/lab" element={<AuthGuard><AILabView onExit={() => navigate('/')} onVisualSearch={(img) => { setPendingVisualSearch(img); navigate('/'); }} /></AuthGuard>} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminGuard><AdminPanel inventory={inventory} onUpdate={() => {}} onAdd={() => {}} onDelete={() => {}} onInitializeDb={() => Promise.resolve()} /></AdminGuard>} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <CookieConsent /> 
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, isAction = false, highlight = false }: any) => {
    const commonClasses = `w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${
      active 
        ? 'bg-[#00aed9] text-white shadow-xl shadow-[#00aed9]/20' 
        : highlight 
            ? 'bg-gradient-to-r from-[#173d57] to-[#00aed9] text-white border border-[#00aed9]/30 hover:shadow-lg hover:shadow-[#00aed9]/20'
            : `text-slate-400 hover:text-white hover:bg-white/5 ${isAction ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' : ''}`
    }`;

    return (
      <button onClick={onClick} className={commonClasses}>
          <span className="relative z-10 flex items-center gap-4">
              {icon}
              {label}
          </span>
      </button>
    );
};

// Fix for index.tsx error: added missing App component and default export.
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
