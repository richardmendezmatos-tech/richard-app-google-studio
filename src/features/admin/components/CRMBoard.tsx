import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead, subscribeToLeads, updateLeadStatus, getSecureLeadData } from '@/features/leads/services/crmService';
import { Phone, MessageCircle, Clock, Car, ShieldAlert, Eye, EyeOff, Loader2 } from 'lucide-react';

const COLUMNS = [
    { id: 'new', title: 'Nuevos', color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contactados', color: 'bg-yellow-500' },
    { id: 'negotiation', title: 'Negociación', color: 'bg-purple-500' },
    { id: 'sold', title: 'Vendidos', color: 'bg-green-500' },
    { id: 'lost', title: 'Perdidos', color: 'bg-red-500' }
];

const CRMBoard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToLeads((data) => {
            setLeads(data);
        });
        return () => unsubscribe();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor)
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Find the lead
            const leadId = active.id as string;
            // The "over" id should be the column id (or a card in that column, simplified to column here)
            // We need to implement Droppable columns properly.
            // For this basic version, we assume dropping ON a column container.

            const newStatus = over.id as Lead['status'];

            if (COLUMNS.some(c => c.id === newStatus)) {
                // Optimistic update
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
                await updateLeadStatus(leadId, newStatus);
            }
        }
        setActiveId(null);
    };

    return (
        <div className="h-full overflow-x-auto p-6 bg-slate-50 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="text-[#00aed9]" /> CRM de Ventas
            </h2>

            <DndContext
                sensors={sensors}
                onDragStart={(event) => setActiveId(event.active.id as string)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 min-w-max h-[calc(100vh-200px)]">
                    {COLUMNS.map(column => (
                        <Column
                            key={column.id}
                            column={column}
                            leads={leads.filter(l => l.status === column.id)}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeId ? (
                        <LeadCard lead={leads.find(l => l.id === activeId)!} isOverlay />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

// --- Subcomponents ---

const Column = ({ column, leads }: { column: typeof COLUMNS[0], leads: Lead[] }) => {
    const { setNodeRef } = useDroppable({ id: column.id }); // Helper hook we might need to define or import

    return (
        <div ref={setNodeRef} className="w-80 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className={`flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 ${column.color.replace('bg-', 'text-')}`}>
                <h3 className="font-bold uppercase tracking-wider text-sm">{column.title}</h3>
                <span className="bg-white dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    {leads.length}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                {leads.map(lead => (
                    <DraggableLead key={lead.id} lead={lead} />
                ))}
            </div>
        </div>
    );
};

const DraggableLead = ({ lead }: { lead: Lead }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                className="opacity-30 grayscale pointer-events-none transition-transform z-50"
                style={style}
            >
                <LeadCard lead={lead} />
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="relative z-10 transition-transform"
            style={style}
        >
            <LeadCard lead={lead} />
        </div>
    );
};

const LeadCard = ({ lead, isOverlay }: { lead: Lead, isOverlay?: boolean }) => {
    const [revealedSSN, setRevealedSSN] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);

    const handleReveal = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (revealedSSN) {
            setRevealedSSN(null);
            return;
        }

        setIsRevealing(true);
        try {
            const data = await getSecureLeadData(lead.id);
            if (data && data.ssn) {
                setRevealedSSN(data.ssn);
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Error desconocido";
            alert(message);
        } finally {
            setIsRevealing(false);
        }
    };

    return (
        <div
            className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${isOverlay ? 'shadow-2xl rotate-2 scale-105' : ''
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${lead.type === 'whatsapp' ? 'bg-green-100 text-green-700' :
                    lead.type === 'visual_ai' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {lead.type}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    {lead.createdAt
                        ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString()
                        : 'Reciente'}
                </span>
            </div>

            <h4 className="font-bold text-slate-700 dark:text-slate-200 leading-tight mb-1">{lead.name}</h4>

            {lead.carId && (
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2 bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-lg">
                    <Car size={12} />
                    <span className="truncate">Unidad #{lead.carId}</span>
                </div>
            )}

            {lead.ssn && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldAlert size={12} className="text-amber-500" />
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                            {revealedSSN || lead.ssn}
                        </span>
                    </div>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={handleReveal}
                        disabled={isRevealing}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Revelar SSN"
                    >
                        {isRevealing ? <Loader2 size={12} className="animate-spin" /> : revealedSSN ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                {lead.phone && (
                    <a href={`tel:${lead.phone}`} aria-label={`Llamar a ${lead.phone}`} onPointerDown={e => e.stopPropagation()} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                        <Phone size={14} />
                    </a>
                )}
                {lead.type === 'whatsapp' && (
                    <a href="#" aria-label="Contactar por WhatsApp" onPointerDown={e => e.stopPropagation()} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 ml-auto">
                        <MessageCircle size={14} /> WhatsApp
                    </a>
                )}
            </div>
        </div>
    );
};



export default CRMBoard;
