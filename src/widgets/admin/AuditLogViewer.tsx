"use client";

import React, { useState, useEffect } from 'react';
import { AuditRepository, AuditEvent } from '@/shared/api/houston/AuditRepository';
import { ShieldAlert, ShieldCheck, Monitor, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const auditRepo = new AuditRepository();

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const logsData = await auditRepo.getRecentLogs(50);
      setLogs(logsData);
      setLoading(false);
    } catch (error) {
      console.error('AuditLog polling error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const intervalId = setInterval(loadLogs, 15000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: es });
    } catch (e) {
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-amber-500" size={20} />
            Registro de Auditoría
          </h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
            Últimos 50 intentos de acceso
          </p>
        </div>
        <div className="text-[10px] font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full uppercase tracking-widest border border-emerald-500/20">
          En Tiempo Real
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/50 dark:bg-slate-900/50 text-slate-500 uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">IP / Dispositivo</th>
              <th className="px-6 py-4">Mensaje</th>
              <th className="px-6 py-4 text-right">Tiempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-4">
                  {log.type === 'info' || log.type === 'conversion' ? (
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck size={14} /> OK
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-500 font-bold">
                      <ShieldAlert size={14} /> {log.type.toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                  {log.source}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                      <Globe size={10} /> {log.metadata?.ip || '0.0.0.0'}
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-slate-400 text-[10px] truncate max-w-board-column-md"
                      title={log.metadata?.device}
                    >
                      <Monitor size={10} /> {log.metadata?.device || 'Unknown Device'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-600 dark:text-slate-400">
                    {log.message}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono text-slate-500">
                  {formatDate(log.timestamp)}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/20"
                >
                  No hay registros de seguridad recientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

