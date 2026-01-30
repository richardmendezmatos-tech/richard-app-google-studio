import React, { useEffect, useState } from 'react';
import { Activity, Server, ShieldCheck, Database, AlertCircle } from 'lucide-react';
import { enterpriseService, SystemHealth } from '../../services/enterpriseService';

export const EnterpriseStatus = () => {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastPing, setLastPing] = useState<Date | null>(null);

    const checkStatus = async () => {
        setLoading(true);
        const result = await enterpriseService.getSystemHealth();
        setHealth(result);
        setLastPing(new Date());
        setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const result = await enterpriseService.getSystemHealth();
                if (isMounted) {
                    setHealth(result);
                    setLastPing(new Date());
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const isUp = health?.status === 'UP';

    return (
        <div className={`
      relative overflow-hidden rounded-xl border border-white/5 p-4
      bg-gradient-to-br from-[#0f172a] to-[#1e293b]
      shadow-2xl transition-all duration-300
      ${isUp ? 'shadow-emerald-500/10' : 'shadow-red-500/10'}
    `}>
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 
        ${isUp ? 'bg-emerald-500' : 'bg-red-500'}
      `} />

            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <Server size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">ENTERPRISE CORE</h3>
                        <p className="text-[10px] text-slate-400 font-mono">JAVA • REST • API</p>
                    </div>
                </div>

                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border
          ${isUp
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }
        `}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isUp ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {loading ? 'SYNCING...' : (health?.status || 'OFFLINE')}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                {/* Metric 1 */}
                <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Activity size={12} />
                        <span className="text-[10px] uppercase">Latency</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-white">
                        {isUp ? '< 5ms' : '--'}
                    </span>
                </div>

                {/* Metric 2 */}
                <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Database size={12} />
                        <span className="text-[10px] uppercase">Database</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-white">
                        {health?.checks?.database || '--'}
                    </span>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-2">
                <span>PORT: 8100</span>
                <span>{lastPing ? lastPing.toLocaleTimeString() : 'Waiting...'}</span>
            </div>
        </div>
    );
};
