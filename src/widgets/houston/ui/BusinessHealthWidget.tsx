"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, ArrowUpRight, Zap } from 'lucide-react';
import { leadService } from '@/entities/lead';
import { useDealer } from '@/entities/dealer';

interface HealthMetrics {
  leadVelocity: number;       // leads per hour (from SQL)
  avgAiScore: number;         // 0-100 from closureProbability avg
  conversionRate: number;     // % closes based on SQL data
  isLoading: boolean;
}

export const BusinessHealthWidget: React.FC = () => {
  const { currentDealer } = useDealer();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    leadVelocity: 0,
    avgAiScore: 0,
    conversionRate: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const dealerId = currentDealer?.id || 'richard-automotive';
        const [leads] = await Promise.all([
          leadService.fetchLeads(dealerId),
        ]);

        const total = leads?.length || 0;

        // Calculate avg AI score from closureProbability
        const avgScore = total > 0
          ? Math.round(leads.reduce((sum: number, l: any) => sum + (l.closureProbability || 0), 0) / total)
          : 0;

        // Conversion rate: leads with status closed or dealClosed true
        const closed = leads?.filter((l: any) => l.dealClosed || l.status === 'closed').length || 0;
        const convRate = total > 0 ? Math.round((closed / total) * 100) : 0;

        // Lead velocity: leads in last 24h
        const now = Date.now();
        const recentLeads = leads?.filter((l: any) => {
          const ts = l.timestamp?.toMillis ? l.timestamp.toMillis() : new Date(l.timestamp || 0).getTime();
          return now - ts <= 24 * 60 * 60 * 1000;
        }).length || 0;

        setMetrics({
          leadVelocity: recentLeads,
          avgAiScore: avgScore,
          conversionRate: convRate,
          isLoading: false,
        });
      } catch (err) {
        console.error('[BusinessHealthWidget] Failed to load metrics:', err);
        setMetrics(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchMetrics();
  }, [currentDealer?.id]);

  const statItems = [
    {
      icon: <Zap size={14} className="text-cyan-500" />,
      label: 'Lead Velocity',
      value: metrics.leadVelocity,
      suffix: '/ 24h',
      color: 'text-cyan-400',
      barColor: 'bg-cyan-500',
      barPct: Math.min(100, metrics.leadVelocity * 5),
    },
    {
      icon: <TrendingUp size={14} className="text-emerald-500" />,
      label: 'AI Score Prom.',
      value: metrics.avgAiScore,
      suffix: '%',
      color: 'text-emerald-400',
      barColor: 'bg-emerald-500 shadow-[0_0_10px_#10b981]',
      barPct: metrics.avgAiScore,
    },
    {
      icon: <Target size={14} className="text-cyan-500" />,
      label: 'Lead Conversion',
      value: metrics.conversionRate,
      suffix: '%',
      color: 'text-white',
      barColor: 'bg-indigo-500',
      barPct: metrics.conversionRate,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium p-8 border border-white/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
        <Target size={80} className="text-cyan-500" />
      </div>

      <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
        <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] animate-pulse" />
        Business Velocity
        {!metrics.isLoading && (
          <span className="ml-auto text-[8px] text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-lg bg-emerald-500/5 tracking-widest">
            SQL LIVE
          </span>
        )}
      </h3>

      {metrics.isLoading ? (
        <div className="flex items-center justify-center h-24 gap-3">
          <div className="w-5 h-5 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">
            Fetching SQL Data...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((stat) => (
            <div key={stat.label} className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500 uppercase font-black text-[9px] tracking-widest">
                {stat.icon} {stat.label}
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-4xl font-black text-white tracking-tighter`}>
                  {stat.value}
                </span>
                <span className={`${stat.color} font-black text-sm mb-1.5 flex items-center gap-1`}>
                  <ArrowUpRight size={12} />
                  {stat.suffix}
                </span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.barPct}%` }}
                  transition={{ duration: 1.2, ease: 'circOut' }}
                  className={`h-full ${stat.barColor}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
            Source: <span className="text-white">DataConnect SQL</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
            Predictive Mode: <span className="text-emerald-400">On</span>
          </div>
        </div>
        <button
          onClick={() => window.location.href = '/admin'}
          className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          Deep Analysis →
        </button>
      </div>
    </motion.div>
  );
};
