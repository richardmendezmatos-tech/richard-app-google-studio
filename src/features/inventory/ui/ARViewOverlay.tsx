'use client';
import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Box, Target, Info, ShieldCheck, X } from 'lucide-react';

interface Props {
  image: string;
  vehicleName: string;
  specs: {
    hp: number;
    torque: number;
    safety: number;
  };
  onClose: () => void;
}

export const ARViewOverlay: React.FC<Props> = ({ image, vehicleName, specs, onClose }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = (e.clientX - rect.left) / width - 0.5;
    const mouseYVal = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseXVal);
    y.set(mouseYVal);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-4"
    >
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all z-50"
      >
        <X size={24} />
      </button>

      <div 
        className="relative w-full max-w-6xl h-[80vh] flex flex-col lg:flex-row items-center gap-12"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Spatial HUD - Left */}
        <div className="hidden lg:flex flex-col gap-6 w-64">
           <HUDDataCard 
             icon={<Target className="text-cyan-400" size={16} />}
             label="Engine Output"
             value={`${specs.hp} HP`}
             subValue={`${specs.torque} lb-ft`}
           />
           <HUDDataCard 
             icon={<ShieldCheck className="text-emerald-400" size={16} />}
             label="Safety Core"
             value={`${specs.safety}/100`}
             subValue="Active Protection"
           />
        </div>

        {/* 3D Visual Center */}
        <div className="flex-grow relative perspective-1000 flex items-center justify-center">
           <motion.div
             style={{ rotateX, rotateY }}
             className="relative w-full aspect-video flex items-center justify-center"
           >
              {/* Glow Behind */}
              <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full scale-75" />
              
              <img 
                src={image} 
                alt={vehicleName}
                className="w-full h-full object-contain drop-shadow-[0_50px_100px_rgba(0,242,255,0.3)] z-10"
              />

              {/* Spatial Overlay Lines */}
              <div className="absolute inset-0 pointer-events-none z-20">
                 <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/10" />
                 <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-500/10" />
              </div>
           </motion.div>

           {/* Holographic Label */}
           <motion.div 
             className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center"
             style={{ rotateX, rotateY, translateZ: 50 }}
           >
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{vehicleName}</h2>
              <div className="flex items-center gap-2 justify-center mt-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                 <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Sentinel Vision™</span>
              </div>
           </motion.div>
        </div>

        {/* Spatial HUD - Right */}
        <div className="hidden lg:flex flex-col gap-6 w-64">
           <HUDDataCard 
             icon={<Box className="text-blue-400" size={16} />}
             label="Spatial Mapping"
             value="1:1 Ratio"
             subValue="Verified Precision"
           />
           <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] hud-brackets">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">Neural Analysis</p>
              <div className="space-y-3">
                 <ProgressBar label="Dynamics" progress={85} />
                 <ProgressBar label="Tech Core" progress={92} />
                 <ProgressBar label="Efficiency" progress={78} />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

function HUDDataCard({ icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, x: 10 }}
      className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] hud-brackets transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subValue}</p>
    </motion.div>
  );
}

function ProgressBar({ label, progress }: { label: string, progress: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{progress}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
        />
      </div>
    </div>
  );
}
