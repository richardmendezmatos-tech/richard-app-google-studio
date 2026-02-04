
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout as logoutAction } from '@/store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import { ShoppingBag, Warehouse, FileCheck2, BotMessageSquare, Newspaper, Cpu, User, LogOut, ShieldAlert, FlaskConical, LogIn, Car as CarIcon, User as UserIcon } from 'lucide-react';
import { ViewMode } from '@/types/types';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'user';

  const handleLogout = async () => {
    try {
      const { signOutUser } = await import('@/features/auth/services/authService');
      await signOutUser();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error("Logout error", error);
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
    if (path === '/digital-twin') return ViewMode.DIGITAL_TWIN;
    if (path === '/framework-lab') return 'framework-lab';
    if (path.startsWith('/login')) return 'login';
    return ViewMode.STOREFRONT;
  };

  const currentMode = getCurrentViewMode();

  return (
    <nav className={"fixed inset-y-0 left-0 w-72 bg-[#173d57]/95 dark:bg-[#0d2232]/95 backdrop-blur-2xl border-r border-white/5 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen pointer-events-auto " + (isMobileOpen ? 'translate-x-0' : '-translate-x-full')}>
      <div className="p-10 flex justify-between items-center cursor-pointer group" onClick={() => navigate('/')}>
        <h1 className="text-3xl font-black tracking-tighter leading-none group-hover:scale-105 transition-transform">
          <span className="text-[#00aed9]">RICHARD</span>
          <br />AUTOMOTIVE
        </h1>
      </div>

      <div className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <NavButton active={currentMode === ViewMode.STOREFRONT} onClick={() => { navigate('/'); setIsMobileOpen(false); }} icon={<ShoppingBag size={20} />} label="Tienda Digital" />
        <NavButton active={currentMode === ViewMode.DIGITAL_GARAGE} onClick={() => { navigate('/garage'); setIsMobileOpen(false); }} icon={<Warehouse size={20} />} label="Mi Garaje" />
        <NavButton active={currentMode === ViewMode.PRE_QUALIFY} onClick={() => { navigate('/qualify'); setIsMobileOpen(false); }} icon={<FileCheck2 size={20} />} label="Pre-Cualificación" />
        <NavButton active={currentMode === ViewMode.TRADE_IN} onClick={() => { navigate('/trade-in'); setIsMobileOpen(false); }} icon={<CarIcon size={20} />} label="Vender mi Auto" />
        <NavButton active={currentMode === ViewMode.AI_CONSULTANT} onClick={() => { navigate('/consultant'); setIsMobileOpen(false); }} icon={<BotMessageSquare size={20} />} label="Consultor IA" />
        <NavButton active={currentMode === ViewMode.BLOG} onClick={() => { navigate('/blog'); setIsMobileOpen(false); }} icon={<Newspaper size={20} />} label="AI Newsroom" />

        {role === 'admin' && (
          <NavButton active={location.pathname === '/framework-lab'} onClick={() => { navigate('/framework-lab'); setIsMobileOpen(false); }} icon={<Cpu size={20} className="text-cyan-400" />} label="Framework Lab" />
        )}
        {role === 'admin' && (
          <NavButton active={currentMode === ViewMode.DIGITAL_TWIN} onClick={() => { navigate('/digital-twin'); setIsMobileOpen(false); }} icon={<User size={20} />} label="Gemelo Digital" />
        )}

        <div className="pt-4 my-2 border-t border-white/5" />

        {/* User Profile Section */}
        {user ? (
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 mb-3 cursor-pointer group hover:bg-white/10 p-2 rounded-xl transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00aed9] to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black truncate text-white uppercase tracking-tight group-hover:text-[#00aed9] transition-colors">{user.displayName || user.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-[#00aed9] font-black">{role === 'admin' ? 'Administrador' : 'Editar Perfil'}</p>
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
          <NavButton active={false} onClick={() => { navigate('/login'); setIsMobileOpen(false); }} icon={<LogIn size={20} />} label="Iniciar Sesión" isAction />
        )}


      </div>

      <div className="p-6 border-t border-white/5 bg-black/10 backdrop-blur-md">
        <ThemeToggle />
      </div>
    </nav>
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

export default Sidebar;
