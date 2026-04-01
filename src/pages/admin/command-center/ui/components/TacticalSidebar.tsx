import React, { useState } from 'react';
import { useNavigate, useLocation } from '@/shared/lib/next-route-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CarFront,
  Activity,
  BarChart3,
  Newspaper,
  Users,
  Zap,
  Settings,
  LogOut,
  ShieldCheck,
  LayoutGrid,
} from 'lucide-react';
import { useAuthStore } from '@/entities/session';

export const TacticalSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: CarFront, label: 'Inventario', path: '/admin/inventory' },
    { icon: Activity, label: 'Pipeline', path: '/admin/pipeline' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Newspaper, label: 'Newsroom', path: '/admin/newsroom' },
    { icon: Users, label: 'Audiencias', path: '/admin/audiences' },
    { icon: Zap, label: 'Strategy', path: '/strategy-lab' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        onHoverStart={() => setIsCollapsed(false)}
        onHoverEnd={() => setIsCollapsed(true)}
        animate={{ width: isCollapsed ? 80 : 240 }}
        className="fixed left-4 top-4 bottom-4 bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-[100] p-3 shadow-2xl overflow-hidden hidden md:flex md:flex-col"
      >
        {/* Brand/Logo Section */}
        <div className="flex items-center gap-4 px-3 py-6 mb-8 group/logo cursor-pointer overflow-hidden">
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] flex-shrink-0 transition-transform group-hover/logo:rotate-12">
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="text-[10px] font-black text-white leading-none uppercase tracking-tighter">
                  Richard
                </span>
                <span className="text-[10px] font-black text-primary leading-none uppercase tracking-widest">
                  Sentinel 3.2
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-2 overflow-hidden">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative group flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-white'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <item.icon
                    size={20}
                    className={
                      isActive ? 'text-primary' : 'group-hover:scale-110 transition-transform'
                    }
                  />
                </div>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings / Logout */}
        <div className="mt-auto flex flex-col gap-2 border-t border-white/5 pt-4 overflow-hidden">
          <button
            onClick={() => navigate('/admin/settings')}
            className="relative group flex items-center gap-4 w-full p-4 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Config</span>
            )}
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="relative group flex items-center gap-4 w-full p-4 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit</span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation (Native App Style) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] z-[100] flex items-center justify-around px-2 shadow-2xl md:hidden">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 group relative flex-1 h-full rounded-2xl transition-all ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`}
            >
              <item.icon
                size={isActive ? 22 : 20}
                className={`transition-all duration-300 ${isActive ? 'scale-110' : 'group-active:scale-90'}`}
              />
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                {item.label.split(' ')[0]}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-active-pill"
                  className="absolute inset-x-2 -bottom-1 h-1 bg-primary rounded-full shadow-[0_0_10px_#22d3ee]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
