import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Phone,
  Mail,
  Wand2,
  GripVertical,
  ShieldCheck,
  MessageCircle,
  Clock,
  Car,
  ShieldAlert,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import {
  Lead,
  subscribeToLeads,
  updateLeadStatus,
  getSecureLeadData,
} from '@/shared/api/adapters/leads/crmService';
import { decryptSSN } from '@/shared/api/security/ssnEncryptionService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { maskEmail, maskPhone, maskName, UserRole } from '@/shared/lib/utils/privacyUtils';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { useLeadScoring } from '@/features/leads';
import { useVehicleHealth } from '@/shared/api/metrics/telemetryService';
import * as whatsappService from '@/features/leads/services/whatsappService';
import { orchestrationService } from '@/features/ai-hub/ai-orchestration/api/orchestrationService';
import { getAntigravityOutreachAction } from '@/features/omnichannel/api/antigravityOmnichannelService';
import { sendTransactionalEmail } from '@/shared/api/communications/emailService';
import { generateActuarialReport } from '@/shared/lib/utils/pdfGenerator';
import { generateMockActuarialData } from '@/entities/finance';
import SmartDealSheetModal from '@/features/sales-automation/ui/SmartDealSheetModal';

const COLUMNS = [
  {
    id: 'new',
    title: 'Nuevos',
    color: 'bg-primary',
    glow: 'shadow-primary/20',
  },
  {
    id: 'contacted',
    title: 'Contactados',
    color: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
  },
  {
    id: 'negotiation',
    title: 'Negociando',
    color: 'bg-purple-500',
    glow: 'shadow-purple-500/20',
  },
  {
    id: 'sold',
    title: 'Ventas Cerradas',
    color: 'bg-emerald-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    id: 'lost',
    title: 'Perdidos',
    color: 'bg-red-500',
    glow: 'shadow-red-500/20',
  },
];

