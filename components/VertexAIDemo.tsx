import React, { useState } from 'react';
import { frameworkService } from '../services/frameworkService';
import { ShieldCheck, Zap, Globe, Cpu, Info } from 'lucide-react';

const VertexAIDemo: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const testVertexAI = async () => {
        setLoading(true);
        try {
            // In a real scenario, this would call a specific Vertex flow
            // For the demo, we use the generateDescription flow which now uses Vertex AI
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../services/firebaseService');
            const genDesc = httpsCallable(functions, 'generateDescription');

            const response = await genDesc({ carModel: "Richard Enterprise Edition", features: ["Vertex AI Grounding", "Enterprise Safety"] });
            setResult(response.data as string);

            frameworkService.increment('System' as any);
        } catch (err) {
            console.error("Vertex AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-premium p-8 border border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Vertex <span className="text-emerald-400">AI</span></h2>
                        <p className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest font-mono">Enterprise Foundation</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 min-h-[140px] flex flex-col">
                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">
                            <Zap size={12} />
                            <span>Model: gemini-1.5-flash (Vertex)</span>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                                <p className="text-[10px] text-slate-500 uppercase font-black animate-pulse">Running Enterprise Inference...</p>
                            </div>
                        ) : result ? (
                            <p className="text-slate-300 text-xs leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                                "{result.substring(0, 180)}..."
                            </p>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <Globe className="text-slate-700 mb-2" size={32} />
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest px-4">Ready for Enterprise Grounding & Safety Validation</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={testVertexAI}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                    >
                        <Cpu size={16} />
                        {loading ? 'Processing...' : 'Test Vertex AI Flow'}
                    </button>

                    <footer className="grid grid-cols-2 gap-2 text-[8px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Info size={10} className="text-emerald-500" />
                            <span>Grounding: Active</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 justify-end">
                            <ShieldCheck size={10} className="text-emerald-500" />
                            <span>Safety: Level 4</span>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default VertexAIDemo;
