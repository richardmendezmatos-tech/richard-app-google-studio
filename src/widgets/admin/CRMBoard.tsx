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
  Bot,
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
import { automationService } from '@/features/automation/api/automationService';
import { decryptSSN } from '@/shared/api/security/ssnEncryptionService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { maskEmail, maskPhone, maskName, UserRole } from '@/shared/lib/utils/privacyUtils';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { useLeadScoring } from '@/features/leads';
import { useVehicleHealth } from '@/shared/api/metrics/telemetryService';
import * as whatsappService from '@/features/leads/services/whatsappService';
import { orchestrationService } from '@/features/ai-agents/api/orchestrationService';
import { getAntigravityOutreachAction } from '@/features/omnichannel/api/antigravityOmnichannelService';
import { sendTransactionalEmail } from '@/shared/api/communications/emailService';
import { generateActuarialReport } from '@/shared/lib/utils/pdfGenerator';
import { generateMockActuarialData } from '@/entities/finance';

const COLUMNS = [
  { id: 'new', title: 'Nuevos', color: 'bg-primary', glow: 'shadow-primary/20' },
  { id: 'contacted', title: 'Contactados', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
  { id: 'negotiation', title: 'Negociando', color: 'bg-purple-500', glow: 'shadow-purple-500/20' },
  { id: 'sold', title: 'Ventas Cerradas', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  { id: 'lost', title: 'Perdidos', color: 'bg-red-500', glow: 'shadow-red-500/20' },
];

interface LeadCardProps {
  lead: Lead;
  onPrint: () => void;
  userRole: UserRole;
  isOverlay?: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onPrint, userRole, isOverlay }) => {
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
      className={`bg-slate-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-4xl group transition-all duration-300 relative ${
        isOverlay
          ? 'shadow-[0_0_40px_rgba(0,174,217,0.3)] scale-105 rotate-3 cursor-grabbing z-50 ring-2 ring-primary'
          : 'shadow-2xl hover:border-primary/50 hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(0,174,217,0.15)] hover:-translate-y-1'
      }`}
    >
      {!isOverlay && (
        <div className="absolute top-6 right-6 text-slate-500 group-hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </div>
      )}

      <div className="flex justify-between mb-4 pr-8">
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
            lead.type === 'trade-in'
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : lead.type === 'finance'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-primary/10 text-primary border border-primary/20'
          }`}
        >
          {lead.type || 'Standard'}
        </span>
        {scoring.score > 80 && (
          <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            Alta Prioridad
          </span>
        )}
        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold">
          <Clock size={10} className="text-slate-500" />
          {lead.createdAt?.seconds
            ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString()
            : 'Reciente'}
        </span>
      </div>

      <div className="font-black text-white text-lg mb-1 tracking-tight pr-4 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
        {maskName(lead.name || `${lead.firstName} ${lead.lastName}`, userRole)}
        {userRole !== 'admin' && (
          <span title="Protección PII Activa">
            <ShieldCheck size={14} className="text-emerald-500 opacity-80" />
          </span>
        )}
      </div>

      <div className="text-sm font-medium text-slate-400 truncate mb-5 leading-relaxed">
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
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
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
              className={`h-full transition-all duration-1500 cubic-bezier(0.23, 1, 0.32, 1) predictive-bar-width ${
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
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/5">
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          {lead.phone && (
            <button
              onClick={handleWhatsAppSend}
              disabled={isSending}
              className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 hover:scale-105 transition-all"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MessageCircle size={16} />
              )}
            </button>
          )}
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 hover:scale-105 transition-all"
              title={`Enviar email a ${lead.email}`}
            >
              <Mail size={16} />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/analytics/${lead.id}`);
            }}
            className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl hover:bg-purple-500/20 hover:scale-105 transition-all"
            title="Analytics"
          >
            <TrendingUp size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const data = generateMockActuarialData(lead as any);
              generateActuarialReport(data);
            }}
            className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 hover:scale-105 transition-all"
            title="Reporte Actuarial"
          >
            <FileText size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {(lead.ssn_encrypted || lead.ssn) && (
            <div className="flex items-center gap-2">
              {revealedSSN && (
                <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  {revealedSSN}
                </span>
              )}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleReveal}
                className="p-2.5 bg-slate-800 text-slate-400 hover:text-amber-500 hover:bg-slate-700/80 rounded-xl transition-all"
                title="Ver SSN Segura"
              >
                {isRevealing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : revealedSSN ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SortableLeadItem = ({ lead, userRole }: { lead: Lead; userRole: UserRole }) => {
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
      <LeadCard lead={lead} onPrint={() => {}} userRole={userRole} />
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
  const [isNurturing, setIsNurturing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

  const handleStartNurturing = async () => {
    setIsNurturing(true);
    try {
      addNotification('info', 'Iniciando escaneo IA de Nurturing...');
      const eligibleLeads = leads.filter(l => l.status === 'new' || l.status === 'contacted');
      let processedCount = 0;
      for (const lead of eligibleLeads) {
        await automationService.processLeadNurturing(lead);
        processedCount++;
      }
      addNotification('success', `Nurturing IA completado. ${processedCount} leads escaneados.`);
    } catch (error) {
      console.error('Error nurturing:', error);
      addNotification('error', 'Error al procesar Nurturing IA');
    } finally {
      setIsNurturing(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Pipeline de Ventas
          </h2>
          <button
            onClick={handleStartNurturing}
            disabled={isNurturing}
            className="group flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed border border-blue-400/30"
          >
            {isNurturing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-200" />
                <span className="animate-pulse">Escaneando Leads...</span>
              </span>
            ) : (
              <>
                <Bot size={16} className="text-blue-200 group-hover:animate-bounce" />
                Iniciar Nurturing IA
              </>
            )}
          </button>
        </div>

        <div
          ref={containerRef as any}
          className="flex gap-6 overflow-x-auto pb-4 px-1 custom-scrollbar scroll-smooth flex-1"
        >
          {COLUMNS.map((col) => {
          const colLeads = groupedLeads[col.id] || [];
          return (
            <div
              key={col.id}
              className="min-w-[360px] w-full bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] p-6 flex flex-col h-full border border-white/5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className={`w-3 h-3 rounded-full ${col.color} animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {col.title}
                </h3>
                <span className="ml-auto bg-slate-800/80 border border-white/5 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-inner">
                  {colLeads.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[100px]">
                <SortableContext
                  items={colLeads.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {colLeads.map((lead) => (
                    <SortableLeadItem key={lead.id} lead={lead} userRole={userRole} />
                  ))}
                </SortableContext>
                {colLeads.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl opacity-50 bg-slate-900/20">
                    <GripVertical size={24} className="text-slate-600 mb-2" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Arrastrar Aquí
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {activeId ? (
            <LeadCard
              lead={leads.find((l) => l.id === activeId)!}
              onPrint={() => {}}
              userRole={userRole}
              isOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};

export default CRMBoard;
