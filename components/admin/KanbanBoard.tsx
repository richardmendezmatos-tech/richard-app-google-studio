
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Phone, Mail, Wand2, GripVertical, ShieldCheck } from 'lucide-react';
import { Lead } from '../../types';
import { updateLeadStatus } from '../../services/firebaseService';
import { maskEmail, maskPhone, maskName, UserRole } from '../../utils/privacyUtils';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

interface LeadCardProps {
    lead: Lead;
    onPrint: () => void;
    userRole: UserRole;
    isOverlay?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onPrint, userRole, isOverlay }) => (
    <div className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-[24px] border border-slate-100 dark:border-white/5 group transition-all duration-300 relative ${isOverlay ? 'shadow-2xl scale-105 rotate-3 cursor-grabbing z-50 ring-2 ring-[#00aed9]' : 'shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-[#00aed9] hover:-translate-y-1'}`}>

        {/* Drag Handle (Visual only, whole card is draggable in this implementation) */}
        {!isOverlay && (
            <div className="absolute top-5 right-5 text-slate-300 dark:text-slate-600">
                <GripVertical size={16} />
            </div>
        )}

        <div className="flex justify-between mb-3 pr-6">
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${lead.type === 'trade-in' ? 'bg-purple-100 text-purple-600' :
                lead.type === 'finance' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-slate-100 dark:bg-slate-800 text-[#00aed9]'
                }`}>
                {lead.type}
            </span>
        </div>

        <div className="font-black text-slate-800 dark:text-white text-md mb-1 tracking-tight pr-4 flex items-center gap-2">
            {maskName(`${lead.firstName} ${lead.lastName}`, userRole)}
            {userRole !== 'admin' && <span title="Protección PII Activa"><ShieldCheck size={12} className="text-emerald-500 opacity-50" /></span>}
        </div>
        <div className="text-xs font-medium text-slate-400 truncate mb-4">
            {lead.vehicleOfInterest || lead.message || 'Sin detalles'}
        </div>

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
            </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
            <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
                {/* Prevent drag start when clicking buttons */}
                {lead.phone && (
                    <>
                        <a href={userRole === 'admin' ? `tel:${lead.phone}` : '#'} title={userRole === 'admin' ? "Llamar" : "PII Protegida"} className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors">
                            {userRole === 'admin' ? <Phone size={14} /> : <span className="text-[10px] font-bold">{maskPhone(lead.phone, userRole)}</span>}
                        </a>
                    </>
                )}
                {lead.email && (
                    <a href={userRole === 'admin' ? `mailto:${lead.email}` : '#'} title={userRole === 'admin' ? "Enviar Correo" : "PII Protegida"} className="p-2.5 bg-[#00aed9]/10 text-[#00aed9] rounded-xl hover:bg-[#00aed9]/20 transition-colors">
                        {userRole === 'admin' ? <Mail size={14} /> : <span className="text-[10px] font-bold">{maskEmail(lead.email, userRole)}</span>}
                    </a>
                )}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onPrint(); }} className="text-[10px] font-black text-slate-400 hover:text-[#00aed9] uppercase tracking-[0.15em] transition-colors">
                Hoja de Venta
            </button>
        </div>
    </div>
);

// Sortable Wrapper
function SortableLeadItem({ lead, onPrint, userRole }: { lead: Lead, onPrint: () => void, userRole: UserRole }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: lead.id, data: { lead } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 touch-none">
            <LeadCard lead={lead} onPrint={onPrint} userRole={userRole} />
        </div>
    );
}

