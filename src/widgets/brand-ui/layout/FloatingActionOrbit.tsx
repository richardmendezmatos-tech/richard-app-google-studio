import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mic, Phone, X, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface FloatingActionOrbitProps {
  activeWidget: 'chat' | 'voice' | 'whatsapp' | null;
  onWidgetSelect: (widget: 'chat' | 'voice' | 'whatsapp' | null) => void;
  chatWidget: React.ReactNode;
  voiceWidget: React.ReactNode;
  whatsappWidget: React.ReactNode;
}

export const FloatingActionOrbit: React.FC<FloatingActionOrbitProps> = ({
  activeWidget,
  onWidgetSelect,
  chatWidget,
  voiceWidget,
  whatsappWidget,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const location = useLocation();

  // Proactive entry: Pulse after 2s if no widget is active
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPulseActive(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getLabelForPath = () => {
    if (location.pathname.includes('/vehicle/')) return '¿TE GUSTA ESTE AUTO?';
    if (location.pathname.includes('/store')) return 'MIRA NUESTRO STOCK';
    if (location.pathname.includes('/financiamiento')) return 'CALCULA TU CUOTA';
    return 'CENTRO DE MANDO';
  };

  const handleMainClick = useCallback(() => {
    if (activeWidget) {
      onWidgetSelect(null);
    } else {
      setIsOpen(!isOpen);
    }
  }, [activeWidget, isOpen, onWidgetSelect]);

  const orbitItems = [
    { id: 'chat' as const, icon: <MessageSquare size={20} />, label: 'RICHARD CHAT' },
    { id: 'voice' as const, icon: <Mic size={20} />, label: 'COMANDO VOZ' },
    { id: 'whatsapp' as const, icon: <Phone size={20} />, label: 'WHATSAPP DIRECT' },
  ];

  return (
    <div className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-[999] flex flex-col items-end gap-4 pointer-events-none">
      {/* Backdrop for focus when Orbit is open */}
      <AnimatePresence>
        {isOpen && !activeWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 pointer-events-none z-[-1]"
          />
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        {/* Widget Containers */}
        <AnimatePresence mode="wait">
          {activeWidget === 'chat' && (
            <motion.div
              key="chat-box"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="absolute bottom-24 right-0 will-change-transform"
            >
              <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden ring-1 ring-white/10">
                {chatWidget}
              </div>
            </motion.div>
          )}

          {activeWidget === 'voice' && (
            <motion.div
              key="voice-box"
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.85 }}
              className="absolute bottom-24 right-0 will-change-transform"
            >
              {voiceWidget}
            </motion.div>
          )}

          {activeWidget === 'whatsapp' && (
            <motion.div
              key="whatsapp-box"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="absolute bottom-24 right-0 will-change-transform"
            >
              <div className="shadow-[0_20px_60px_-15px_rgba(37,211,102,0.3)] rounded-3xl overflow-hidden ring-1 ring-white/10">
                {whatsappWidget}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orbit Menu Items */}
        <AnimatePresence>
          {isOpen && !activeWidget && (
            <>
              {orbitItems.map((item, index) => {
                const angle = (index * (360 / orbitItems.length) - 90) * (Math.PI / 180);
                const x = Math.cos(angle) * 110;
                const y = Math.sin(angle) * 110;

                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      x, 
                      y, 
                      scale: 1,
                      transition: { 
                        delay: index * 0.08, 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20 
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      transition: { delay: (orbitItems.length - index) * 0.05 }
                    }}
                    onClick={() => {
                      onWidgetSelect(item.id);
                      setIsOpen(false);
                    }}
                    className="absolute flex items-center justify-center w-14 h-14 rounded-full glass-premium border border-cyan-400/30 text-cyan-400 hover:text-white hover:border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.15)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all group"
                    title={item.label}
                  >
                    {item.icon}
                    {/* Floating Label */}
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-[10px] font-cinematic px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap tracking-[0.2em] border border-cyan-500/20 text-cyan-400 pointer-events-none">
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Main Trigger Button */}
        <motion.button
          onClick={handleMainClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 group/main ${
            isOpen || activeWidget
              ? 'bg-cyan-500 shadow-[0_0_40px_rgba(0,229,255,0.6)]'
              : `glass-premium border-2 border-cyan-400/20 text-cyan-400 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(0,174,217,0.1)] ${isPulseActive && !activeWidget ? 'motion-proactive' : ''}`
          }`}
        >
          {/* Proactive Label (Tooltip from Prompt) */}
          {!isOpen && !activeWidget && (
            <div className="absolute right-20 bg-white/95 backdrop-blur-md text-black text-[10px] font-bold px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover/main:opacity-100 transition-all duration-300 transform translate-x-4 group-hover/main:translate-x-0 whitespace-nowrap pointer-events-none tracking-wider">
              <span className="flex items-center gap-2">
                <Zap size={12} className="text-cyan-600 fill-current" />
                {getLabelForPath()}
              </span>
              {/* Arrow */}
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white/95 rotate-45" />
            </div>
          )}
          {/* Outer Pulsing Glow */}
          {(isOpen || activeWidget) && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-cyan-400/50 pointer-events-none"
            />
          )}

          <AnimatePresence mode="wait">
            {activeWidget || isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4, ease: "backOut" }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 180, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -180, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.4, ease: "backOut" }}
              >
                <Zap size={28} className="fill-current" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};
