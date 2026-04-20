'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Server, BarChart3, Clock } from 'lucide-react';

interface HealthMetric {
  label: string;
  value: string | number;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const BusinessHealthWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    { label: 'Edge Latency', value: '42ms', status: 'optimal', trend: 'down', icon: <Zap className="w-4 h-4" /> },
    { label: 'API Uptime', value: '99.98%', status: 'optimal', trend: 'stable', icon: <Server className="w-4 h-4" /> },
    { label: 'Security WAF', value: 'Active', status: 'optimal', trend: 'stable', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Business ROI', value: '14.2x', status: 'optimal', trend: 'up', icon: <BarChart3 className="w-4 h-4" /> },
  ]);

  // Simulación de telemetría en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.label === 'Edge Latency') {
          const newVal = Math.floor(Math.random() * (48 - 38 + 1) + 38);
          return { ...m, value: `${newVal}ms` };
        }
        return m;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="glass-premium hud-brackets p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="scanline-overlay" />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
            <Activity className="w-4 h-4 animate-pulse" />
            System Vitality
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
            Sentinel N23 • Real-Time Diagnostics
          </p>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl hover:bg-white/[0.06] transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                {metric.icon}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{metric.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black tabular-nums tracking-tight" style={{ fontFamily: 'var(--font-cinematic)' }}>
                {metric.value}
              </span>
              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                metric.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 
                metric.trend === 'down' ? 'text-cyan-400 bg-cyan-500/10' : 
                'text-slate-400 bg-slate-500/10'
              }`}>
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '•'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-widest font-black">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Last Full Sync: Just Now
          </span>
          <span className="text-cyan-500/80">All Systems Nominal</span>
        </div>
        <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
            animate={{ 
              width: ['95%', '98%', '96%', '99%'],
              opacity: [0.6, 1, 0.8, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};
