import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Compass, ShieldCheck, User } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Inventario', icon: Compass, path: '/' },
    { label: 'Finanzas', icon: Home, path: '/financiamiento' },
    { label: 'Seguro GAP', icon: ShieldCheck, path: '/gap' },
    { label: 'Perfil', icon: User, path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border-t border-white/20 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center gap-1 w-16"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,174,217,0.3)]'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[9px] font-bold tracking-widest uppercase transition-colors duration-300 ${
                  isActive ? 'text-primary' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
