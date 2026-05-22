'use client';

import React from 'react';
import { Car } from '@/entities/inventory';
import { Loader2, Cpu, Rotate3D } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassContainer } from '@/shared/ui/common/GlassContainer';
import Viewer360 from '@/features/inventory/ui/common/Viewer360';
import DOMPurify from 'dompurify';

interface Props {
  car: Car;
  showHeavyContent: boolean;
  loadingPitch: boolean;
  aiPitch: string;
  onToggleAR: () => void;
}

const OverviewTab: React.FC<Props> = ({ car, showHeavyContent, loadingPitch, aiPitch, onToggleAR }) => (
  <div className="flex flex-col lg:flex-row gap-6 h-full">
    <div className="w-full lg:w-2/3 bg-white/5 rounded-5xl border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner group">
      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40 pointer-events-none" />
      {showHeavyContent ? (
        <div className="w-full h-full relative">
          <div className="absolute top-8 left-8 p-4 border-l-2 border-cyan-500 opacity-60 z-20 pointer-events-none">
            <p className="font-tech text-[8px] font-black uppercase tracking-[0.4em] text-cyan-400">
              Tactical Scan ACTIVE
            </p>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 right-8 text-right opacity-60 z-20 pointer-events-none">
            <p className="font-tech text-3xl font-black text-white italic tracking-tighter">
              CERTIFIED
            </p>
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              Sentinel Elite Unit
            </p>
          </div>

          <div className="absolute top-8 right-8 z-30">
            <button
              onClick={onToggleAR}
              className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-cyan-500 backdrop-blur-xl border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl group/ar"
            >
              <Rotate3D
                size={16}
                className="text-cyan-400 group-hover/ar:text-slate-950 transition-colors"
              />
              Activate AR-Vision
            </button>
          </div>

          <Viewer360
            images={(car.images || [car.img || car.image]).filter(
              (img): img is string => !!img,
            )}
            alt={car.name}
            badge={car.badge}
            carPrice={car.price}
            carType={car.type}
            onFullscreen={() => {}}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-cyan-500" />
          <span className="font-tech text-[10px] uppercase tracking-[0.5em] text-cyan-500 animate-pulse">
            Syncing Garage...
          </span>
        </div>
      )}
    </div>

    <div className="w-full lg:w-1/3 flex flex-col gap-4">
      <GlassContainer
        intensity="high"
        className="p-8 rounded-5xl flex-1 border-t-2 border-cyan-500/30 overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-cyan-400" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">
              IA Richard Report
            </span>
          </div>
          <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full">
            <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">
              PRO VERSION
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loadingPitch ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 overflow-hidden">
              <div className="relative w-full h-32 overflow-hidden bg-slate-900/50 rounded-2xl flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/20 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-8 bg-cyan-500/30 rounded-full"
                      animate={{ height: [32, 48, 32] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-400 font-black animate-pulse">
                Running Neural Analysis...
              </p>
            </div>
          ) : (
            <div className="text-[14px] leading-relaxed text-slate-300 font-medium space-y-4">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    aiPitch
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-cyan-400 font-black">$1</strong>',
                      )
                      .replace(/\n/g, '<br/>'),
                  ),
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Condition
            </p>
            <p className="text-xs font-black text-white italic">Elite Certified</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Fuel Economy
            </p>
            <p className="text-xs font-black text-white italic">Optimal</p>
          </div>
        </div>
      </GlassContainer>
    </div>
  </div>
);

export default OverviewTab;