// Droppable Column Component
function KanbanColumn({ id, title, color, glow, leads, onPrint, userRole }: any) {
    const { setNodeRef } = useSortable({ id: id, data: { type: 'Column' } }); // Make column itself a valid drop target logic if needed

    return (
        <div
            ref={setNodeRef}
            className="min-w-[320px] w-full bg-white/40 dark:bg-slate-800/20 backdrop-blur-xl rounded-[2.5rem] p-5 flex flex-col h-full border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none transition-colors duration-300"
        >
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`w-3 h-3 rounded-full ${color} ${glow} shadow-lg animate-pulse`} />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{title}</span>
                <span className="ml-auto bg-white/80 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black shadow-sm text-slate-600 dark:text-slate-200 border border-slate-100 dark:border-white/5">
                    {leads.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[100px]">
                <SortableContext items={leads.map((l: Lead) => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead: Lead) => (
                        <SortableLeadItem key={lead.id} lead={lead} onPrint={() => onPrint(lead)} userRole={userRole} />
                    ))}
                </SortableContext>
                {leads.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl p-4 opacity-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">Vacío</span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface KanbanBoardProps {
    leads: Lead[];
    onPrint: (lead: Lead) => void;
    userRole: UserRole;
    searchTerm?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onPrint, userRole, searchTerm = '' }) => {
    const columns = [
        { id: 'new', title: 'Nuevos', color: 'bg-[#00aed9]', glow: 'shadow-[#00aed9]/20' },
        { id: 'contacted', title: 'Contactados', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
        { id: 'negotiating', title: 'Negociando', color: 'bg-purple-500', glow: 'shadow-purple-500/20' },
        { id: 'sold', title: 'Vendidos', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
    ];

    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drag on click
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Filter leads
    const filteredLeads = leads.filter(lead => {
        if (!searchTerm) return true;
        const term = (searchTerm || '').toLowerCase();
        return (
            (lead.firstName || '').toLowerCase().includes(term) ||
            (lead.lastName || '').toLowerCase().includes(term) ||
            (lead.vehicleOfInterest || '').toLowerCase().includes(term) ||
            (lead.email || '').toLowerCase().includes(term)
        );
    });

    const findContainer = (id: string) => {
        if (columns.some(col => col.id === id)) return id;
        const lead = leads.find(l => l.id === id);
        return lead?.status || 'new';
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Since we are not persisting order locally in this basic version, 
        // visual drag over might be jittery if we tried to reorder state optimistically without backend order support.
        // For now, we rely on DragOverlay for feedback and handleDrop for the status change.
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeLeadId = active.id as string;
        const overId = over.id as string;

        // Ensure we are dropping onto a valid zone
        // If dropped on a column or an item in a column
        let newStatus = '';

        if (columns.some(col => col.id === overId)) {
            newStatus = overId;
        } else {
            // Find the lead we dropped over to determine the column
            const overLead = leads.find(l => l.id === overId);
            if (overLead) {
                newStatus = overLead.status || 'new';
            }
        }

        const activeLead = leads.find(l => l.id === activeLeadId);

        if (activeLead && newStatus && activeLead.status !== newStatus) {
            // Optimistic update could happen here, but we rely on firebase listener for now to be safe
            updateLeadStatus(activeLeadId, newStatus);

            if (newStatus === 'sold') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10B981', '#34D399', '#059669', '#FFD700']
                });
                showToast(`¡Vehículovendido! Felicitaciones a ${activeLead.firstName}`, 'success');
            } else {
                showToast(`Lead movido a ${columns.find(c => c.id === newStatus)?.title || newStatus}`, 'info');
            }
        }

        setActiveId(null);
    };

    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'info' | null }>({ msg: '', type: null });

    const showToast = (msg: string, type: 'success' | 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: null }), 3000);
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 h-full overflow-x-auto pb-4 px-1 custom-scrollbar">
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        glow={col.glow}
                        leads={filteredLeads.filter(l => (l.status || 'new') === col.id)}
                        onPrint={onPrint}
                        userRole={userRole}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay>
                    {activeLead ? (
                        <LeadCard lead={activeLead} onPrint={() => { }} userRole={userRole} isOverlay />
                    ) : null}
                </DragOverlay>,
                document.body
            )}

            {/* Toast Notification */}
            {toast.type && (
                createPortal(
                    <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-4 ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-slate-900/90 text-white'
                            }`}>
                            {toast.type === 'success' ? <ShieldCheck size={20} /> : <Wand2 size={20} />}
                            <span className="font-bold">{toast.msg}</span>
                        </div>
                    </div>,
                    document.body
                )
            )}
        </DndContext>
    );
};
