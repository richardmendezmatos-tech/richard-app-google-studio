import React from 'react';
import { CheckCircle2, Clock, Wrench, AlertTriangle } from 'lucide-react';

interface MaintenanceEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    status: 'completed' | 'upcoming' | 'overdue';
    type: 'oil' | 'tires' | 'brakes' | 'general';
}

const MaintenanceTimeline: React.FC = () => {
    const events: MaintenanceEvent[] = [
        {
            id: '1',
            title: 'Cambio de Aceite y Filtro',
            description: 'Sintético 5W-30 - Realizado en Richard Automotive',
            date: '2026-01-15',
            status: 'completed',
            type: 'oil'
        },
        {
            id: '2',
            title: 'Rotación de Gomas',
            description: 'Próximo servicio recomendado',
            date: '2026-03-20',
            status: 'upcoming',
            type: 'tires'
        },
        {
            id: '3',
            title: 'Inspección de Frenos',
            description: 'Requiere revisión por millaje (60k)',
            date: '2026-02-01',
            status: 'overdue',
            type: 'brakes'
        }
    ];

    return (
        <div className="bg-[#131f2a] rounded-[40px] p-8 border border-white/5 relative overflow-hidden">
            <h3 className="text-xl font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-2">
                <Clock className="text-[#00aed9]" size={20} /> Historial de Cuidado
            </h3>

            <div className="relative space-y-8">
                {/* Vertical Line */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-white/10"></div>

                {events.map((event) => (
                    <div key={event.id} className="relative pl-12">
                        {/* Dot */}
                        <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full border-4 border-[#131f2a] flex items-center justify-center z-10 ${event.status === 'completed' ? 'bg-green-500' :
                            event.status === 'overdue' ? 'bg-red-500 animate-pulse' : 'bg-slate-700'
                            }`}>
                            {event.status === 'completed' ? <CheckCircle2 size={16} className="text-white" /> : <Wrench size={16} className="text-white" />}
                        </div>

                        <div className={`p-5 rounded-2xl border transition-all ${event.status === 'overdue' ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/5'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-sm">{event.title}</h4>
                                <span className="text-[10px] font-mono text-slate-500 uppercase">{event.date}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-3">{event.description}</p>

                            {event.status === 'overdue' && (
                                <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest">
                                    <AlertTriangle size={12} /> Atención Requerida
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-white/5 transition-all">
                Ver Reporte Completo de Salud
            </button>
        </div>
    );
};

export default MaintenanceTimeline;
