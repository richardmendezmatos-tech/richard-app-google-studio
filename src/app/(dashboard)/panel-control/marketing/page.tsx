'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Newspaper,
  MessageSquare,
  RefreshCcw,
  BarChart3,
  Megaphone,
  Target,
  Globe,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Share2,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const LeadSourceChart = dynamic(() => import('@/features/command-center/ui/LeadSourceChart').then(m => m.LeadSourceChart), { ssr: false });
const ConversionFunnel = dynamic(() => import('@/features/command-center/ui/ConversionFunnel').then(m => m.ConversionFunnel), { ssr: false });

interface LeadSummary {
  id: string;
  type: string;
  status: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleOfInterest: string;
  source: string;
  createdAt: string;
}

interface DashboardData {
  leads: LeadSummary[];
  leadCount: number;
  leadSourceData: { name: string; value: number }[];
  conversionFunnelData: { name: string; value: number }[];
  leadStatusData: { name: string; value: number }[];
  blogPostCount: number;
  emailStats: { sent: number; scheduled: number; failed: number };
  distributionStats: { active: number; pending: number; error: number; health: number };
  recentCampaigns: { id: string; title: string; date: string; published: boolean }[];
}

const CARD_CLASSES =
  'relative bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 overflow-hidden hover:border-white/10 transition-all duration-500';

export default function MarketingDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('[MarketingDashboard] Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = loading || !data;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 overflow-hidden relative">
      <div className="scanline-overlay" />
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Megaphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1
                className="text-lg font-black uppercase tracking-[0.25em]"
                style={{ fontFamily: 'var(--font-cinematic)' }}
              >
                Marketing <span className="text-emerald-400">Dashboard</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase font-bold">
                Métricas Unificadas
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
            icon={<Users className="w-5 h-5" />}
            label="Total Leads"
            value={isLoading ? '—' : data.leadCount}
            accent="cyan"
          />
          <KPICard
            icon={<Target className="w-5 h-5" />}
            label="Tasa Conversión"
            value={
              isLoading
                ? '—'
                : data.conversionFunnelData.length > 0
                  ? `${Math.round(
                      ((data.conversionFunnelData[data.conversionFunnelData.length - 1]?.value || 0) /
                        Math.max(data.conversionFunnelData[0]?.value || 1, 1)) *
                        100,
                    )}%`
                  : '0%'
            }
            accent="emerald"
          />
          <KPICard
            icon={<Newspaper className="w-5 h-5" />}
            label="Blog Posts"
            value={isLoading ? '—' : data.blogPostCount}
            accent="violet"
          />
          <KPICard
            icon={<Share2 className="w-5 h-5" />}
            label="Distribución"
            value={isLoading ? '—' : `${data.distributionStats.health}%`}
            accent="green"
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
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="font-bold text-sm">Origen de Leads</h2>
            </div>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-slate-600 text-xs">
                Cargando...
              </div>
            ) : (
              <LeadSourceChart leads={data.leads as any} />
            )}
          </motion.div>

          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="font-bold text-sm">Embudo de Conversión</h2>
            </div>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-slate-600 text-xs">
                Cargando...
              </div>
            ) : (
              <ConversionFunnel leads={data.leads as any} />
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="font-bold text-sm">Email Marketing</h2>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-slate-600 text-xs">Cargando...</div>
            ) : (
              <div className="space-y-4">
                <StatusRow
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Enviados"
                  value={data.emailStats.sent}
                />
                <StatusRow
                  icon={<Activity className="w-4 h-4 text-amber-400" />}
                  label="Programados"
                  value={data.emailStats.scheduled}
                />
                <StatusRow
                  icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                  label="Fallidos"
                  value={data.emailStats.failed}
                />
              </div>
            )}
          </motion.div>

          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="font-bold text-sm">Distribución</h2>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-slate-600 text-xs">Cargando...</div>
            ) : (
              <div className="space-y-4">
                <StatusRow
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  label="Activos"
                  value={data.distributionStats.active}
                />
                <StatusRow
                  icon={<Activity className="w-4 h-4 text-amber-400" />}
                  label="Pendientes"
                  value={data.distributionStats.pending}
                />
                <StatusRow
                  icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
                  label="Errores"
                  value={data.distributionStats.error}
                />
              </div>
            )}
          </motion.div>

          <motion.div
            className={CARD_CLASSES}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-500/10">
                <Newspaper className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="font-bold text-sm">Campañas Recientes</h2>
            </div>
            {isLoading ? (
              <div className="py-8 text-center text-slate-600 text-xs">Cargando...</div>
            ) : data.recentCampaigns.length > 0 ? (
              <div className="space-y-3">
                {data.recentCampaigns.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{campaign.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(campaign.date).toLocaleDateString('es-PR', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                        campaign.published
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {campaign.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-600 text-xs">
                No hay campañas recientes
              </div>
            )}
          </motion.div>
        </div>

        <div className="hidden md:flex p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl items-center justify-center gap-3">
          <Megaphone className="w-4 h-4 text-emerald-400" />
          <p className="text-[10px] text-emerald-300 uppercase tracking-[0.2em] font-bold">
            Marketing Dashboard • Richard Automotive
          </p>
        </div>
      </main>
    </div>
  );
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
    cyan: 'from-cyan-500/10 border-cyan-500/10 text-cyan-400',
    emerald: 'from-emerald-500/10 border-emerald-500/10 text-emerald-400',
    violet: 'from-violet-500/10 border-violet-500/10 text-violet-400',
    green: 'from-green-500/10 border-green-500/10 text-green-400',
  };
  const colors = colorMap[accent] || colorMap.cyan;

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

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}
