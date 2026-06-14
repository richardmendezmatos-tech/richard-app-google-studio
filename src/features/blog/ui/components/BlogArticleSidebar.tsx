'use client';
import React from 'react';
import { Zap, ShieldCheck, TrendingUp, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Props {
  post: any;
}

/** Renders a dynamic intelligence score based on post tags */
function computeScore(post: any): { score: string; rating: string } {
  const fordTags = ['ford', 'f-150', 'mustang', 'bronco', 'explorer', 'escape', 'edge', 'ranger', 'maverick'];
  const isFord = post.tags?.some((t: string) => fordTags.includes(t.toLowerCase()));
  const hasSpecs = post.specs && post.specs.length > 0;
  const base = isFord ? 9.5 : hasSpecs ? 8.8 : 8.2;
  return { score: base.toFixed(1), rating: base >= 9 ? 'A+' : base >= 8.5 ? 'A' : 'A-' };
}

export const BlogArticleSidebar: React.FC<Props> = ({ post }) => {
  const { score, rating } = computeScore(post);

  // Extract specs from post.specs if available, else show defaults
  const specItems: { label: string; value: string }[] = post.specs?.length
    ? post.specs.slice(0, 4).map((s: any) => ({ label: s.label || s.name || 'Spec', value: s.value || '—' }))
    : [
        { label: 'Eficiencia', value: post.mpg || '—' },
        { label: 'Motor', value: post.engine || '—' },
        { label: 'Seguridad', value: '5 Stars' },
        { label: 'Tracción', value: post.drivetrain || '—' },
      ];

  const tag = post.tags?.[0]?.toLowerCase() || '';
  const inventoryQuery = tag ? `?search=${encodeURIComponent(tag)}` : '';

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
              Puntuación Sentinel
            </h4>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white italic tracking-tighter">{score}</span>
            <span className="text-xs font-black text-primary uppercase tracking-widest">
              {rating} Rating
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
          <Info size={14} /> Resumen Técnico
        </h4>

        <div className="space-y-4">
          {specItems.map((spec) => (
            <div
              key={spec.label}
              className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {spec.label}
              </span>
              <span className="text-xs font-black text-white uppercase italic">
                {spec.value !== '—' && spec.value ? spec.value : <span className="text-slate-700">N/D</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA → Inventory */}
      <Link
        href={`/inventory${inventoryQuery}`}
        className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 cursor-pointer"
      >
        <Zap size={16} /> Ver Catálogo
        <ExternalLink size={12} className="opacity-60" />
      </Link>

      {/* Ford-First badge */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 bg-cyan-400/10 rounded-lg flex items-center justify-center border border-cyan-400/10 shrink-0">
          <span className="text-[10px] font-black text-cyan-400">$300</span>
        </div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
          Bono Web disponible en tu próxima visita a <span className="text-white">Central Ford Vega Alta</span>
        </p>
      </div>
    </aside>
  );
};