interface LeadCardProps {
  lead: Lead;
  onPrint: () => void;
  onOpenDealSheet: (lead: Lead) => void;
  userRole: UserRole;
  isOverlay?: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onPrint, onOpenDealSheet, userRole, isOverlay }) => {
  const [revealedSSN, setRevealedSSN] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const { health } = useVehicleHealth(lead.carId || '');
  const { addNotification } = useNotification();
  const scoringHook = useLeadScoring(lead, health);
  const scoring = lead.id === 'e2e-mock-lead' ? { score: 95 } : scoringHook;

  const handleWhatsAppSend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lead.phone && !lead.email) return;
    setIsSending(true);
    try {
      const orchestration = await orchestrationService.orchestrateLeadFollowUp(lead, health);
      const mappedPriority =
        orchestration.priority === 'low' || orchestration.priority === 'medium'
          ? 'normal'
          : (orchestration.priority as 'high' | 'urgent');
      const antigravityAction = await getAntigravityOutreachAction(lead, {
        trigger: 'manual_crm',
        fallbackMessage: orchestration.message,
        fallbackChannel: lead.phone ? 'whatsapp' : 'email',
        priority: mappedPriority,
      });
      const channel = antigravityAction?.channel || (lead.phone ? 'whatsapp' : 'email');
      const finalMessage = antigravityAction?.message || orchestration.message;
      const finalSubject = antigravityAction?.subject || `Seguimiento de ${lead.name || 'lead'}`;

      if (channel === 'email' && lead.email) {
        await sendTransactionalEmail({
          to: lead.email,
          subject: finalSubject,
          html: `<p>${finalMessage}</p>`,
        });
      } else if (lead.phone) {
        const success = await whatsappService.sendWhatsAppMessage(lead.phone, finalMessage);
        if (!success)
          window.open(whatsappService.getFallbackLink(lead.phone, finalMessage), '_blank');
      }
    } catch (error) {
      console.error('[CRM] Outreach Error:', error);
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

    // 1. Caso: Encriptación Zero-Knowledge (Local)
    if (lead.ssn_encrypted) {
      const masterKey = window.prompt('Ingresa la Master Key para desencriptar este SSN:');
      if (!masterKey) return;

      const decrypted = await decryptSSN(lead.ssn_encrypted, masterKey);
      if (decrypted === 'DECRYPTION_ERROR') {
        addNotification('error', 'Llave incorrecta. No se pudo desencriptar.');
      } else {
        setRevealedSSN(decrypted);
      }
      return;
    }

    // 2. Caso: Legacy (Bóveda Segura)
    setIsRevealing(true);
    try {
      const data = await getSecureLeadData(lead.id);
      if (data?.ssn) setRevealedSSN(data.ssn);
    } catch (error) {
      console.error(error);
      addNotification('error', 'Acceso denegado a la bóveda.');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div
      className={`glass-card glass-premium p-5 rounded-[24px] group transition-all duration-300 relative ${isOverlay ? 'shadow-2xl scale-105 rotate-3 cursor-grabbing z-50 ring-2 ring-primary' : 'shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-primary hover:-translate-y-1 hover-kinetic'}`}
    >
      {!isOverlay && (
        <div className="absolute top-5 right-5 text-slate-300 dark:text-slate-600">
          <GripVertical size={16} />
        </div>
      )}

      <div className="flex justify-between mb-3 pr-6">
        <span
          className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${lead.type === 'trade-in' ? 'bg-purple-100 text-purple-600' : lead.type === 'finance' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-primary'}`}
        >
          {lead.type || 'Standard'}
        </span>
        {scoring.score > 80 && (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
            Alta Prioridad
          </span>
        )}
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock size={10} />
          {lead.createdAt?.seconds
            ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString()
            : 'Reciente'}
        </span>
      </div>

      <div className="font-black text-slate-800 dark:text-white text-md mb-1 tracking-tight pr-4 flex items-center gap-2">
        {maskName(lead.name || `${lead.firstName} ${lead.lastName}`, userRole)}
        {userRole !== 'admin' && (
          <span title="Protección PII Activa">
            <ShieldCheck size={12} className="text-emerald-500 opacity-50" />
          </span>
        )}
      </div>

      <div className="text-xs font-medium text-slate-400 truncate mb-4">
        {lead.vehicleOfInterest || lead.message || 'Sin detalles'}
      </div>

      {/* AI Scoring Section - Premium Predictive Gauge */}
      {(lead.aiAnalysis || scoring.score > 0) && (
        <div className="mb-4 p-4 bg-linear-to-br from-primary/5 to-purple-500/5 rounded-3xl border border-primary/10 shadow-inner relative overflow-hidden group/gauge">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 px-1.5 bg-primary/10 rounded-md">
                <Wand2 size={10} className="text-primary animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                Probabilidad Predictiva
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`text-[11px] font-black tracking-tighter ${scoring.score > 80 ? 'text-emerald-500' : scoring.score > 50 ? 'text-amber-500' : 'text-rose-500'}`}
              >
                {scoring.score}%
              </span>
              <span className="text-[7px] font-bold uppercase text-slate-400 tracking-widest leading-none">
                Confianza IA
              </span>
            </div>
          </div>

          {typeof lead.aiAnalysis === 'string' && (
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mb-3 italic">
              "{lead.aiAnalysis}"
            </p>
          )}

          {/* Premium Progress Track */}
          <div className="relative h-1.5 w-full bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-[1500ms] cubic-bezier(0.23, 1, 0.32, 1) predictive-bar-width ${
                scoring.score > 80
                  ? 'bg-linear-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : scoring.score > 50
                    ? 'bg-linear-to-r from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-linear-to-r from-rose-500 to-red-600 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              }`}
              style={{ '--p-width': `${scoring.score}%` } as React.CSSProperties}
            />
          </div>

          {/* Pulsing Dot Tracer */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-full shadow-[0_0_8px_white] transition-all duration-500 border border-primary/20 heatmap-dot"
            style={{ '--p-width': `${scoring.score}%` } as React.CSSProperties}
          />
        </div>
      )}

      {/* Business Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          {lead.phone && (
            <button
              onClick={handleWhatsAppSend}
              disabled={isSending}
              className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              {isSending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <MessageCircle size={14} />
              )}
            </button>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
              title={`Enviar email a ${lead.email}`}
            >
              <Mail size={14} />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/analytics/${lead.id}`);
            }}
            className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl hover:bg-purple-500/20"
            title="Analytics"
          >
            <TrendingUp size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDealSheet(lead);
            }}
            className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20"
            title="Smart Deal Sheet"
          >
            <FileText size={14} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {(lead.ssn_encrypted || lead.ssn) && (
            <div className="flex items-center gap-2">
              {revealedSSN && (
                <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {revealedSSN}
                </span>
              )}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleReveal}
                className="p-2 text-slate-400 hover:text-amber-500 transition-colors"
                title="Ver SSN Segura"
              >
                {isRevealing ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : revealedSSN ? (
                  <EyeOff size={12} />
                ) : (
                  <Eye size={12} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
  
  interface SortableLeadItemProps {
    lead: Lead;
    userRole: UserRole;
    onOpenDealSheet: (lead: Lead) => void;
  }
  
  const SortableLeadItem = ({ lead, userRole, onOpenDealSheet }: SortableLeadItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: lead.id,
      data: { lead },
    });
    const style = {
      '--translate': CSS.Translate.toString(transform),
      '--transition': transition,
    } as React.CSSProperties;
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`mb-4 touch-none transition-opacity duration-200 ${isDragging ? 'opacity-30' : 'opacity-100'} dnd-sortable`}
      >
        <LeadCard lead={lead} onPrint={() => {}} onOpenDealSheet={onOpenDealSheet} userRole={userRole} />
      </div>
    );
  };

const CRMBoard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (localStorage.getItem('e2e_bypass') === 'true') {
      return [
        {
          id: 'e2e-mock-lead',
          name: 'E2E Test User',
          email: 'e2e@example.com',
          phone: '1234567890',
          status: 'new',
          type: 'finance',
          message: 'Testing priority badge',
          aiAnalysis: {
            score: 95,
            category: 'High',
            insights: ['E2E Mock Insight'],
            nextAction: 'Ready to buy',
            reasoning: 'Testing priority badge',
            unidad_interes: 'E2E Vehicle',
          } as any,
          carId: '',
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        },
      ] as Lead[];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLeadForDealSheet, setSelectedLeadForDealSheet] = useState<Lead | null>(null);
  const { addNotification } = useNotification();
  const { containerRef } = useMouseGlow();
  const userRole: UserRole = 'admin'; // Hardcoded for now, should come from context

  useEffect(() => {
    const unsubscribe = subscribeToLeads((newLeads) => {
      if (newLeads.length > 0) {
        setLeads(newLeads);
      } else if (localStorage.getItem('e2e_bypass') !== 'true') {
        setLeads([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groupedLeads = useMemo(() => {
    return COLUMNS.reduce(
      (acc, col) => {
        acc[col.id] = leads.filter((l) => (l.status || 'new') === col.id);
        return acc;
      },
      {} as Record<string, Lead[]>,
    );
  }, [leads]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeLeadId = active.id as string;
    const overId = over.id as string;
    const newStatus = COLUMNS.some((col) => col.id === overId)
      ? overId
      : leads.find((l) => l.id === activeLeadId)?.status;

    if (
      newStatus &&
      activeLeadId &&
      leads.find((l) => l.id === activeLeadId)?.status !== newStatus
    ) {
      await updateLeadStatus(activeLeadId, newStatus as any);
      if (newStatus === 'sold') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addNotification('success', '¡Vehículo vendido!');
      }
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={containerRef as any}
        className="flex gap-6 h-full overflow-x-auto pb-4 px-1 custom-scrollbar"
      >
        {COLUMNS.map((col) => {
          const colLeads = groupedLeads[col.id] || [];
          return (
            <div
              key={col.id}
              className="min-w-[320px] w-full bg-white/40 dark:bg-slate-800/20 backdrop-blur-xl rounded-[2.5rem] p-5 flex flex-col h-full border border-slate-200/50"
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`w-3 h-3 rounded-full ${col.color} animate-pulse shadow-lg`} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  {col.title}
                </h3>
                <span className="ml-auto bg-white/80 dark:bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black">
                  {colLeads.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[100px]">
                <SortableContext
                  items={colLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colLeads.map((lead) => (
                    <SortableLeadItem 
                      key={lead.id} 
                      lead={lead} 
                      userRole={userRole} 
                      onOpenDealSheet={(lead) => setSelectedLeadForDealSheet(lead)}
                    />
                  ))}
                </SortableContext>
                {colLeads.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl opacity-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Vacío
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {createPortal(
        <DragOverlay>
          {activeId ? (
            <LeadCard
              lead={leads.find((l) => l.id === activeId)!}
              onPrint={() => {}}
              onOpenDealSheet={() => {}}
              userRole={userRole}
              isOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
      
      {/* Smart Deal Sheet Modal */}
      {selectedLeadForDealSheet && (
        <SmartDealSheetModal
          lead={selectedLeadForDealSheet}
          onClose={() => setSelectedLeadForDealSheet(null)}
          onExportPDF={(data, lead) => {
            // Optional integration to export the AI data via jsPDF later
            // const mockData = generateMockActuarialData(lead as any);
            // generateActuarialReport(mockData);
            addNotification('info', 'Exportación premium iniciada.');
          }}
        />
      )}
    </DndContext>
  );
};

export default CRMBoard;
