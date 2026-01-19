
import React from 'react';
import { Phone, Mail, Wand2 } from 'lucide-react';
import { Lead } from '../../types';
import { updateLeadStatus } from '../../services/firebaseService';

interface LeadCardProps {
    lead: Lead;
    onPrint: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onPrint }) => (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 group hover:border-[#00aed9] hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between mb-3">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-[#00aed9]">{lead.type}</span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {lead.timestamp ? new Date((lead.timestamp.seconds || 0) * 1000).toLocaleDateString() : 'N/A'}
            </span>
        </div>
        <div className="font-black text-slate-800 dark:text-white text-md mb-1 tracking-tight">{lead.firstName} {lead.lastName}</div>
        <div className="text-xs font-medium text-slate-400 truncate mb-4">{lead.vehicleOfInterest || lead.message || 'Sin detalles'}</div>

        {/* AI Summary Highlight */}
        {lead.aiSummary && (
            <div className="mb-4 p-3 bg-gradient-to-br from-[#00aed9]/5 to-purple-500/5 dark:from-[#00aed9]/10 dark:to-purple-500/10 rounded-2xl border border-[#00aed9]/10 dark:border-white/5 relative overflow-hidden group/ai">
                <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                    <Wand2 size={12} className="text-[#00aed9] animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#00aed9]">IA Insights</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2 relative z-10" title={lead.aiSummary}>
                    {lead.aiSummary}
                </p>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#00aed9]/20 to-transparent blur-2xl opacity-0 group-hover/ai:opacity-100 transition-opacity" />
            </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex gap-2">
                {lead.phone && <a href={`tel:${lead.phone}`} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors"><Phone size={14} /></a>}
                {lead.email && <a href={`mailto:${lead.email}`} className="p-2.5 bg-[#00aed9]/10 text-[#00aed9] rounded-xl hover:bg-[#00aed9]/20 transition-colors"><Mail size={14} /></a>}
            </div>
            <button onClick={onPrint} className="text-[10px] font-black text-slate-400 hover:text-[#00aed9] uppercase tracking-[0.15em] transition-colors">Hoja de Venta</button>
        </div>

        <select
            value={lead.status || 'new'}
            onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
            className="mt-4 w-full text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 rounded-xl py-3 px-3 outline-none focus:ring-2 focus:ring-[#00aed9] transition-all cursor-pointer"
        >
            <option value="new">Nuevo Lead</option>
            <option value="contacted">Contactado</option>
            <option value="negotiating">Negociando</option>
            <option value="sold">Vendido</option>
            <option value="lost">Perdido</option>
        </select>
    </div>
);

interface KanbanBoardProps {
    leads: Lead[];
    onPrint: (lead: Lead) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onPrint }) => {
    const columns = [
        { id: 'new', title: 'Nuevos', color: 'bg-[#00aed9]', glow: 'shadow-[#00aed9]/20' },
        { id: 'contacted', title: 'Contactados', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
        { id: 'negotiating', title: 'Negociando', color: 'bg-purple-500', glow: 'shadow-purple-500/20' },
        { id: 'sold', title: 'Vendidos', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    ];

    return (
        <div className="flex gap-6 h-full overflow-x-auto pb-4 px-1 custom-scrollbar">
            {columns.map(col => (
                <div key={col.id} className="min-w-[320px] w-full bg-white/40 dark:bg-slate-800/20 backdrop-blur-xl rounded-[2.5rem] p-5 flex flex-col h-full border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className={`w-3 h-3 rounded-full ${col.color} ${col.glow} shadow-lg animate-pulse`} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{col.title}</span>
                        <span className="ml-auto bg-white/80 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-slate-600 dark:text-slate-200 border border-slate-100 dark:border-white/5">
                            {leads.filter(l => (l.status || 'new') === col.id).length}
                        </span>
                    </div>
                    <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-1">
                        {leads.filter(l => (l.status || 'new') === col.id).map(lead => (
                            <LeadCard key={lead.id} lead={lead} onPrint={() => onPrint(lead)} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
