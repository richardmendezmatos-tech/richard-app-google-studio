"use client";

import React, { useEffect, useState } from 'react';
import { TrendingDown, AlertCircle, RefreshCw, Zap, ShoppingCart, Loader2 } from 'lucide-react';
import { createPurchaseOrderDraft } from '@/shared/api/supabase/supabaseClient';

interface Gap {
  id: number;
  query: string;
  detected_intent: string;
  created_at: string;
}

export const GapAnalyticsWidget: React.FC = () => {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fetchGaps = async (signal?: AbortSignal) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${supabaseUrl}/rest/v1/search_gaps?select=id,query,detected_intent,created_at&order=created_at.desc&limit=10`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Accept: 'application/json',
        },
        signal,
      });
      if (!res.ok) throw new Error(`Gap fetch failed: ${res.status}`);
      const data = (await res.json()) as Gap[];
      setGaps(Array.isArray(data) ? data : []);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Gap fetch error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHoustonAnalyze = async (gap: Gap) => {
    setAnalyzingId(gap.id);
    try {
      // 1. Llamar a la API de Sourcing
      const res = await fetch('/api/command-center/sourcing/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: gap.query, count: 1 })
      });
      
      if (!res.ok) throw new Error('Failed to analyze');
      const analysis = await res.json();

      // 2. Crear el Draft de PO en Supabase
      const result = await createPurchaseOrderDraft({
        query: gap.query,
        recommendation: analysis.recommendation,
        roi: analysis.roi,
        priority: analysis.priority,
        reason: analysis.reason
      });

      if (result.success) {
        alert(`Propuesta de abasto generada para "${gap.query}" con ROI de ${analysis.roi}%`);
      }
    } catch (err) {
      console.error('Houston Analysis Error:', err);
      alert('Error en la inteligencia de Houston. Reintenta.');
    } finally {
      setAnalyzingId(null);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchGaps(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-slate-100 dark:border-white/5 shadow-2xl h-full flex flex-col group/widget">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-black flex items-center gap-3 text-slate-800 dark:text-white uppercase tracking-tighter">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <TrendingDown className="text-rose-500" size={20} />
            </div>
            Search Gaps
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inteligencia de Abasto Proactiva</p>
        </div>
        <button
          onClick={() => fetchGaps()}
          className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
        >
          <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} text-slate-500`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {gaps.length === 0 ? (
          <div className="text-center py-16 text-slate-400 flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="opacity-20" size={32} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">Mercado Satisfecho</p>
            <p className="text-[9px] mt-2 opacity-50 uppercase tracking-widest">No hay gaps detectados hoy</p>
          </div>
        ) : (
          gaps.map((gap) => (
            <div
              key={gap.id}
              className="p-5 bg-slate-50/50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-rose-500/30 transition-all group/item relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">Gap Detectado</span>
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200 italic tracking-tight">
                    "{gap.query}"
                  </span>
                </div>
                <button 
                  onClick={() => handleHoustonAnalyze(gap)}
                  disabled={analyzingId === gap.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                >
                  {analyzingId === gap.id ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
                  Houston AI
                </button>
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-100 dark:border-white/5 pt-3">
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-slate-500" />
                  {gap.detected_intent || 'General'}
                </span>
                <span>{new Date(gap.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3">
        <ShoppingCart className="text-emerald-500" size={16} />
        <p className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-widest leading-relaxed">
          Usa <span className="text-emerald-400 font-black">Houston AI</span> para convertir estos gaps en órdenes de compra estratégicas.
        </p>
      </div>
    </div>
  );
};
