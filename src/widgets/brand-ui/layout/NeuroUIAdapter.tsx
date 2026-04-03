'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHoustonResponder } from '@/shared/lib/events/useHoustonResponder';
import { HoustonEventType } from '@/shared/lib/events/HoustonBus';
import { ScoreInsight } from '@/features/predictive/model/TrajectoryAnalyzer';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export const NeuroUIAdapter: React.FC = () => {
  const [activeInsight, setActiveInsight] = useState<ScoreInsight | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Reaccionar a señales de alta intención
  useHoustonResponder<ScoreInsight>(
    HoustonEventType.PREDICTIVE_HIGH_INTENT,
    (insight) => {
      setActiveInsight(insight);
      setIsVisible(true);
      // Auto-ocultar después de 10 segundos
      setTimeout(() => setIsVisible(false), 10000);
    }
  );

  if (!activeInsight) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-6 z-[100] max-w-sm"
        >
          <div className="glass-premium border border-cyan-500/30 p-5 rounded-2xl shadow-2xl overflow-hidden relative group">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur opacity-75 group-hover:opacity-100 transition duration-1000" />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Oportunidad VIP Detectada
                  </span>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                  title="Cerrar notificación"
                >
                  <X size={16} />
                </button>
              </div>

              <h4 className="text-white font-outfit font-bold text-lg leading-tight mb-2">
                ¿Listo para el siguiente paso?
              </h4>
              
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Notamos tu interés en <span className="text-cyan-200">{activeInsight.factors[0]}</span>. 
                Richard puede darte una oferta personalizada ahora mismo.
              </p>

              <button 
                onClick={() => window.open('https://wa.me/17873682880', '_blank')}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/40"
              >
                Hablar con Richard <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
