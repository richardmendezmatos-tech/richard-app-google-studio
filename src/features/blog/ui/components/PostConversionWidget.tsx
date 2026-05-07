'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { triggerSentinelNurture } from '@/shared/api/communications/whatsappService';

interface Props {
  tag?: string;
  postTitle?: string;
  specs?: any[];
}

export const PostConversionWidget: React.FC<Props> = ({ tag, postTitle, specs }) => {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleNurtureTrigger = async () => {
    setIsCapturing(true);
    // Simulate lead capture for now
    const mockLead = {
      name: 'Cliente Interesado',
      phone: '787-555-1234',
      email: 'interesado@test.com'
    };

    await triggerSentinelNurture(mockLead as any, `Interés en post: ${postTitle}`, specs);
    alert('🚀 Sentinel Nurture activado. Revisa la consola para ver el mensaje generado por IA.');
    setIsCapturing(false);
  };

  return (
    <div className="mt-20 p-1 bg-linear-to-r from-primary/30 via-purple-500/30 to-primary/30 rounded-[3rem] shadow-[0_0_50px_rgba(6,182,212,0.15)]">
      <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[2.9rem] p-10 md:p-16 overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <Zap className="text-primary" size={18} />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Sentinel Action Trigger</span>
            </div>
            
            <h4 className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter italic">
              ¿Este artículo te <br />
              <span className="text-primary">abrió el apetito?</span>
            </h4>
            
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              No dejes que la información se quede en el papel. Usa nuestro motor de inteligencia financiera para ver qué tan cerca estás de tu próximo auto.
            </p>

            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> Pre-Aprobación Instantánea
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> Cero Impacto a Crédito
               </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 space-y-6">
            <div className="space-y-4">
              <div 
                onClick={handleNurtureTrigger}
                className="p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                       {isCapturing ? <Loader2 size={20} className="animate-spin text-primary" /> : <Calculator className="text-primary" size={20} />}
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black text-white uppercase tracking-widest">FlexDrive™ Simulator</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Calcula tu pago mensual N24</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                       <Zap className="text-purple-400" size={20} />
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black text-white uppercase tracking-widest">Inventario Recomendado</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Ver autos similares a este post</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>

            <button className="w-full py-6 bg-primary text-black rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:bg-white transition-all shadow-2xl shadow-primary/20">
               Hablar con un Experto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
