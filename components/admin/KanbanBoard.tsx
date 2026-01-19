
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
                <div className="flex justify-between items-center mb-1.5 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <Wand2 size={12} className="text-[#00aed9] animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#00aed9]">IA Insights</span>
                    </div>
                    {lead.aiScore !== undefined && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${lead.aiScore > 80 ? 'bg-emerald-500/20 text-emerald-500' : lead.aiScore > 50 ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                            {lead.aiScore}%
                        </span>
                    )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2 relative z-10" title={lead.aiSummary}>
                    {lead.aiSummary}
                </p>
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#00aed9]/20 to-transparent blur-2xl opacity-0 group-hover/ai:opacity-100 transition-opacity" />
            </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex gap-2">
                {lead.phone && (
                    <>
                        <a href={`tel:${lead.phone}`} title="Llamar" className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors"><Phone size={14} /></a>
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-2.5 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20 transition-colors">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </a>
                    </>
                )}
                {lead.email && <a href={`mailto:${lead.email}`} title="Enviar Correo" className="p-2.5 bg-[#00aed9]/10 text-[#00aed9] rounded-xl hover:bg-[#00aed9]/20 transition-colors"><Mail size={14} /></a>}
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
    searchTerm?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onPrint, searchTerm = '' }) => {
    const columns = [
        { id: 'new', title: 'Nuevos', color: 'bg-[#00aed9]', glow: 'shadow-[#00aed9]/20' },
        { id: 'contacted', title: 'Contactados', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
        { id: 'negotiating', title: 'Negociando', color: 'bg-purple-500', glow: 'shadow-purple-500/20' },
        { id: 'sold', title: 'Vendidos', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    ];

    // Filter leads based on search term
    const filteredLeads = leads.filter(lead => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            lead.firstName?.toLowerCase().includes(term) ||
            lead.lastName?.toLowerCase().includes(term) ||
            lead.vehicleOfInterest?.toLowerCase().includes(term) ||
            lead.email?.toLowerCase().includes(term)
        );
    });

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        e.dataTransfer.setData('leadId', leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) {
            updateLeadStatus(leadId, status);
        }
    };

    return (
        <div className="flex gap-6 h-full overflow-x-auto pb-4 px-1 custom-scrollbar">
            {columns.map(col => (
                <div
                    key={col.id}
                    className="min-w-[320px] w-full bg-white/40 dark:bg-slate-800/20 backdrop-blur-xl rounded-[2.5rem] p-5 flex flex-col h-full border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none transition-colors duration-300"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                >
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className={`w-3 h-3 rounded-full ${col.color} ${col.glow} shadow-lg animate-pulse`} />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{col.title}</span>
                        <span className="ml-auto bg-white/80 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-slate-600 dark:text-slate-200 border border-slate-100 dark:border-white/5">
                            {filteredLeads.filter(l => (l.status || 'new') === col.id).length}
                        </span>
                    </div>
                    <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-1 min-h-[100px]">
                        {filteredLeads.filter(l => (l.status || 'new') === col.id).map(lead => (
                            <div
                                key={lead.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, lead.id)}
                                className="cursor-grab active:cursor-grabbing"
                            >
                                <LeadCard lead={lead} onPrint={() => onPrint(lead)} />
                            </div>
                        ))}
                        {filteredLeads.filter(l => (l.status || 'new') === col.id).length === 0 && (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl p-4 opacity-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">Arrastra aquí</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
