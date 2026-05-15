"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, CheckCircle2, ShieldCheck, Zap, MapPin, Gift } from 'lucide-react';

interface PulseEvent {
  id: string;
  type: 'sale' | 'lead' | 'view' | 'bonus' | 'inventory';
  text: string;
  location?: string;
  icon: React.ReactNode;
}

const EVENT_POOL: Omit<PulseEvent, 'id'>[] = [
  { 
    type: 'sale', 
    text: '¡Toyota Tacoma Vendida en Ponce!', 
    icon: <Zap size={14} className="text-amber-400" /> 
  },
  { 
    type: 'lead', 
    text: 'Nuevo cliente pre-cualificado (Bayamón)', 
    icon: <CheckCircle2 size={14} className="text-emerald-400" /> 
  },
  { 
    type: 'bonus', 
    text: '¡Bono de $300 reclamado hace 2 mins!', 
    icon: <Gift size={14} className="text-rose-400" /> 
  },
  { 
    type: 'inventory', 
    text: 'Añadida: Ford Raptor 2024 (Limited)', 
    icon: <Zap size={14} className="text-blue-400" /> 
  },
  { 
    type: 'view', 
    text: "12 personas viendo Ford Raptor", 
    location: "Arecibo", 
    icon: <Users className="text-cyan-400" size={16} /> 
  },
  { 
    type: 'bonus', 
    text: "Bono de $300 reclamado con éxito", 
    location: "Caguas", 
    icon: <Zap className="text-amber-400" size={16} /> 
  },
  { 
    type: 'inventory', 
    text: "Nueva unidad: Toyota Tacoma 2025", 
    location: "Bayamón", 
    icon: <TrendingUp className="text-rose-400" size={16} /> 
  },
  { 
    type: 'lead', 
    text: "Cita programada para prueba de manejo", 
    location: "Mayagüez", 
    icon: <ShieldCheck className="text-blue-400" size={16} /> 
  },
];

const SentinelPulseFeed = () => {
  const [currentEvent, setCurrentEvent] = useState<PulseEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const triggerNextEvent = () => {
      // Defer next event randomly between 10-25 seconds
      const delay = Math.floor(Math.random() * (25000 - 10000) + 10000);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * EVENT_POOL.length);
        const event = { ...EVENT_POOL[randomIndex], id: Date.now().toString() };
        
        setCurrentEvent(event);
        setIsVisible(true);

        // Hide after 6 seconds
        setTimeout(() => {
          setIsVisible(false);
          triggerNextEvent();
        }, 6000);
      }, delay);
    };

    triggerNextEvent();
  }, []);

  return (
    <div className="fixed bottom-24 left-6 z-[60] pointer-events-none hidden md:block">
      <AnimatePresence>
        {isVisible && currentEvent && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[300px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 shadow-inner">
              {currentEvent.icon}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-tech font-bold">
                Sentinel Live Pulse
              </span>
              <p className="text-sm font-medium text-slate-100 leading-tight mt-0.5">
                {currentEvent.text}
              </p>
              {currentEvent.location && (
                <div className="flex items-center gap-1 mt-1 opacity-50">
                  <MapPin size={10} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {currentEvent.location}, Puerto Rico
                  </span>
                </div>
              )}
            </div>

            <div className="ml-auto pl-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SentinelPulseFeed;
