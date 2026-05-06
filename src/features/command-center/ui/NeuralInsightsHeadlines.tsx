"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, TrendingUp, AlertCircle, Zap } from 'lucide-react';

export const NeuralInsightsHeadlines: React.FC = () => {
  const insights = [
    {
      icon: TrendingUp,
      text: 'Momentum alto en SUVs; 12 nuevos leads en las últimas 4h.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Zap,
      text: "Richard IA sugiere potenciar 'Toyota Tacoma' para el fin de semana.",
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: AlertCircle,
      text: '3 Tasaciones pendientes de revisión urgente.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-4 p-4 rounded-2xl ${insight.bg} border border-white/5 group hover:border-white/10 transition-all`}
        >
          <div className={`p-2 rounded-lg ${insight.bg} border border-white/5`}>
            <insight.icon size={16} className={insight.color} />
          </div>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight leading-tight">
            {insight.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
