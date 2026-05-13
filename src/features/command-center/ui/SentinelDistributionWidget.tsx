'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Facebook, 
  Globe, 
  Instagram, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Activity,
  Sparkles
} from 'lucide-react';

interface DistributionState {
  platform: string;
  status: 'active' | 'pending' | 'error' | 'none';
  lastSync: string;
}

interface DistributionWidgetProps {
  stats?: {
    active: number;
    pending: number;
    error: number;
  };
  health?: number;
}

export const SentinelDistributionWidget: React.FC<DistributionWidgetProps> = ({ stats, health = 100 }) => {
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<{ processed: number; errors: number } | null>(null);

  const handleAutonomousCycle = async () => {
    setSyncing(true);
    setResults(null);
    try {
      const res = await fetch('/api/distribution/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResults({ processed: data.processed, errors: data.errors });
      }
    } catch (err) {
      console.error('Failed to run autonomous cycle:', err);
    } finally {
      setSyncing(false);
    }
  };

  const platforms: DistributionState[] = [
    { 
      platform: 'Facebook Marketplace', 
      status: stats?.active && stats.active > 0 ? 'active' : 'none', 
      lastSync: 'Real-time Feed' 
    },
    { 
      platform: 'ClasificadosOnline', 
      status: stats?.pending && stats.pending > 0 ? 'pending' : 'active', 
      lastSync: 'Browser Agent' 
    },
    { 
      platform: 'Instagram Shop', 
      status: 'active', 
      lastSync: 'Meta Catalog' 
    },
  ];

  return (
    <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/10 transition-all duration-500 hud-brackets">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10">
            <Share2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">Distribution Tower</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nivel 26 • Autonomous</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleAutonomousCycle}
            disabled={syncing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all group ${syncing ? 'animate-pulse' : ''}`}
            title="Ejecutar Ciclo Autónomo (Neural Pitch)"
          >
            <Sparkles className={`w-3.5 h-3.5 ${syncing ? 'text-cyan-400' : 'text-cyan-400'}`} />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">Run Cycle</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Ciclo Completado</span>
            </div>
            <div className="flex gap-3 text-[10px] font-mono">
              <span className="text-slate-300">Proc: {results.processed}</span>
              <span className="text-rose-400">Err: {results.errors}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {platforms.map((p) => (
          <div key={p.platform} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] group hover:bg-white/[0.05] transition-all">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-800 border border-white/5">
                {p.platform === 'Facebook Marketplace' && <Facebook size={14} className="text-blue-400" />}
                {p.platform === 'ClasificadosOnline' && <Globe size={14} className="text-emerald-400" />}
                {p.platform === 'Instagram Shop' && <Instagram size={14} className="text-pink-400" />}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-300">{p.platform}</p>
                <div className="flex items-center gap-1.5">
                  <Clock size={8} className="text-slate-600" />
                  <span className="text-[8px] text-slate-600 uppercase font-bold">{p.lastSync}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                p.status === 'active' ? 'text-emerald-400' : p.status === 'pending' ? 'text-amber-400' : p.status === 'error' ? 'text-red-400' : 'text-slate-500'
              }`}>
                {p.status}
              </span>
              {p.status === 'active' ? (
                <CheckCircle2 size={12} className="text-emerald-500" />
              ) : p.status === 'pending' ? (
                <div className="w-2.5 h-2.5 rounded-full border border-amber-500/50 border-t-amber-500 animate-spin" />
              ) : p.status === 'error' ? (
                <AlertCircle size={12} className="text-red-500" />
              ) : (
                <Clock size={12} className="text-slate-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sync Integrity</span>
          <span className="text-[9px] text-cyan-400 font-bold">{health}%</span>
        </div>
        <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${health}%` }}
            className="h-full bg-linear-to-r from-cyan-500 to-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
