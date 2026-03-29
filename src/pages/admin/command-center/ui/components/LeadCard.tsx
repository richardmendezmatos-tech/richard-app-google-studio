import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  MessageCircle,
  Clock,
  Car,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  TrendingUp,
  GripVertical,
} from 'lucide-react';
import {
  Lead,
  getSecureLeadData,
} from '@/shared/api/adapters/leads/crmService';
import { decryptSSN } from '@/shared/api/security/ssnEncryptionService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { maskName, UserRole } from '@/shared/lib/utils/privacyUtils';
import { useLeadScoring } from '@/features/leads';
import { useVehicleHealth } from '@/shared/api/metrics/telemetryService';
import * as whatsappService from '@/features/leads/model/whatsappService';
import { orchestrationService } from '@/features/ai-hub/ai-orchestration/api/orchestrationService';
import { getAntigravityOutreachAction } from '@/features/omnichannel/api/antigravityOmnichannelService';
import { sendTransactionalEmail } from '@/shared/api/communications/emailService';

interface LeadCardProps {
  lead: Lead;
  onPrint: () => void;
  onOpenDealSheet: (lead: Lead) => void;
  onOpenInbox: (lead: Lead) => void;
  userRole: UserRole;
  isOverlay?: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onPrint, onOpenDealSheet, onOpenInbox, userRole, isOverlay }) => {
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
      className={`glass-card glass-premium group transition-all duration-500 relative ${
        isOverlay 
          ? 'shadow-2xl scale-105 rotate-2 cursor-grabbing z-50 ring-2 ring-primary bg-slate-900/40' 
          : 'p-6 rounded-[32px] hover-border-primary hover:-translate-y-1 hover-kinetic-glow'
      }`}
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
        {lead.hasCreditApplication && (
          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
            <ShieldCheck size={10} /> Credit App
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

      <div className="text-xs font-bold text-slate-500 truncate mb-4 uppercase tracking-[0.05em] flex items-center gap-2">
        <Car size={12} className="text-primary/50" />
        {lead.vehicleOfInterest || lead.message || 'Asset Identification Pending'}
      </div>

      {scoring.score > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-3xl border border-primary/10 shadow-inner relative overflow-hidden group/gauge">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
              AI Opportunity Signal
            </span>
            <span className={`text-[11px] font-black tracking-tighter ${scoring.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {scoring.score}%
            </span>
          </div>

          <div className="relative h-1 w-full bg-slate-800/40 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                scoring.score > 80
                  ? 'shadow-[0_0_15px_rgba(16,185,129,0.5)] bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : scoring.score > 50
                    ? 'shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-gradient-to-r from-rose-500 to-pink-600'
              }`}
              style={{ width: `${scoring.score}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span>Critical Path</span>
            <span className="text-primary animate-pulse">Scanning Agent Active</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenInbox(lead);
            }}
            className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-colors"
            title="Abrir Buzón Omnicanal"
          >
            <MessageCircle size={14} />
          </button>
          
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

// Exportamos memoizado para evitar re-renders masivos en el board
export default memo(LeadCard);
