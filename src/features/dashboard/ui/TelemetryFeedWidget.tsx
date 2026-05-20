'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { AuditRepository, AuditEvent } from '@/shared/api/houston/AuditRepository';
import { useAuthStore } from '@/entities/session';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const auditRepo = new AuditRepository();

const TelemetryFeedWidget: React.FC = () => {
  const { role } = useAuthStore();
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    if (role !== 'admin') return;

    try {
      setError(null);
      const recentLogs = await auditRepo.getRecentLogs(10);
      setLogs(recentLogs);
    } catch (err) {
      console.error('Failed to fetch telemetry logs:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s for now
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'conversion':
        return <CheckCircle2 size={14} className="text-ra-primary" />;
      case 'critical':
        return <AlertCircle size={14} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={14} className="text-amber-500" />;
      default:
        return <Info size={14} className="text-slate-400" />;
    }
  };

  if (role !== 'admin') {
    return (
      <div className="glass-premium p-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
        <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 mb-4">
          <AlertCircle size={24} className="text-amber-500" />
        </div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">
          Acceso Restringido
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px]">
          Se requiere nivel de administrador para visualizar Sentinel Telemetry
        </p>
      </div>
    );
  }

  return (
    <div className="glass-premium p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-ra-primary/10 rounded-lg border border-ra-primary/30">
            <Terminal size={18} className="text-ra-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              Sentinel Telemetry
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Activity size={10} className="animate-pulse text-ra-primary" /> Live Feed N23
            </p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
        >
          <Clock size={16} className="text-slate-500 group-hover:text-ra-primary" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-ra-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(log.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-300 leading-snug group-hover:text-white transition-colors">
                    {log.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                      {log.source || 'SYS'}
                    </span>
                    <span className="text-[9px] font-medium text-slate-600">
                      {log.timestamp
                        ? formatDistanceToNow(new Date(log.timestamp), {
                            addSuffix: true,
                            locale: es,
                          })
                        : 'ahora mismo'}
                    </span>
                  </div>
                </div>
                {log.type === 'conversion' && (
                  <ArrowUpRight
                    size={12}
                    className="text-ra-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <Terminal size={32} className="text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-500 uppercase">Sin eventos detectados</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 overflow-x-auto hide-scrollbar">
        {['Info', 'Conversion', 'Alert'].map((label) => (
          <div
            key={label}
            className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[8px] font-black uppercase text-slate-500 whitespace-nowrap"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelemetryFeedWidget;
