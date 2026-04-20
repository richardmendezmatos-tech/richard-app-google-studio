"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from '@/shared/lib/next-route-adapter';
import { useAuthStore } from '@/entities/session';
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
  Languages,
  Monitor,
  BarChart3,
  Sparkles,
  FlaskConical,
  Radio,
  CreditCard,
  Activity,
} from 'lucide-react';
import { ViewMode } from '@/shared/types/types';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const [hasMounted, setHasMounted] = React.useState(false);
  const role = user?.role || 'user';

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      const { signOutUser } = await import('@/features/auth');
      await signOutUser();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const getCurrentViewMode = (): ViewMode | string => {
    const path = location.pathname;
    if (path.startsWith('/admin') || path === '/strategy-lab') return ViewMode.ADMIN;
    if (path === '/garage') return ViewMode.DIGITAL_GARAGE;
    if (path === '/qualify') return ViewMode.PRE_QUALIFY;
    if (path === '/consultant') return ViewMode.AI_CONSULTANT;
    if (path === '/blog') return ViewMode.BLOG;
    if (path === '/trade-in') return ViewMode.TRADE_IN;
    if (path === '/lab') return ViewMode.AI_LAB;
    if (path === '/framework-lab') return 'framework-lab';
    if (path.startsWith('/login')) return 'login';
    return ViewMode.STOREFRONT;
  };

  const currentMode = getCurrentViewMode();

  return (
    <nav
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 text-white shadow-2xl transition-all duration-700 ease-in-out lg:relative lg:translate-x-0 lg:h-screen pointer-events-auto glass-liquid !bg-[#051421] ${
        isCollapsed ? 'lg:w-[88px]' : 'lg:w-[300px]'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div
        className={`relative border-b border-white/5 px-7 py-10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        <button className="group text-left overflow-hidden" onClick={() => navigate('/')}>
          {!isCollapsed ? (
            <div className="relative">
              <p className="font-cinematic text-5xl leading-[0.82] text-white transition-all group-hover:text-primary group-hover:drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                RICHARD
              </p>
              <p className="font-cinematic text-3xl tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors uppercase">AUTOMOTIVE</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                  COMMAND CENTER
                </p>
              </div>
            </div>
          ) : (
            <div className="relative group/logo">
              <p className="font-cinematic text-5xl text-primary drop-shadow-[0_0_10px_rgba(0,229,255,0.3)] group-hover/logo:scale-110 transition-transform">R</p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary animate-ping" />
            </div>
          )}
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`absolute -right-3.5 top-12 hidden lg:flex h-7 w-7 items-center justify-center rounded-xl border border-white/20 bg-[#0a1929] text-primary shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:scale-110 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] active:scale-95 ${isCollapsed ? 'rotate-180' : ''}`}
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            <Cpu size={14} className="animate-pulse" />
          </button>
        )}
      </div>

      <div
        className={`custom-scrollbar flex-1 space-y-2 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'} py-5`}
      >
        <NavButton
          active={currentMode === ViewMode.STOREFRONT}
          onClick={() => {
            navigate('/');
            setIsMobileOpen(false);
          }}
          onMouseEnter={() => import('@/pages/storefront/ui/Storefront').catch(() => {})}
          icon={<ShoppingBag size={19} />}
          label={t('sidebar.storefront')}
          isCollapsed={isCollapsed}
          hasMounted={hasMounted}
        />
        <NavButton
          active={currentMode === ViewMode.DIGITAL_GARAGE}
          onClick={() => {
            navigate('/garage');
            setIsMobileOpen(false);
          }}
          onMouseEnter={() => import('@/pages/digital-garage/ui/DigitalGaragePage').catch(() => {})}
          icon={<Warehouse size={19} />}
          label={t('sidebar.garage')}
          isCollapsed={isCollapsed}
          hasMounted={hasMounted}
        />
        <NavButton
          active={currentMode === ViewMode.PRE_QUALIFY}
          onClick={() => {
            navigate('/qualify');
            setIsMobileOpen(false);
          }}
          onMouseEnter={() => import('@/pages/leads/ui/PreQualifyView').catch(() => {})}
          icon={<FileCheck2 size={19} />}
          label={t('sidebar.qualify')}
          isCollapsed={isCollapsed}
          hasMounted={hasMounted}
        />
        <NavButton
          active={currentMode === ViewMode.TRADE_IN}
          onClick={() => {
            navigate('/trade-in');
            setIsMobileOpen(false);
          }}
          onMouseEnter={() => import('@/pages/leads/ui/TradeInView').catch(() => {})}
          icon={<CarIcon size={19} />}
          label={t('sidebar.tradeIn')}
          isCollapsed={isCollapsed}
          hasMounted={hasMounted}
        />
        <NavButton
          active={currentMode === ViewMode.AI_CONSULTANT}
          onClick={() => {
            navigate('/consultant');
            setIsMobileOpen(false);
          }}
          onMouseEnter={() => import('@/widgets/ai-chat/AIConsultant').catch(() => {})}
          icon={<BotMessageSquare size={19} />}
          label={t('sidebar.consultant')}
          isCollapsed={isCollapsed}
          hasMounted={hasMounted}
        />
        <NavButton
          active={currentMode === ViewMode.BLOG}
          onClick={() => {
            navigate('/blog');
            setIsMobileOpen(false);
          }}
          onMouseEnter={() => import('@/pages/blog/ui/BlogPage').catch(() => {})}
          icon={<Newspaper size={19} />}
          label={t('sidebar.blog')}
          isCollapsed={isCollapsed}
          hasMounted={hasMounted}
        />

        {currentMode === ViewMode.ADMIN && (
          <>
            <div className="my-3 border-t border-white/5 opacity-50" />
            <p
              className={`mb-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary ${isCollapsed ? 'text-center' : ''}`}
            >
              {!isCollapsed ? 'Operaciones' : 'OPS'}
            </p>
            <NavButton
              active={location.pathname === '/admin'}
              onClick={() => {
                navigate('/admin');
                setIsMobileOpen(false);
              }}
              onMouseEnter={() =>
                import('@/features/command-center/legacy/MissionControlDashboard').catch(() => {})
              }
              icon={<Monitor size={19} />}
              label="Mission Control"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={
                location.pathname === '/admin/inventory' || location.pathname === '/admin/intake'
              }
              onClick={() => {
                navigate('/admin/inventory');
                setIsMobileOpen(false);
              }}
              onMouseEnter={() =>
                import('@/features/command-center/legacy/SentinelInventoryTab').catch(() => {})
              }
              icon={<Warehouse size={19} />}
              label="Unidades"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={location.pathname === '/admin/pipeline'}
              onClick={() => {
                navigate('/admin/pipeline');
                setIsMobileOpen(false);
              }}
              onMouseEnter={() =>
                import('@/features/command-center/legacy/CRMBoard').catch(() => {})
              }
              icon={<Activity size={19} />}
              label="CRM Leads"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={location.pathname === '/admin/newsroom'}
              onClick={() => {
                navigate('/admin/newsroom');
                setIsMobileOpen(false);
              }}
              onMouseEnter={() => import('@/pages/admin/newsroom/ui/NewsroomPage').catch(() => {})}
              icon={<Newspaper size={19} />}
              label="Newsroom"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={location.pathname === '/admin/audiences'}
              onClick={() => {
                navigate('/admin/audiences');
                setIsMobileOpen(false);
              }}
              onMouseEnter={() =>
                import('@/pages/admin/audiences/ui/AudiencesView').catch(() => {})
              }
              icon={<UserIcon size={19} />}
              label="Audiencias"
              isCollapsed={isCollapsed}
            />

            <div className="my-3 border-t border-white/5 opacity-50" />
            <p
              className={`mb-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-purple-400 ${isCollapsed ? 'text-center' : ''}`}
            >
              {!isCollapsed ? 'Inteligencia IA' : 'AI'}
            </p>
            <NavButton
              active={location.pathname === '/admin/copilot'}
              onClick={() => {
                navigate('/admin/copilot');
                setIsMobileOpen(false);
              }}
              icon={<Sparkles size={19} />}
              label="Sales Copilot"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={location.pathname === '/admin/analytics'}
              onClick={() => {
                navigate('/admin/analytics');
                setIsMobileOpen(false);
              }}
              icon={<BarChart3 size={19} />}
              label="Analytics"
              isCollapsed={isCollapsed}
            />

            <div className="my-3 border-t border-white/5 opacity-50" />
            <p
              className={`mb-2 px-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ${isCollapsed ? 'text-center' : ''}`}
            >
              {!isCollapsed ? 'Configuración' : 'CFG'}
            </p>
            <NavButton
              active={location.pathname === '/admin/billing'}
              onClick={() => {
                navigate('/admin/billing');
                setIsMobileOpen(false);
              }}
              icon={<CreditCard size={19} />}
              label="Facturación"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={location.pathname === '/admin/telemetry'}
              onClick={() => {
                navigate('/admin/telemetry');
                setIsMobileOpen(false);
              }}
              icon={<Radio size={19} />}
              label="Terminal"
              isCollapsed={isCollapsed}
            />
            <NavButton
              active={location.pathname === '/admin/lab'}
              onClick={() => {
                navigate('/admin/lab');
                setIsMobileOpen(false);
              }}
              icon={<FlaskConical size={19} />}
              label="Laboratorio"
              isCollapsed={isCollapsed}
              hasMounted={hasMounted}
            />
          </>
        )}

        {role === 'admin' && (
          <NavButton
            active={location.pathname === '/framework-lab'}
            onClick={() => {
              navigate('/framework-lab');
              setIsMobileOpen(false);
            }}
            icon={<Cpu size={19} />}
            label={t('sidebar.frameworkLab')}
          />
        )}
        {role === 'admin' && (
          <NavButton
            active={location.pathname === '/strategy-lab'}
            onClick={() => {
              navigate('/strategy-lab');
              setIsMobileOpen(false);
            }}
            icon={<FlaskConical size={19} />}
            label={t('sidebar.digitalTwin')}
            hasMounted={hasMounted}
          />
        )}

        <div className="my-3 border-t border-white/10" />

        {user ? (
          <div
            className={`rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-black/20 ${isCollapsed ? 'p-1' : 'p-4'}`}
          >
            <button
              onClick={() => navigate('/profile')}
              className={`group flex w-full items-center rounded-xl transition-colors hover:bg-white/10 ${isCollapsed ? 'justify-center p-2' : 'mb-3 gap-3 p-2 text-left'}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-cyan-700 text-white">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                  />
                ) : (
                  <UserIcon size={18} />
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-black uppercase tracking-[0.04em] text-white group-hover:text-cyan-200">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                    {role === 'admin' ? 'Administrador' : 'Editar Perfil'}
                  </p>
                </div>
              )}
            </button>

            {!isCollapsed ? (
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
            ) : (
              <div className="flex flex-col gap-2 p-1">
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                  title={t('auth.logout')}
                >
                  <LogOut size={14} />
                </button>
                {role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    title={t('common.admin')}
                  >
                    <ShieldAlert size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <NavButton
            active={false}
            onClick={() => {
              navigate('/login');
              setIsMobileOpen(false);
            }}
            icon={<LogIn size={19} />}
            label={t('auth.login')}
            isAction
            isCollapsed={isCollapsed}
            hasMounted={hasMounted}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/15 px-5 py-4">
        <ThemeToggle />
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
          className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:bg-white/10"
        >
          <Languages size={14} />
          {!hasMounted ? 'EN' : i18n.language === 'es' ? 'EN' : 'ES'}
        </button>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  icon: React.ReactNode;
  label: string;
  isAction?: boolean;
  isCollapsed?: boolean;
  hasMounted?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  onMouseEnter,
  icon,
  label,
  isAction = false,
  isCollapsed = false,
  hasMounted = false,
}) => {
  const base = `group relative flex w-full items-center transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isCollapsed ? 'justify-center px-0 py-3.5 rounded-2xl' : 'gap-3 rounded-2xl px-4 py-3.5 text-left'}`;
  const stateClass = active
    ? 'bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10'
    : isAction
      ? 'border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20'
      : 'text-slate-400 hover:bg-white/5 hover:text-white';

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`${base} ${stateClass}`}
      aria-current={active ? 'page' : undefined}
      title={isCollapsed ? label : undefined}
    >
      <span className={`relative z-10 shrink-0 transition-transform duration-500 ${active ? 'scale-110 glow-active-cyan' : 'group-hover:scale-110'}`}>{icon}</span>
      {!isCollapsed && hasMounted && (
        <span className={`relative z-10 text-xs font-bold tracking-widest uppercase truncate transition-all duration-500 ${active ? 'text-white translate-x-1' : 'text-slate-400 group-hover:text-white'}`}>{label}</span>
      )}
      {active && (
        <motion.span
          layoutId="sidebar-active-pill"
          className={`${isCollapsed ? 'absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'absolute left-0 h-6 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]'}`}
        />
      )}
    </button>
  );
};

export default Sidebar;
