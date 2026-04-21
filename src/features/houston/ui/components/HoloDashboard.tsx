'use client';
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Activity, Cpu } from 'lucide-react';

interface Props {
  leadsCount?: number;
  inventoryHealth?: number;
  aiConfidence?: number;
}

export const HoloDashboard: React.FC<Props> = ({ 
  leadsCount = 42, 
  inventoryHealth = 94, 
  aiConfidence = 98 
}) => {
  const circles = useMemo(() => Array.from({ length: 3 }), []);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-slate-950/20 border border-white/5 hud-brackets shadow-[inset_0_0_100px_rgba(0,242,255,0.05)]">
      {/* Background Grid Intelligence */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      {/* Animated Orbital Rings (CSS 3D simulation) */}
      <div className="relative w-96 h-96 flex items-center justify-center">
        {circles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ rotate: 0, scale: 0.8 + i * 0.1 }}
            animate={{ 
              rotate: 360,
              scale: [0.8 + i * 0.1, 0.9 + i * 0.1, 0.8 + i * 0.1]
            }}
            transition={{ 
              rotate: { duration: 20 + i * 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 border border-cyan-500/10 rounded-full"
            style={{ 
              borderStyle: i === 1 ? 'dashed' : 'solid',
              boxShadow: i === 0 ? '0 0 40px rgba(6,182,212,0.05)' : 'none'
            }}
          />
        ))}

        {/* Central Core */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="relative w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-2xl rounded-full border border-cyan-500/30 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(6,182,212,0.2)]"
        >
          <div className="absolute inset-0 bg-cyan-400/5 rounded-full animate-ping" />
          <Cpu className="text-cyan-400 mb-2" size={32} />
          <span className="text-[8px] font-black text-cyan-400 uppercase tracking-[0.4em]">Neural Core</span>
          <span className="text-2xl font-black text-white italic tracking-tighter mt-1">{aiConfidence}%</span>
        </motion.div>

        {/* Floating Data Nodes */}
        <FloatingNode 
          icon={<Shield size={14} />} 
          label="Secure" 
          value="RSA-2048" 
          angle={45} 
          delay={0}
        />
        <FloatingNode 
          icon={<Zap size={14} />} 
          label="Response" 
          value="140ms" 
          angle={135} 
          delay={1}
        />
        <FloatingNode 
          icon={<Target size={14} />} 
          label="Precision" 
          value="99.2%" 
          angle={225} 
          delay={2}
        />
        <FloatingNode 
          icon={<Activity size={14} />} 
          label="Uptime" 
          value="99.99%" 
          angle={315} 
          delay={3}
        />
      </div>

      {/* Side HUD Elements */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 space-y-8 hidden lg:block">
         <HUDStat label="Leads Active" value={leadsCount} color="text-cyan-400" />
         <HUDStat label="Inventory Health" value={`${inventoryHealth}%`} color="text-emerald-400" />
      </div>

      <div className="absolute right-10 bottom-10 text-right">
         <div className="flex items-center gap-2 justify-end mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Sentinel Active</span>
         </div>
         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Puerto Rico Central Command</p>
      </div>
    </div>
  );
};

function FloatingNode({ icon, label, value, angle, delay }: { icon: any; label: string; value: string; angle: number; delay: number }) {
  const radius = 180;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;

  return (
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ 
        opacity: [0.4, 1, 0.4],
        x: [x, x + 5, x],
        y: [y, y - 5, y]
      }}
      transition={{ 
        duration: 4, 
        delay, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute p-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center min-w-[80px]"
    >
      <div className="text-cyan-400 mb-1">{icon}</div>
      <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-black text-white uppercase mt-0.5">{value}</span>
    </motion.div>
  );
}

function HUDStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</p>
      <p className={`text-2xl font-black ${color} italic tracking-tighter`}>{value}</p>
      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '80%' }}
          className={`h-full bg-current ${color}`}
        />
      </div>
    </div>
  );
}
