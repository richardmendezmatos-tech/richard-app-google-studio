import React, { useState } from 'react';
import { frameworkService } from '../services/frameworkService';
import { Database, Terminal, Server, Cpu } from 'lucide-react';

const PHPShowcase: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [phpResponse, setPhpResponse] = useState<any>(null);

    const API_URL = import.meta.env.DEV
        ? 'http://localhost:5001/richard-automotive/us-central1/authApi'
        : '/authApi';

    const executePhpScript = async () => {
        setLoading(true);
        try {
            const resp = await fetch(`${API_URL}/php-bridge`);
            const data = await resp.json();

            // Update global count using PHP result
            frameworkService.increment('PHP' as any);

            setPhpResponse(data);
        } catch (err) {
            console.error("PHP Bridge Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-premium p-8 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Database className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">PHP <span className="text-indigo-400">Bridge</span></h2>
                        <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-widest">Legacy API Interface</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 font-mono text-[10px]">
                        <div className="flex justify-between text-indigo-400/60 mb-2 border-b border-white/5 pb-1">
                            <span>bridge.php</span>
                            <span>v8.2.12</span>
                        </div>
                        {phpResponse ? (
                            <div className="space-y-1 animate-in fade-in duration-500">
                                <p className="text-emerald-400">HTTP/1.1 200 OK</p>
                                <p className="text-slate-500">X-Powered-By: {phpResponse.data.php_runtime}</p>
                                <p className="text-indigo-300 mt-2">{`{`}</p>
                                <p className="pl-3 text-slate-400">"status": "{phpResponse.status}",</p>
                                <p className="pl-3 text-slate-400">"val": {phpResponse.data.result_value}</p>
                                <p className="text-indigo-300">{`}`}</p>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic py-4 text-center">Esperando ejecución de script...</p>
                        )}
                    </div>

                    <button
                        onClick={executePhpScript}
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                    >
                        <Terminal size={16} className={loading ? 'animate-pulse' : ''} />
                        {loading ? 'Executing Script...' : 'Execute PHP Script'}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                            <Server size={12} className="text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 uppercase font-black">Runtime</span>
                                <span className="text-[9px] text-white font-bold tracking-tight">Apache/CGI</span>
                            </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-2">
                            <Cpu size={12} className="text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-500 uppercase font-black">Memory</span>
                                <span className="text-[9px] text-white font-bold tracking-tight">{phpResponse ? phpResponse.data.memory_usage : '0MB'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PHPShowcase;
