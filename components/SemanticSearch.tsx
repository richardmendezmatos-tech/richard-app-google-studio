import React, { useState } from 'react';
import { Search, Sparkles, Car, ChevronRight, Loader2, Info } from 'lucide-react';
import { frameworkService } from '../services/frameworkService';
import { useNavigate } from 'react-router-dom';

const SemanticSearch: React.FC = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const { httpsCallable } = await import('firebase/functions');
            const { functions } = await import('../services/firebaseService');
            const searchFlow = httpsCallable(functions, 'searchCarsSemantic');
            const response = await searchFlow({ query });
            setResults(response.data as any[]);

            frameworkService.increment('System' as any);
        } catch (err: any) {
            console.error("Semantic Search Error:", err);
            setError("Error en la búsqueda semántica.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-premium p-8 border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Búsqueda <span className="text-blue-400">Semántica</span></h2>
                        <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest font-mono">Búsqueda RAG (AI Powered)</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="mb-6 relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ej: 'carro familiar con poco millaje'..."
                        className="w-full h-[54px] bg-black/40 border border-white/10 rounded-2xl px-5 pr-12 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all active:scale-90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                </form>

                <div className="space-y-3 min-h-[220px]">
                    {results.length > 0 ? (
                        results.map((car, i) => (
                            <div
                                key={car.id}
                                onClick={() => navigate(`/vehicle/${car.id}`)}
                                className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors animate-in fade-in slide-in-from-right-4 duration-500 cursor-pointer group/item"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center p-1 group-hover/item:bg-blue-600/20 transition-colors">
                                            <img src={car.img} alt={car.name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase group-hover/item:text-blue-400 transition-colors">{car.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold">${car.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover/item:text-blue-400 transform group-hover/item:translate-x-1 transition-all" size={16} />
                                </div>
                            </div>
                        ))
                    ) : query && !loading ? (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center px-6">
                            <Info className="text-slate-700 mb-2" size={32} />
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">No se encontraron resultados específicos. Prueba otra descripción.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center px-6 opacity-30">
                            <Car className="text-slate-700 mb-2" size={48} />
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest px-8">Navega por el inventario usando lenguaje natural</p>
                        </div>
                    )}
                </div>

                <footer className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <span>Vertex Embeddings v4</span>
                    <span className="text-blue-500/60">Cosine Similarity: Active</span>
                </footer>
            </div>
        </div>
    );
};

export default SemanticSearch;
