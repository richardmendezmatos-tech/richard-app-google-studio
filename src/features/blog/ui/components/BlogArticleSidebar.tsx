import React from 'react';
import { Zap, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface Props {
  post: any;
}

export const BlogArticleSidebar: React.FC<Props> = ({ post }) => {
  return (
    <aside className="hidden lg:block w-80 shrink-0 sticky top-32 h-fit space-y-8 animate-in slide-in-from-right-10 duration-1000">
      {/* Sentinel Intelligence Score */}
      <div className="bg-linear-to-br from-slate-900 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
          <TrendingUp size={64} className="text-primary" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Sentinel Score
            </h4>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white italic tracking-tighter">9.2</span>
            <span className="text-xs font-black text-primary uppercase tracking-widest">
              A+ Rating
            </span>
          </div>

          <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-widest">
            Basado en confiabilidad, valor de reventa y performance en carreteras de Puerto Rico.
          </p>
        </div>
      </div>

      {/* Quick Specs Overview */}
      <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/5 space-y-6">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-2">
          <Info size={14} /> Quick Intelligence
        </h4>

        <div className="space-y-4">
          {[
            { label: 'Eficiencia', value: '24 MPG' },
            { label: 'Caballos', value: '278 HP' },
            { label: 'Seguridad', value: '5 Stars' },
            { label: 'Tracción', value: '4WD Opt' },
          ].map((spec) => (
            <div
              key={spec.label}
              className="flex justify-between items-center py-2 border-b border-white/5"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {spec.label}
              </span>
              <span className="text-xs font-black text-white uppercase italic">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA */}
      <button className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3">
        <Zap size={16} /> Ver Catálogo
      </button>
    </aside>
  );
};
