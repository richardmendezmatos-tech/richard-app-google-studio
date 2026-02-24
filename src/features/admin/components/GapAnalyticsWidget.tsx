
import React, { useEffect, useState } from 'react';
import { TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';

interface Gap {
    id: number;
    query: string;
    detected_intent: string;
    created_at: string;
}

export const GapAnalyticsWidget: React.FC = () => {
    const [gaps, setGaps] = useState<Gap[]>([]);
    const [loading, setLoading] = useState(true);
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
                    Accept: 'application/json'
                },
                signal
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

    useEffect(() => {
        const controller = new AbortController();
        fetchGaps(controller.signal);
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-white uppercase tracking-tight">
                    <TrendingDown className="text-rose-500" size={20} /> Oportunidades Perdidas
                </h3>
                <button
                    onClick={() => fetchGaps()}
                    title="Refrescar datos"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {gaps.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest">Sin Data de Gaps</p>
                    </div>
                ) : (
                    gaps.map(gap => (
                        <div key={gap.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">"{gap.query}"</span>
                                <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full uppercase">Perdida</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                <span>Intento: {gap.detected_intent}</span>
                                <span>{new Date(gap.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <p className="mt-4 text-[10px] text-slate-400 font-medium italic">
                * Estas consultas semánticas no encontraron coincidencias en tu inventario actual.
            </p>
        </div>
    );
};
