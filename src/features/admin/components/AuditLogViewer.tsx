
import React, { useState, useEffect } from 'react';
import { db } from '@/services/firebaseService';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ShieldAlert, ShieldCheck, Clock, Monitor, Globe } from 'lucide-react';
import { FirestoreTimestamp } from '@/types/types';

interface AuditLog {
    id: string;
    email: string;
    ip: string;
    device: string;
    method: string;
    success: boolean;
    timestamp: FirestoreTimestamp;
    location: string;
}

export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'audit_logs'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AuditLog[];
            setLogs(logsData);
            setLoading(false);
        }, (error) => {
            console.error("AuditLog onSnapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp: FirestoreTimestamp) => {
        if (!timestamp) return 'N/A';
        // Handle both Firestore Timestamp (toDate) and JS Date/number
        const date = (timestamp as any).toDate ? (timestamp as any).toDate() : new Date(timestamp as any);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(date);
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
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4 text-right">Tiempo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    {log.success ? (
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                                            <ShieldCheck size={14} /> Permitido
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-rose-500 font-bold">
                                            <ShieldAlert size={14} /> Bloqueado
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                    {log.email}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                                            <Globe size={10} /> {log.ip}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-slate-400 text-[10px] truncate max-w-[200px]" title={log.device}>
                                            <Monitor size={10} /> {log.device}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${log.method === 'passkey' ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                        }`}>
                                        {log.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-slate-500">
                                    {formatDate(log.timestamp)}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium bg-slate-50/20">
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
