"use client";

import React, { useState, useMemo } from 'react';
import { Car } from '@/shared/types/types';
import { compareCars } from '@/shared/api/ai';
import { useInventoryAnalytics } from '@/features/inventory/hooks/useInventoryAnalytics';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, ShieldCheck, Cpu, Gauge, Star, Sparkles } from 'lucide-react';

interface Props {
  cars: Car[];
  onClose: () => void;
}

const ComparisonModal: React.FC<Props> = ({ cars, onClose }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const analytics = useInventoryAnalytics();

  const car1 = cars[0];
  const car2 = cars[1];

  const handleBattle = async () => {
    setLoading(true);
    try {
      analytics.trackCompare(car1.id, car2.id);
      const data = await compareCars(car1, car2);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!car1 || !car2) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
        onClick={onClose}
      />

      {/* Richard VS Arena Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-[500px] h-full bg-cyan-500/5 -skew-x-12 blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-full bg-primary/5 skew-x-12 blur-[120px]" />
      </div>

      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[120] flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 flex h-full w-full flex-col p-6 lg:p-12">
        {/* Header Protocol */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-cyan-500/30" />
              <span className="font-tech text-xs uppercase tracking-[0.5em] text-cyan-400">
                SENTINEL COMPARISON PROTOCOL
              </span>
              <div className="h-px w-12 bg-cyan-500/30" />
            </div>
            <h2 className="font-cinematic text-4xl lg:text-5xl text-white tracking-tight">
              Richard <span className="italic text-slate-500">Neural Combat</span>
            </h2>
          </motion.div>
        </div>

        {/* Binary Arena */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-0 relative">
          
          {/* Unit Alpha */}
          <UnitPanel 
            car={car1} 
            side="left" 
            isWinner={result?.winnerId === car1.id}
            isLoser={result && result.winnerId !== car1.id}
            stats={mockStats(car1)}
          />

          {/* Central Command / VS Node */}
          <div className="relative z-50 flex w-full flex-col items-center justify-center lg:w-48">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.button
                  key="battle-btn"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(0, 174, 217, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBattle}
                  className="group relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-cyan-500/50 bg-slate-900 shadow-2xl transition-all"
                >
                  <span className="font-tech text-3xl font-black italic text-white group-hover:text-cyan-400">VS</span>
                  <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin-slow" />
                </motion.button>
              ) : loading ? (
                <motion.div 
                  key="loading-node"
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative h-24 w-24">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-full w-full rounded-full border-4 border-white/5 border-t-cyan-500"
                    />
                    <Cpu className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 animate-pulse" size={32} />
                  </div>
                  <p className="font-tech text-[10px] uppercase tracking-[0.4em] text-cyan-400 animate-pulse">
                    Computing Vectors...
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="result-node"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 backdrop-blur-xl">
                    <span className="font-tech text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      Sync Complete
                    </span>
                  </div>
                  <button 
                    onClick={() => setResult(null)}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors underline underline-offset-4"
                  >
                    Reset Simulation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Unit Beta */}
          <UnitPanel 
            car={car2} 
            side="right" 
            isWinner={result?.winnerId === car2.id}
            isLoser={result && result.winnerId !== car2.id}
            stats={mockStats(car2)}
          />

        </div>

        {/* Richard's Strategic Verdict Overlay */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="mt-12 max-w-6xl mx-auto w-full z-50"
            >
              <div className="rounded-[40px] border border-white/5 bg-slate-900/60 p-10 backdrop-blur-2xl shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.5)]">
                <div className="mb-10 flex flex-col items-center text-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={16} className="text-cyan-400" />
                    <span className="font-tech text-[10px] uppercase tracking-[0.4em] text-cyan-400">
                      INTELLIGENCE HUB VERDICT
                    </span>
                  </div>
                  <p className="font-cinematic text-2xl lg:text-3xl text-white leading-tight max-w-4xl">
                    "{result.verdict}"
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {result.categories.map((cat: any, i: number) => (
                    <VerdictCard key={i} cat={cat} car1={car1} car2={car2} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const UnitPanel = ({ car, side, isWinner, isLoser, stats }: any) => {
  return (
    <motion.div 
      animate={{ 
        scale: isWinner ? 1.05 : isLoser ? 0.95 : 1,
        opacity: isLoser ? 0.4 : 1,
        filter: isLoser ? 'grayscale(1)' : 'grayscale(0)'
      }}
      className={`flex-1 flex flex-col items-center transition-all duration-700 w-full ${side === 'left' ? 'lg:pr-12' : 'lg:pl-12'}`}
    >
      <div className="relative mb-8 w-full max-w-xl group">
        <motion.img
          layoutId={`car-img-${car.id}`}
          src={car.img}
          alt={car.name}
          className={`w-full object-contain drop-shadow-[0_30px_60px_rgba(34,211,238,0.2)] ${side === 'right' ? '-scale-x-100' : ''}`}
        />
        {isWinner && (
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2"
          >
            <div className="flex flex-col items-center">
              <Trophy size={56} className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" fill="currentColor" />
              <span className="mt-2 font-tech text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Dominio Richard</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-center w-full">
        <h3 className="font-tech text-3xl font-black uppercase tracking-tight text-white mb-2">{car.name}</h3>
        <p className="font-cinematic text-2xl text-cyan-400 mb-8">${car.price.toLocaleString()}</p>
        
        {/* Simplified Radar/Stats Bar */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {stats.map((s: any, i: number) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-4 flex flex-col items-center gap-2">
              <div className="text-slate-500">{s.icon}</div>
              <span className="font-tech text-[9px] uppercase tracking-widest text-slate-400">{s.label}</span>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-cyan-500/50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const VerdictCard = ({ cat, car1, car2 }: any) => {
  const winner = cat.winnerId === car1.id ? car1 : car2;
  return (
    <div className="group relative rounded-3xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-slate-500">{cat.name}</span>
        <div className={`h-2 w-2 rounded-full ${cat.winnerId === car1.id ? 'bg-cyan-500' : 'bg-primary'}`} />
      </div>
      <div className="mb-3 font-tech text-xs font-black uppercase text-white">{winner.name}</div>
      <p className="text-xs leading-relaxed text-slate-400 italic">"{cat.reason}"</p>
    </div>
  );
};

const mockStats = (car: any) => [
  { label: 'Power', value: 75 + (car.id.length % 20), icon: <Gauge size={14} /> },
  { label: 'Aero', value: 60 + (car.name.length % 35), icon: <Sparkles size={14} /> },
  { label: 'Security', value: 90 + (car.price % 10), icon: <ShieldCheck size={14} /> },
  { label: 'Tech', value: 85 + (car.type === 'suv' ? 10 : 0), icon: <Cpu size={14} /> },
];

export default ComparisonModal;
