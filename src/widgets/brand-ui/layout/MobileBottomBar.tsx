import React from 'react';
import { useNavigate, useLocation } from '@/shared/lib/next-route-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ShieldCheck, User, Calculator } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Unidades', icon: Compass, path: '/' },
    { label: 'Simulator', icon: Calculator, path: '/qualify' },
    { label: 'Protección', icon: ShieldCheck, path: '/gap' },
    { label: 'Perfil', icon: User, path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm">
      <div className="glass-liquid rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-4 py-3">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center p-2 transition-all duration-300 group"
              >
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-500 ${
                    isActive
                      ? 'bg-cyan-400/10 text-cyan-400'
                      : 'text-white/40 group-hover:text-white/60'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-active"
                      className="absolute inset-0 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                </div>
                {isActive && (
                   <motion.span 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-1 text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400"
                   >
                     _
                   </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
