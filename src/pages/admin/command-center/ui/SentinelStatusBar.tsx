import React, { useEffect, useState } from 'react';
import { Activity, Server, Zap, ShieldCheck, Wifi } from 'lucide-react';
import { enterpriseService, SystemHealth } from '@/shared/api/enterprise/EnterpriseClient';

export const SentinelStatusBar: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const result = await enterpriseService.getSystemHealth();
        const end = performance.now();
        setHealth(result);
        setLatency(Math.round(end - start));
      } catch (e) {
        setHealth({ status: 'DOWN', checks: { database: 'DOWN' } });
        setLatency(0);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const isUp = health?.status === 'UP';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[110] bg-slate-950/80 backdrop-blur-xl border-t border-white/5 h-8 flex items-center px-6 justify-between text-[9px] font-black uppercase tracking-[0.2em]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Wifi size={10} className={isUp ? 'text-emerald-500' : 'text-rose-500'} />
          <span>
            System Status:{' '}
            <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
              {isUp ? 'Operational' : 'Anomaly Detected'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Activity size={10} className="text-blue-500" />
          <span>
            Latency: <span className="text-white">{latency}ms</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Zap size={10} className="text-amber-500" />
          <span>
            RA-Voice: <span className="text-emerald-400">Executive Bridge Active</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <ShieldCheck size={10} className="text-primary" />
          <span>Sentinel v2.7 Protected</span>
        </div>
      </div>
    </div>
  );
};
