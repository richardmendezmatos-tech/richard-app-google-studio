import React from 'react';
import { Lead } from '@/types/types';
import {
    Activity,
    Calendar,
    MessageCircle,
    TrendingUp,
    TrendingDown,
    Zap,
    Clock,
    Database,
    Infinity as InfinityIcon,
    PieChart,
    Target
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadLifecycleAnalyticsProps {
    lead: Lead;
}

interface DateLike {
    toDate?: () => Date;
}

const formatEventDate = (value: unknown): string => {
    if (!value || typeof value !== 'object') return 'Fecha desconocida';
    const maybeDate = value as DateLike;
    if (typeof maybeDate.toDate === 'function') {
        return format(maybeDate.toDate(), 'PP p', { locale: es });
    }
    return 'Fecha desconocida';
};

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
                                        {formatEventDate(event.date)}
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
                            active={!!lead.ssn_encrypted || (!!lead.ssn && lead.ssn !== '[ENCRYPTED]')}
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

            {/* Continuum Memory System (CMS) Visualization */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-6 flex items-center justify-between">
                    <span>Continuum Memory System (Nested Learning)</span>
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full border border-blue-100">RA-CMS Paradigm</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* L1: Reactive */}
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-1">
                            <Zap size={10} className="text-amber-500 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">L1: Reactivo</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Atención Inmediata</p>
                        <p className="text-[10px] text-slate-500 mt-1">Interacciones en tiempo real y clicks recientes vinculados al inventario.</p>
                        <div className="mt-3 flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-500"></div>
                            <span className="text-[9px] font-mono text-green-600 uppercase">Live Context Active</span>
                        </div>
                    </div>

                    {/* L2: Contextual */}
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <Database size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">L2: Contextual</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Patrones de Interés</p>
                        <p className="text-[10px] text-slate-500 mt-1">Análisis de tendencias semanales. Preferencia detectada: {lead.customerMemory?.preferences?.models?.[0] || 'SUV'}.</p>
                        <div className="mt-3 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[65%]"></div>
                        </div>
                    </div>

                    {/* L3: Evolutivo */}
                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                            <InfinityIcon size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">L3: Evolutivo</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Ciclo de Vida</p>
                        <p className="text-[10px] text-slate-500 mt-1">Oportunidad de Trade-in detectada según historial de propiedad (2-3 años).</p>
                        <div className="mt-3 flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full ${i <= 2 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Phase 21: Marketing Efficiency & ROI Dashboard */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-6 flex items-center gap-2">
                    <PieChart size={14} className="text-[#00aed9]" /> Marketing Efficiency (Operation Shield)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Costo Adquisición</p>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-black text-slate-800 dark:text-white">${lead.acquisitionCost || '45.00'}</span>
                            <span className="text-[10px] text-slate-400 mb-1">USD</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Fuente / Canal</p>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${lead.source === 'google' ? 'bg-red-500' : 'bg-blue-600'}`}></div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">{lead.source || 'Facebook Ads'}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1">{lead.sourceCampaign || 'Retargeting_Q1_PR'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/50 col-span-1 md:col-span-2">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] text-blue-500 uppercase font-black">ROI Proyectado</p>
                            <Target size={14} className="text-blue-500" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">14.2x</span>
                            </div>
                            <div className="flex-1">
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[78%]"></div>
                                </div>
                                <p className="text-[9px] text-slate-400 mt-1 italic">Basado en Valor de Unidad: $32,900</p>
                            </div>
                        </div>
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
                                        <span className="w-2 h-2 rounded-full bg-current dynamic-color-bullet" style={{ '--pref-color': c } as React.CSSProperties}></span> {c}
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
