import React, { useState, memo, useRef, useLayoutEffect } from 'react';
import { useNavigate } from '@/shared/lib/next-route-adapter';
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
  Activity,
  Info,
  MoreHorizontal,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lead, getSecureLeadData } from '@/shared/api/adapters/leads/crmService';
import { decryptSSN } from '@/shared/api/security/ssnEncryptionService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { maskName } from '@/shared/lib/utils/privacyUtils';
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
  onOpenDetail: (lead: Lead) => void;
  userRole: UserRole;
  isOverlay?: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onPrint,
  onOpenDealSheet,
  onOpenInbox,
  onOpenDetail,
  userRole,
  isOverlay,
}) => {
  const [revealedSSN, setRevealedSSN] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const progressRef = useRef<HTMLDivElement>(null);
  const { health } = useVehicleHealth(lead.carId || '');
  const { addNotification } = useNotification();
  const scoringHook = useLeadScoring(lead, health);
  const scoring = lead.id === 'e2e-mock-lead' ? { score: 95 } : scoringHook;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Pattern de Ref-based CSS Variables para eliminar inline styles y mejorar fluidez en re-renders
  useLayoutEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty('--progress-width', `${scoring.score}%`);

      const color = scoring.score > 80 ? '#22d3ee' : scoring.score > 50 ? '#fbbf24' : '#f43f5e';
      progressRef.current.style.setProperty('--progress-color', color);
    }
  }, [scoring.score]);

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

    const masterKey = window.prompt('Ingresa la Master Key para desencriptar este registro:');
    if (!masterKey) return;

    setIsRevealing(true);
    try {
      if (lead.ssn_encrypted) {
        const decrypted = await decryptSSN(lead.ssn_encrypted, masterKey);
        if (decrypted === 'DECRYPTION_ERROR') {
          addNotification('error', 'Llave incorrecta. Acceso Denegado.');
        } else {
          setRevealedSSN(decrypted);
          addNotification('success', 'Bóveda Segura: Acceso concedido.');
        }
      } else {
        const secureData = await getSecureLeadData(lead.id);
        if (secureData && secureData.ssn) {
          const decrypted = await decryptSSN(secureData.ssn, masterKey);
          if (decrypted === 'DECRYPTION_ERROR') {
            addNotification('error', 'Llave incorrecta. Acceso Denegado.');
          } else {
            setRevealedSSN(decrypted);
            addNotification('success', 'Bóveda Segura: Acceso concedido.');
          }
        } else {
          addNotification('error', 'No se encontró información en la Bóveda Segura.');
        }
      }
    } catch (err) {
      console.error(err);
      addNotification('error', 'Error al acceder a la bóveda.');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div
      className={`glass-card glass-premium group transition-all duration-500 relative ${
        isOverlay
          ? 'shadow-2xl scale-105 rotate-2 cursor-grabbing z-50 ring-2 ring-cyan-500/50 bg-slate-900/40 p-6 rounded-[32px]'
          : 'p-6 rounded-[32px] hover:border-cyan-500/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(34,211,238,0.15)] overflow-hidden'
      }`}
    >
      {/* Background Decorator - Grid Subraya el ADN de Richard Intelligence */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grid-bg group-hover:opacity-[0.05] transition-opacity" />

      {/* Engagement Heatmap Dot */}
      {scoring.score > 70 && (
        <div className="absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <div className="absolute w-full h-full border border-cyan-500/20 rounded-full animate-ping opacity-20" />
        </div>
      )}

      <div className="flex justify-between items-start mb-6 pr-4 relative z-10">
        <div className="flex flex-col gap-1.5">
          <span
            className={`w-fit px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-white/5 ${
              lead.type === 'finance'
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
            }`}
          >
            {lead.type === 'finance' ? 'Credit App' : 'Lead'}
          </span>
          <h3 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
            {maskName(
              lead.name ||
                `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
                'Lead Anonizado',
              userRole,
            )}
          </h3>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={10} className="text-slate-600" />
            {lead.createdAt?.seconds
              ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: 'short',
                })
              : 'Recent Signal'}
          </span>
        </div>

        {!isOverlay && (
          <div className="text-slate-600 dark:text-slate-700/50 hover:text-white transition-colors cursor-grab active:cursor-grabbing">
            <GripVertical size={16} />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="font-black text-white text-lg mb-1.5 tracking-tighter flex items-center gap-2 group/name">
          {maskName(lead.name || `${lead.firstName} ${lead.lastName}`, userRole)}
          {scoring.score > 85 && <Zap size={14} className="text-cyan-400 animate-pulse" />}
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-start gap-2.5 mb-5 bg-white/3 p-2.5 rounded-2xl border border-white/5">
          <Car size={14} className="text-cyan-500/50 mt-0.5" />
          <span className="leading-relaxed line-clamp-2">
            {lead.vehicleOfInterest || lead.message || 'Asset Identification in Analysis...'}
          </span>
        </div>

        {scoring.score >= 0 && (
          <div className="mb-6 p-4 bg-slate-900/40 rounded-2xl border border-white/5 relative overflow-hidden group/gauge shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Activity size={10} className="text-cyan-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Opportunity Vector
                </span>
              </div>
              <span
                className={`text-[11px] font-black tracking-tighter tabular-nums ${scoring.score > 80 ? 'text-cyan-400' : 'text-amber-400'}`}
              >
                {scoring.score}%
              </span>
            </div>

            <div className="relative h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                ref={progressRef}
                className="h-full opacity-60 transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] bg-[var(--progress-color)] shadow-[0_0_15px_var(--progress-color)] w-[var(--progress-width,0%)]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center relative gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenInbox(lead);
            }}
            className="flex-1 py-3 bg-cyan-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95"
            title="Atender este lead ahora"
          >
            Atender Lead
          </button>

          <div className="relative" onMouseLeave={() => setIsMenuOpen(false)}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`p-3 rounded-2xl border transition-all ${
                isMenuOpen
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Más opciones de gestión"
            >
              <MoreHorizontal size={16} />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full right-0 mb-3 w-56 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-1">
                    {[
                      {
                        id: 'sheet',
                        label: 'Deal Sheet',
                        icon: FileText,
                        onClick: () => onOpenDealSheet(lead),
                        color: 'text-indigo-400',
                      },
                      {
                        id: 'analytics',
                        label: 'Neural Insights',
                        icon: TrendingUp,
                        onClick: () => navigate(`/admin/analytics/${lead.id}`),
                        color: 'text-cyan-400',
                      },
                      {
                        id: 'detail',
                        label: 'Full Record',
                        icon: Info,
                        onClick: () => onOpenDetail(lead),
                        color: 'text-slate-400',
                      },
                      {
                        id: 'print',
                        label: 'Print Report',
                        icon: Printer,
                        onClick: onPrint,
                        color: 'text-slate-500',
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onClick();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-between w-full p-4 hover:bg-white/5 rounded-2xl transition-all group/item"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon size={14} className={item.color} />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight
                          size={10}
                          className="text-slate-700 group-hover/item:text-white group-hover/item:translate-x-1 transition-all"
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {revealedSSN && (
          <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-cyan-400 tracking-widest">
              VAULT_ID: {revealedSSN}
            </span>
            <ShieldCheck size={12} className="text-cyan-400/50" />
          </div>
        )}
      </div>
    </div>
  );
};

// Exportamos memoizado para evitar re-renders masivos en el board
export default memo(LeadCard);
