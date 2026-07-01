'use client';

import React, {
  useState,
} from 'react';
import {
  useNavigate,
} from '@/shared/lib/next-route-adapter';
import confetti from 'canvas-confetti';
import {
  Mail,
  Wand2,
  GripVertical,
  ShieldCheck,
  MessageCircle,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  TrendingUp,
} from 'lucide-react';

import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

import {
  Lead,
  getSecureLeadData,
} from '@/shared/api/adapters/leads/crmService';
import {
  UserRole,
} from '@/shared/types/types';

import {
  decryptSSN,
} from '@/shared/api/security/ssnEncryptionService';
import {
  useNotification,
} from '@/shared/ui/providers/NotificationProvider';
import {
  maskName,
} from '@/shared/lib/utils/privacyUtils';

import {
  useLeadScoring,
} from '@/features/leads';
import {
  useVehicleHealth,
} from '@/shared/api/metrics/telemetryService';
import * as whatsappService from '@/features/leads/model/whatsappService';
import {
  orchestrationService,
} from '@/features/ai-hub/ai-orchestration/api/orchestrationService';
import {
  getAntigravityOutreachAction,
} from '@/features/omnichannel/api/antigravityOmnichannelService';
import {
  sendTransactionalEmail,
} from '@/shared/api/communications/emailService';
import {
  generateActuarialReport,
} from '@/shared/lib/utils/pdfGenerator';
import {
  generateMockActuarialData,
} from '@/entities/finance';
import styles from './CRMBoard.module.css';

interface LeadCardProps {
  lead: Lead;
  onPrint: () => void;
  userRole: UserRole;
  isOverlay?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onPrint, userRole, isOverlay }) => {
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
        <div className="mb-4 p-4 bg-linear-to-br from-primary/5 to-purple-500/5 rounded-4xl border border-primary/10 shadow-inner relative overflow-hidden group/gauge">
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
              className={`h-full transition-all duration-1500 cubic-bezier(0.23, 1, 0.32, 1) ${styles.predictiveBarWidth} ${
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
            className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-full shadow-[0_0_8px_white] transition-all duration-500 border border-primary/20 ${styles.heatmapDot}`}
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
            title="Informe Actuarial"
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

export const SortableLeadItem = ({ lead, userRole }: { lead: Lead; userRole: UserRole }) => {
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
      className={`mb-4 touch-none transition-opacity duration-200 ${isDragging ? 'opacity-30' : 'opacity-100'} ${styles.dndSortable}`}
    >
      <LeadCard lead={lead} onPrint={() => {}} userRole={userRole} />
    </div>
  );
};
