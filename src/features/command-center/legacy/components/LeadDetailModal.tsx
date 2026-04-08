"use client";

"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Car,
  BadgeDollarSign,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  MessageSquare,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Lead, getSecureLeadData } from '@/shared/api/adapters/leads/crmService';
import { decryptSSN } from '@/shared/api/security/ssnEncryptionService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  const [revealedSSN, setRevealedSSN] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const { addNotification } = useNotification();

  if (!lead) return null;

  const handleRevealSSN = async () => {
    if (revealedSSN) {
      setRevealedSSN(null);
      return;
    }

    const masterKey = window.prompt(
      'Ingresa la Master Key para acceder a este SSN (Richard Intelligence Vault):',
    );
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
        if (secureData?.ssn) {
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
      addNotification('error', 'Fallo crítico en el sistema de seguridad.');
    } finally {
      setIsRevealing(false);
    }
  };

  const isFinance = lead.type === 'finance';
  const data = lead as any; // Cast for accessing dynamic fields not in base Lead type

  const InfoRow = ({ icon: Icon, label, value, color = 'text-slate-400' }: any) => (
    <div className="flex items-center gap-4 p-4 bg-white/3 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-white">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-premium border border-white/10 rounded-[2.5rem] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isFinance ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}
              >
                {isFinance ? <BadgeDollarSign size={28} /> : <FileText size={28} />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {lead.name ||
                      `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
                      'Lead Anonizado'}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isFinance ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'}`}
                  >
                    {isFinance ? 'Credit Application' : 'General Lead'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-bold flex items-center gap-2">
                  <Calendar size={12} />{' '}
                  {lead.createdAt?.seconds
                    ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString()
                    : 'Fecha Desconocida'}
                  <span className="opacity-20">|</span>
                  ID: <span className="font-mono">{lead.id.slice(0, 8)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar expediente"
              title="Cerrar expediente"
              className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Info */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <User size={14} className="text-cyan-500" /> Identidad y Contacto
                </h3>
                <InfoRow
                  icon={Mail}
                  label="Email Address"
                  value={lead.email}
                  color="text-cyan-400"
                />
                <InfoRow
                  icon={Phone}
                  label="Mobile Number"
                  value={lead.phone}
                  color="text-emerald-400"
                />

                <div className="p-4 bg-white/3 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Secure Vault (SSN)
                    </p>
                    <button
                      onClick={handleRevealSSN}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black text-cyan-400 transition-all flex items-center gap-2"
                    >
                      {isRevealing ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : revealedSSN ? (
                        <EyeOff size={10} />
                      ) : (
                        <Eye size={10} />
                      )}
                      {revealedSSN ? 'HIDE VAULT' : 'REVEAL SSN'}
                    </button>
                  </div>
                  <p className="text-sm font-mono font-bold text-white tracking-[0.3em]">
                    {revealedSSN || '•••-••-••••'}
                  </p>
                  {revealedSSN && (
                    <ShieldCheck size={14} className="absolute bottom-4 right-4 text-cyan-500" />
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Car size={14} className="text-cyan-500" /> Asset Interest
                  </h3>
                  <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/10">
                    <h4 className="text-lg font-black text-white mb-2">
                      {lead.vehicleOfInterest || 'No Unit Selected'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "{lead.message || 'Customer initiated contact via RA Intelligent Form.'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial / Credit Info */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <BadgeDollarSign size={14} className="text-indigo-500" /> Financial Intelligence
                </h3>

                {isFinance ? (
                  <>
                    <InfoRow
                      icon={BadgeDollarSign}
                      label="Monthly Income"
                      value={
                        data.monthlyIncome
                          ? `$${Number(data.monthlyIncome).toLocaleString()}`
                          : 'N/A'
                      }
                      color="text-indigo-400"
                    />
                    <InfoRow
                      icon={Briefcase}
                      label="Employment Status"
                      value={data.employmentStatus}
                      color="text-amber-400"
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Time in Job"
                      value={data.timeAtJob}
                      color="text-slate-400"
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-white/2 rounded-[2rem] border border-dashed border-white/10 opacity-60">
                    <MessageSquare size={48} className="text-slate-700 mb-4" />
                    <p className="text-sm font-bold text-slate-500 text-center">
                      Standard Inquiry Profile
                    </p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">
                      Extended Finance Data N/A
                    </p>
                  </div>
                )}

                {/* Predictive Vector Module */}
                {(data.predictiveScore || data.aiAnalysis || data.aiScore) && (
                  <div className="mt-8 p-6 bg-slate-900/60 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Activity size={16} className="text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Houston Predictive Vector
                        </span>
                      </div>
                      <span className="text-2xl font-black text-cyan-400 tracking-tighter">
                        {data.predictiveScore || data.aiAnalysis?.score || lead.aiScore || 0}
                        <span className="text-lg opacity-50 ml-1">%</span>
                      </span>
                    </div>
                    <div className="space-y-4">
                      {(
                        data.predictiveInsights?.factors ||
                        data.aiAnalysis?.insights || [
                          'Scoring Baseline Asignado',
                          'Evaluación inicial en progreso',
                        ]
                      ).map((insight: string, i: number) => (
                        <div
                          key={i}
                          className="flex gap-3 items-start text-[11px] font-bold text-slate-400 leading-relaxed"
                        >
                          <ArrowRight size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                          <span>{insight}</span>
                        </div>
                      ))}
                    </div>

                    {(data.recommendedAction || data.predictiveInsights?.recommendedAction) && (
                      <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-start gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-lg">
                          <ShieldCheck size={16} className="text-cyan-400" />
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block mb-1">
                            Recommended Action
                          </span>
                          <span className="text-xs text-white font-bold">
                            {data.recommendedAction || data.predictiveInsights?.recommendedAction}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-white/2 border-t border-white/5 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Close Record
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadDetailModal;
