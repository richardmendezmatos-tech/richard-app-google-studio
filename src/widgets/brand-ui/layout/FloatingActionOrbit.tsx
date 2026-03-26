import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, Phone, X, Zap } from 'lucide-react';

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
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      {/* Backdrop for focus when Orbit is open */}
      <AnimatePresence>
        {isOpen && !activeWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none z-[-1]"
          />
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        {/* Widget Containers */}
        <AnimatePresence mode="wait">
          {activeWidget === 'chat' && (
            <motion.div
              key="chat-box"
              initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(20px)' }}
              className="absolute bottom-24 right-0"
            >
              <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-3xl overflow-hidden ring-1 ring-white/10">
                {chatWidget}
              </div>
            </motion.div>
          )}

          {activeWidget === 'voice' && (
            <motion.div
              key="voice-box"
              initial={{ opacity: 0, y: 30, scale: 0.8, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 30, scale: 0.8, filter: 'blur(20px)' }}
              className="absolute bottom-24 right-0"
            >
              {voiceWidget}
            </motion.div>
          )}

          {activeWidget === 'whatsapp' && (
            <motion.div
              key="whatsapp-box"
              initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(20px)' }}
              className="absolute bottom-24 right-0"
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
          className={`relative z-50 w-18 h-18 rounded-full flex items-center justify-center transition-all duration-700 ${
            isOpen || activeWidget
              ? 'bg-cyan-500 shadow-[0_0_40px_rgba(0,229,255,0.6)]'
              : 'glass-premium border-2 border-cyan-400/20 text-cyan-400 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(0,174,217,0.1)]'
          }`}
        >
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
