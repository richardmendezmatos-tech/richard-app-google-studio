'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  RefreshCcw,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
} from 'lucide-react';

interface SequenceStep {
  key: string;
  label: string;
  series: string;
  timing: string;
  desc: string;
  totalSent: number;
  lastSent: string | null;
  recentRecipients: { id: string; name: string; email: string; sentAt: string }[];
}

interface LeadSequence {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  emailSequence: Record<string, string>;
}

interface SequenceData {
  sequences: SequenceStep[];
  leadSequences: LeadSequence[];
  totalLeads: number;
  totalWithEmail: number;
}

const CARD_CLASSES =
  'relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/10 transition-all duration-500';

const SERIES_COLORS: Record<string, string> = {
  Bienvenida: 'border-l-cyan-500',
  'Re-Compromiso': 'border-l-amber-500',
  'Post-Cita': 'border-l-emerald-500',
};

const SERIES_ACCENTS: Record<string, string> = {
  Bienvenida: 'text-cyan-400 bg-cyan-500/10',
  'Re-Compromiso': 'text-amber-400 bg-amber-500/10',
  'Post-Cita': 'text-emerald-400 bg-emerald-500/10',
};

export default function EmailSequencesPage() {
  const [data, setData] = useState<SequenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadSequence | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing/email-sequences');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('[EmailSequences] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isLoading = loading || !data;

  const totalSent = isLoading
    ? 0
    : data.sequences.reduce((sum, s) => sum + s.totalSent, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative">
      <div className="scanline-overlay" />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1
                className="text-lg font-black uppercase tracking-[0.25em]"
                style={{ fontFamily: 'var(--font-cinematic)' }}
              >
                Secuencias de <span className="text-blue-400">Email</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase font-bold">
                10 secuencias • {isLoading ? '...' : `${data.totalLeads} leads`}
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard
            icon={<Mail className="w-5 h-5" />}
            label="Total Enviados"
            value={isLoading ? '—' : totalSent}
            accent="blue"
          />
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label="Leads con Email"
            value={isLoading ? '—' : data.totalWithEmail}
            accent="cyan"
          />
          <KPICard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Series Activas"
            value={isLoading ? '—' : 3}
            accent="emerald"
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Secuencias"
            value={isLoading ? '—' : 10}
            accent="violet"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-cyan-500/10">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="font-bold text-sm">Serie de Bienvenida</h2>
            </div>
            {renderSeriesSteps('Bienvenida')}
          </motion.div>

          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="font-bold text-sm">Serie de Re-Compromiso</h2>
            </div>
            {renderSeriesSteps('Re-Compromiso')}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="font-bold text-sm">Serie Post-Cita</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {renderSeriesStepsFlat('Post-Cita')}
            </div>
          </motion.div>
        </div>

        {expandedStep && data && (
          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-500/10">
                  <Eye className="w-5 h-5 text-slate-400" />
                </div>
                <h2 className="font-bold text-sm">
                  {data.sequences.find((s) => s.key === expandedStep)?.label}
                </h2>
              </div>
              <button
                onClick={() => setExpandedStep(null)}
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <th className="pb-3 pr-4">Lead</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3">Enviado</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leadSequences
                    .filter((l) => l.emailSequence[expandedStep])
                    .slice(0, 20)
                    .map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-white/[0.02] text-xs hover:bg-white/[0.02] cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="py-3 pr-4 font-medium">{lead.name || 'Sin nombre'}</td>
                        <td className="py-3 pr-4 text-slate-400">{lead.email}</td>
                        <td className="py-3 pr-4">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-500/10 text-slate-400">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">
                          {new Date(lead.emailSequence[expandedStep]).toLocaleDateString('es-PR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {selectedLead && (
          <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}

        <div className="hidden md:flex p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl items-center justify-center gap-3">
          <Mail className="w-4 h-4 text-blue-400" />
          <p className="text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
            10 secuencias de email automatizadas • Richard Automotive
          </p>
        </div>
      </main>
    </div>
  );

  function renderSeriesSteps(series: string) {
    if (!data) return null;
    const steps = data.sequences.filter((s) => s.series === series);
    return (
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={step.key}>
            <button
              onClick={() => setExpandedStep(expandedStep === step.key ? null : step.key)}
              className="w-full flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/[0.04] hover:border-white/10 transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 text-[10px] font-black text-slate-400">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-bold group-hover:text-white transition-colors">
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500">{step.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums">{step.totalSent}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider">{step.timing}</p>
                </div>
                {expandedStep === step.key ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    );
  }

  function renderSeriesStepsFlat(series: string) {
    if (!data) return null;
    const steps = data.sequences.filter((s) => s.series === series);
    return steps.map((step, i) => (
      <button
        key={step.key}
        onClick={() => setExpandedStep(expandedStep === step.key ? null : step.key)}
        className="p-4 bg-slate-800/30 rounded-xl border border-white/[0.04] hover:border-white/10 transition-all text-left group"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-700/50 text-[9px] font-black text-slate-400">
            {i + 1}
          </div>
          <p className="text-xs font-bold group-hover:text-white transition-colors">{step.label}</p>
        </div>
        <p className="text-[10px] text-slate-500 mb-2">{step.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold tabular-nums">{step.totalSent}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider">{step.timing}</span>
        </div>
      </button>
    ));
  }
}

function KPICard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/10 border-blue-500/10 text-blue-400',
    cyan: 'from-cyan-500/10 border-cyan-500/10 text-cyan-400',
    emerald: 'from-emerald-500/10 border-emerald-500/10 text-emerald-400',
    violet: 'from-violet-500/10 border-violet-500/10 text-violet-400',
  };
  const colors = colorMap[accent] || colorMap.blue;

  return (
    <motion.div
      className={`relative bg-linear-to-br ${colors.split(' ')[0]} to-slate-900/60 backdrop-blur-xl border ${colors.split(' ')[1]} rounded-2xl p-5 overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`mb-3 ${colors.split(' ')[2]}`}>{icon}</div>
      <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-widest mb-1 truncate">
        {label}
      </p>
      <p
        className="text-2xl sm:text-3xl font-black tabular-nums truncate"
        style={{ fontFamily: 'var(--font-cinematic)' }}
      >
        {value}
      </p>
    </motion.div>
  );
}

function LeadDetailModal({
  lead,
  onClose,
}: {
  lead: LeadSequence;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-sm">{lead.name || 'Lead sin nombre'}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xs"
          >
            Cerrar
          </button>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between p-3 bg-slate-800/30 rounded-xl">
            <span className="text-slate-400">Email</span>
            <span className="font-medium">{lead.email || '—'}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-800/30 rounded-xl">
            <span className="text-slate-400">Teléfono</span>
            <span className="font-medium">{lead.phone || '—'}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-800/30 rounded-xl">
            <span className="text-slate-400">Estado</span>
            <span className="font-medium capitalize">{lead.status}</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-800/30 rounded-xl">
            <span className="text-slate-400">Creado</span>
            <span className="font-medium">
              {lead.createdAt
                ? new Date(lead.createdAt).toLocaleDateString('es-PR')
                : '—'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
            Secuencias Recibidas
          </h4>
          <div className="space-y-2">
            {Object.entries(lead.emailSequence).map(([key, date]) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 bg-slate-800/20 rounded-lg"
              >
                <span className="text-[10px] text-slate-400">{key}</span>
                <span className="text-[10px] text-slate-300">
                  {new Date(date).toLocaleDateString('es-PR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
            {Object.keys(lead.emailSequence).length === 0 && (
              <p className="text-[10px] text-slate-600 text-center py-4">
                Ninguna secuencia recibida
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
