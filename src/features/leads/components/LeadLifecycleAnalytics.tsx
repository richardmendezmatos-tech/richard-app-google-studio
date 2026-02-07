import React from 'react';
import { Lead } from '@/types/types';
import {
    Activity,
    Calendar,
    MessageCircle,
    FileText,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadLifecycleAnalyticsProps {
    lead: Lead;
}

export const LeadLifecycleAnalytics: React.FC<LeadLifecycleAnalyticsProps> = ({ lead }) => {
    // Mock timeline events based on lead data
    const events = [
        {
            type: 'created',
            date: lead.createdAt,
            title: 'Lead Creado',
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600'
        },
        ...(lead.status !== 'new' ? [{
            type: 'interaction',
            date: lead.lastContacted || lead.createdAt, // Fallback
            title: 'Interacción Reciente',
            icon: MessageCircle,
            color: 'bg-purple-100 text-purple-600'
        }] : []),
        ...(lead.customerMemory?.preferences ? [{
            type: 'insight',
            date: lead.createdAt, // Just for positioning
            title: 'Preferencias Detectadas',
            description: `${lead.customerMemory.preferences.models?.join(', ')}`,
            icon: Zap,
            color: 'bg-amber-100 text-amber-600'
        }] : [])
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="text-[#00aed9]" /> Lead Lifecycle
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-4">Timeline de Interacciones</h4>
                    <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                        {events.map((event, index) => (
                            <div key={index} className="flex gap-4 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${event.color} border-4 border-white dark:border-slate-800`}>
                                    <event.icon size={14} />
                                </div>
                                <div className="pt-1">
                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{event.title}</p>
                                    <p className="text-xs text-slate-400">
                                        {event.date && (typeof (event.date as any).toDate === 'function'
                                            ? format((event.date as any).toDate(), 'PP p', { locale: es })
                                            : 'Fecha desconocida')}
                                    </p>
                                    {event.description && (
                                        <p className="text-xs text-slate-500 mt-1 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-700">
                                            {event.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Score Heatmap / Drivers */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-4">Score Drivers</h4>

                    <div className="space-y-3">
                        {/* Mock Score Drivers - In real app, this comes from AI output */}
                        <ScoreDriver
                            label="Interés en Modelo Premium"
                            impact="positive"
                            value={+15}
                        />
                        <ScoreDriver
                            label="Verificación de Identidad"
                            impact="positive"
                            value={+20}
                            active={!!lead.ssn}
                        />
                        <ScoreDriver
                            label="Múltiples Visitas Web"
                            impact="positive"
                            value={+10}
                            active={true}
                        />
                        <ScoreDriver
                            label="Sin Respuesta > 7 días"
                            impact="negative"
                            value={-15}
                            active={false} // Demo state
                        />
                    </div>
                </div>
            </div>

            {/* Customer Memory Visualization */}
            {lead.customerMemory && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-[#00aed9]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <h4 className="font-bold text-[#00aed9] text-xs uppercase tracking-wider mb-4 relative z-10 flex items-center gap-2">
                        <Zap size={14} /> AI Context Memory
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Preferencias</p>
                            <div className="flex flex-wrap gap-2">
                                {lead.customerMemory.preferences?.models?.map(m => (
                                    <span key={m} className="px-2 py-1 bg-white/10 rounded-md text-xs backdrop-blur-sm border border-white/5">{m}</span>
                                ))}
                                {lead.customerMemory.preferences?.colors?.map(c => (
                                    <span key={c} className="px-2 py-1 bg-white/10 rounded-md text-xs backdrop-blur-sm border border-white/5 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-current" style={{ color: c }}></span> {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Lifestyle AI Profile</p>
                            <p className="text-sm font-medium text-slate-200">
                                {lead.customerMemory.lifestyle || "Perfil no detectado aún."}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Último Resumen</p>
                            <p className="text-xs text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5 italic">
                                "{lead.customerMemory.lastInteractionSummary || "Sin resumen disponible."}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ScoreDriver = ({ label, impact, value, active = true }: { label: string, impact: 'positive' | 'negative', value: number, active?: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${active ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700' : 'opacity-40 grayscale'}`}>
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${impact === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {impact === 'positive' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className={`font-black ${impact === 'positive' ? 'text-green-600' : 'text-red-500'}`}>
            {value > 0 ? '+' : ''}{value}
        </span>
    </div>
);
