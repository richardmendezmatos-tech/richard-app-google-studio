import React, { useState } from 'react';
import { Zap, Timer, Server, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generateCarDescriptionAI } from '../services/firebaseService';

const MemcachedDemo: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        lastTime: 0,
        isHit: false,
        text: ''
    });

    const testCache = async () => {
        setLoading(true);
        const start = performance.now();
        try {
            // Using a consistent car model to trigger cache
            const result = await generateCarDescriptionAI('Hyundai Tucson 2026', ['NLine', 'Panoramic Sunroof']);
            const end = performance.now();
            const time = Math.round(end - start);

            setStats({
                lastTime: time,
                isHit: time < 500, // Heuristic: AI generation usually takes > 2s, cache < 200ms
                text: result.substring(0, 100) + '...'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-premium p-8 border border-white/10 relative overflow-hidden group">
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Zap className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Memcached <span className="text-blue-400">Layer</span></h2>
                        <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest">Performance Accelerator</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Timer size={14} className="text-slate-500" />
                                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Latency</p>
                            </div>
                            <p className="text-xl font-black text-white">{stats.lastTime > 0 ? `${stats.lastTime}ms` : '--'}</p>
                        </div>
                        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Server size={14} className="text-slate-500" />
                                <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Status</p>
                            </div>
                            {stats.lastTime > 0 ? (
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className={stats.isHit ? 'text-emerald-400' : 'text-amber-400'} />
                                    <span className={`text-xs font-black uppercase ${stats.isHit ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {stats.isHit ? 'Cache Hit' : 'Cache Miss'}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xl font-black text-slate-600 italic tracking-tighter">Idle</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 min-h-[80px]">
                        <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-2">Service Output</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                            {stats.text || 'Presiona el botón para testear la aceleración de caché de IA.'}
                        </p>
                    </div>

                    <button
                        onClick={testCache}
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Consultando IA...' : 'Test AI Speed'}
                    </button>

                    <p className="text-[9px] text-slate-500 text-center uppercase font-bold tracking-[0.2em]">
                        {stats.isHit ? '⚡️ Ahorro de ~3.5s vía Memcached' : 'Primera carga: Procesando vía Gemini AI'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MemcachedDemo;
