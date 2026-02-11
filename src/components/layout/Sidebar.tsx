import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { logout as logoutAction } from '@/store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Warehouse,
  FileCheck2,
  BotMessageSquare,
  Newspaper,
  Cpu,
  User,
  LogOut,
  ShieldAlert,
  LogIn,
  Car as CarIcon,
  User as UserIcon,
  Languages
} from 'lucide-react';
import { ViewMode } from '@/types/types';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const role = user?.role || 'user';

  const handleLogout = async () => {
    try {
      const { signOutUser } = await import('@/features/auth/services/authService');
      await signOutUser();
      dispatch(logoutAction());
      navigate('/');
    } catch (error) {
      console.error('Logout error', error);
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
    <nav
      className={
        'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-cyan-300/15 bg-[linear-gradient(180deg,rgba(8,20,33,0.95),rgba(7,17,27,0.95))] text-white shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:static lg:h-screen lg:translate-x-0 pointer-events-auto ' +
        (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
      }
    >
      <div className="border-b border-white/5 px-7 py-8">
        <button className="group text-left" onClick={() => navigate('/')}>
          <p className="font-cinematic text-5xl leading-[0.82] text-cyan-300 transition-colors group-hover:text-cyan-200">
            RICHARD
          </p>
          <p className="font-cinematic text-3xl tracking-[0.18em] text-slate-200">AUTOMOTIVE</p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Command Center</p>
        </button>
      </div>

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-5">
        <NavButton active={currentMode === ViewMode.STOREFRONT} onClick={() => { navigate('/'); setIsMobileOpen(false); }} icon={<ShoppingBag size={19} />} label={t('sidebar.storefront')} />
        <NavButton active={currentMode === ViewMode.DIGITAL_GARAGE} onClick={() => { navigate('/garage'); setIsMobileOpen(false); }} icon={<Warehouse size={19} />} label={t('sidebar.garage')} />
        <NavButton active={currentMode === ViewMode.PRE_QUALIFY} onClick={() => { navigate('/qualify'); setIsMobileOpen(false); }} icon={<FileCheck2 size={19} />} label={t('sidebar.qualify')} />
        <NavButton active={currentMode === ViewMode.TRADE_IN} onClick={() => { navigate('/trade-in'); setIsMobileOpen(false); }} icon={<CarIcon size={19} />} label={t('sidebar.tradeIn')} />
        <NavButton active={currentMode === ViewMode.AI_CONSULTANT} onClick={() => { navigate('/consultant'); setIsMobileOpen(false); }} icon={<BotMessageSquare size={19} />} label={t('sidebar.consultant')} />
        <NavButton active={currentMode === ViewMode.BLOG} onClick={() => { navigate('/blog'); setIsMobileOpen(false); }} icon={<Newspaper size={19} />} label={t('sidebar.blog')} />

        {role === 'admin' && (
          <NavButton active={location.pathname === '/framework-lab'} onClick={() => { navigate('/framework-lab'); setIsMobileOpen(false); }} icon={<Cpu size={19} />} label={t('sidebar.frameworkLab')} />
        )}
        {role === 'admin' && (
          <NavButton active={currentMode === ViewMode.DIGITAL_TWIN} onClick={() => { navigate('/digital-twin'); setIsMobileOpen(false); }} icon={<User size={19} />} label={t('sidebar.digitalTwin')} />
        )}

        <div className="my-3 border-t border-white/10" />

        {user ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20">
            <button
              onClick={() => navigate('/profile')}
              className="group mb-3 flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 text-white">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase tracking-[0.04em] text-white group-hover:text-cyan-200">
                  {user.displayName || user.email}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                  {role === 'admin' ? 'Administrador' : 'Editar Perfil'}
                </p>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 p-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-rose-300 transition-colors hover:bg-rose-500/20"
              >
                <LogOut size={13} /> {t('auth.logout')}
              </button>
              {role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-300 transition-colors hover:bg-cyan-500/20"
                >
                  <ShieldAlert size={13} /> {t('common.admin')}
                </button>
              )}
            </div>
          </div>
        ) : (
          <NavButton active={false} onClick={() => { navigate('/login'); setIsMobileOpen(false); }} icon={<LogIn size={19} />} label={t('auth.login')} isAction />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/15 px-5 py-4">
        <ThemeToggle />
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
          className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-white/10"
        >
          <Languages size={14} />
          {i18n.language === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isAction?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, isAction = false }) => {
  const base = 'group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200';
  const stateClass = active
    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-[0_12px_25px_-14px_rgba(0,174,217,0.7)]'
    : isAction
      ? 'border border-cyan-300/25 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
      : 'text-slate-300 hover:bg-white/8 hover:text-white';

  return (
    <button onClick={onClick} className={`${base} ${stateClass}`}>
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 text-sm font-bold tracking-wide">{label}</span>
      {active && <span className="absolute right-2 h-2 w-2 rounded-full bg-white/90" />}
    </button>
  );
};

export default Sidebar;
