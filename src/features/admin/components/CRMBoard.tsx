import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Lead, subscribeToLeads, updateLeadStatus, getSecureLeadData } from '@/features/leads/services/crmService';
import { Phone, MessageCircle, Clock, Car, ShieldAlert, Eye, EyeOff, Loader2, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { generateActuarialReport } from '@/utils/pdfGenerator';
import { generateMockActuarialData } from '@/utils/actuarialUtils';
import { useLeadScoring } from '@/features/leads/hooks/useLeadScoring';
import { useVehicleHealth } from '@/services/telemetryService';
import { whatsappService } from '@/services/whatsappService';
import { orchestrationService } from '@/services/orchestrationService';

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
        <div className="h-full overflow-x-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900 scrollbar-hide">
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
                <MessageCircle className="text-[#00aed9]" /> Leads & CRM
            </h2>

            <DndContext
                sensors={sensors}
                onDragStart={(event) => setActiveId(event.active.id as string)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 md:gap-6 min-w-max md:min-w-0 h-[calc(100vh-180px)] snap-x snap-mandatory">
                    {COLUMNS.map(column => (
                        <Column
                            key={column.id}
                            column={column}
                            leads={leads.filter(l => l.status === column.id)}
                        />
                    ))}
                </div>
                {/* The following lines are syntactically incorrect JSX and cannot be placed directly here.
                    If this was intended to be part of a switch statement or a function, it needs to be
                    placed within a JavaScript block, not directly in JSX.
                    For the purpose of fulfilling the request as literally as possible while maintaining
                    syntactic correctness, these lines are commented out.
                    case 'tool.call':
                    addToolInvocation(anyEvent.data as any as ToolCallData);
                    break;
                */}
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
        <div ref={setNodeRef} className="w-[85vw] md:w-80 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 snap-center">
            <div className={`flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 ${column.color.replace('bg-', 'text-')}`}>
                <h3 className="font-bold uppercase tracking-wider text-xs md:text-sm">{column.title}</h3>
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
    const elementRef = useRef<HTMLDivElement | null>(null);

    // Merge refs
    const setRef = (node: HTMLDivElement | null) => {
        setNodeRef(node);
        elementRef.current = node;
    };

    useLayoutEffect(() => {
        if (elementRef.current) {
            const transformVal = transform ? CSS.Translate.toString(transform) : 'none';
            elementRef.current.style.setProperty('--dnd-transform', transformVal);
            elementRef.current.style.transform = 'var(--dnd-transform)';
        }
    }, [transform]);

    if (isDragging) {
        return (
            <div
                ref={setRef}
                className="lead-dragging"
            >
                <LeadCard lead={lead} />
            </div>
        );
    }

    return (
        <div
            ref={setRef}
            {...listeners}
            {...attributes}
            className="lead-static"
        >
            <LeadCard lead={lead} />
        </div>
    );
};

const LeadCard = ({ lead, isOverlay }: { lead: Lead, isOverlay?: boolean }) => {
    const [revealedSSN, setRevealedSSN] = useState<string | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();

    // CRM Insights: Health + Scoring Integration
    const { health } = useVehicleHealth(lead.carId || '');
    const scoring = useLeadScoring(lead, health);

    const handleWhatsAppSend = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!lead.phone) {
            alert("Este lead no tiene número de teléfono registrado.");
            return;
        }

        setIsSending(true);
        try {
            // 1. Get Orchestrated Message
            const orchestration = await orchestrationService.orchestrateLeadFollowUp(lead, health);

            // 2. Send via WhatsApp Service
            const success = await whatsappService.sendMessage(lead.phone, orchestration.message);

            if (success) {
                console.log("[CRM] Message sent successfully");
                // Option: Update lead notes via updateLeadStatus or a specialized log
            } else {
                // Fallback to manual link if API fails
                const link = whatsappService.getFallbackLink(lead.phone, orchestration.message);
                window.open(link, '_blank');
            }
        } catch (error) {
            console.error("[CRM] Failed to send orchestrated message:", error);
        } finally {
            setIsSending(false);
        }
    };

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

            {(lead.aiAnalysis || scoring.score > 0) && (
                <div className="mb-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={12} className={scoring.score > 70 ? "text-[#00aed9]" : "text-slate-400"} />
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dynamic Score</span>
                        </div>
                        <span className={`text-xs font-black ${scoring.priority === 'urgent' ? 'text-red-500' :
                            scoring.priority === 'high' ? 'text-amber-500' :
                                'text-slate-400'
                            }`}>
                            {scoring.score}/100
                        </span>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                        <div className={`flex-1 px-2 py-1 rounded-md text-[10px] font-bold text-center uppercase border ${scoring.priority === 'urgent' ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' :
                            scoring.priority === 'high' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' :
                                'bg-slate-500/10 border-slate-500/50 text-slate-500'
                            }`}>
                            {scoring.priority}
                        </div>
                        {health?.overallStatus === 'critical' && (
                            <div className="px-2 py-1 rounded-md text-[10px] font-bold bg-red-600 text-white flex items-center gap-1 uppercase">
                                <AlertTriangle size={10} /> MECÁNICA
                            </div>
                        )}
                    </div>
                </div>
            )}

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

            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                {lead.phone && (
                    <a href={`tel:${lead.phone}`} aria-label={`Llamar a ${lead.phone}`} onPointerDown={e => e.stopPropagation()} className="p-3 md:p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 flex-1 flex justify-center">
                        <Phone size={18} className="md:size-4" />
                    </a>
                )}
                <button
                    onClick={handleWhatsAppSend}
                    disabled={isSending}
                    onPointerDown={e => e.stopPropagation()}
                    className="p-3 md:p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 flex-[2] flex justify-center items-center gap-2 text-xs font-bold disabled:opacity-50"
                >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} className="md:size-4" />}
                    <span className="hidden md:inline">{isSending ? 'Enviando...' : 'WhatsApp'}</span>
                </button>
                <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => {
                        // Ensure timestamp exists for actuarial generator
                        const compatLead: Lead = {
                            ...lead,
                            timestamp: lead.timestamp || lead.createdAt || { seconds: Date.now() / 1000, nanoseconds: 0 }
                        };
                        const data = generateMockActuarialData(compatLead);
                        generateActuarialReport(data);
                    }}
                    className="p-3 md:p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 flex-1 flex justify-center"
                    title="Generar Reporte Actuarial"
                >
                    <FileText size={18} className="md:size-4" />
                </button>
                <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => navigate(`/admin/analytics/${lead.id}`)}
                    className="p-3 md:p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 flex-1 flex justify-center"
                    title="Ver Análisis de Ciclo de Vida"
                >
                    <TrendingUp size={18} className="md:size-4" />
                </button>
            </div>
        </div>
    );
};



export default CRMBoard;
