'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/shared/api/supabase/supabase';
import { updateLeadStatus } from '@/shared/api/adapters/leads/crmService';
import { maskPhone, maskEmail } from '@/shared/lib/utils/privacyUtils';
import type { UserRole } from '@/shared/types/types';

const ADMIN_ROLE: UserRole = 'admin';
import {
  Search,
  Flame,
  ThermometerSun,
  Snowflake,
  MessageSquare,
  Globe,
  Share2,
  LogOut,
  Car,
  Phone,
  CheckCircle2,
  Clock,
  Users,
  Zap,
} from 'lucide-react';

interface LeadRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: string;
  category: string | null;
  isHot: boolean;
  aiScore: number | null;
  vehicleOfInterest: string | null;
  source: string;
  createdAt: string;
}

const SOURCE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare size={11} />, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  web: { label: 'Web', icon: <Globe size={11} />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  exit_intent: { label: 'Exit Intent', icon: <LogOut size={11} />, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  facebook: { label: 'Facebook', icon: <Share2 size={11} />, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  instagram: { label: 'Instagram', icon: <Share2 size={11} />, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  chat: { label: 'Chat IA', icon: <Zap size={11} />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  'inventory-alert': { label: 'Alerta', icon: <Car size={11} />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
};

const STATUS_CYCLE: Record<string, string> = {
  new: 'contacted',
  contacted: 'negotiation',
  negotiation: 'sold',
  sold: 'new',
  lost: 'new',
  negotiating: 'sold',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Nuevo', color: 'bg-slate-700 text-slate-300' },
  contacted: { label: 'Contactado', color: 'bg-amber-500/20 text-amber-400' },
  negotiation: { label: 'Negociando', color: 'bg-purple-500/20 text-purple-400' },
  negotiating: { label: 'Negociando', color: 'bg-purple-500/20 text-purple-400' },
  sold: { label: 'Vendido', color: 'bg-emerald-500/20 text-emerald-400' },
  lost: { label: 'Perdido', color: 'bg-red-500/20 text-red-400' },
};

function HeatBadge({ category, isHot }: { category: string | null; isHot: boolean }) {
  if (isHot || category === 'HOT') {
    return (
      <span className="flex items-center gap-1 text-rose-400" title="HOT">
        <Flame size={14} className="fill-rose-400" />
      </span>
    );
  }
  if (category === 'WARM' || category === 'HIGH-YIELD') {
    return (
      <span className="flex items-center gap-1 text-amber-400" title="WARM">
        <ThermometerSun size={14} />
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-slate-500" title="COLD">
      <Snowflake size={14} />
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const def = SOURCE_LABELS[source] ?? SOURCE_LABELS['web'];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${def.color}`}>
      {def.icon} {def.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function buildWhatsAppUrl(phone: string, name: string): string {
  const clean = phone.replace(/\D/g, '');
  const msg = encodeURIComponent(
    `¡Hola ${name}! Soy Richard de Richard Automotive en Vega Alta 🚗. Vi que estás interesado/a en un vehículo. ¿Puedo ayudarte con más información o coordinar una cita?`,
  );
  return `https://wa.me/1${clean}?text=${msg}`;
}

export default function LeadsListView() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [heatFilter, setHeatFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('leads')
      .select(
        'id, first_name, last_name, email, phone, status, category, is_hot, ai_score, vehicle_of_interest, behavioral_metrics, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      setLeads(
        data.map((d) => ({
          id: d.id,
          firstName: d.first_name || '',
          lastName: d.last_name || '',
          phone: d.phone || '',
          email: d.email || '',
          status: d.status || 'new',
          category: d.category || null,
          isHot: d.is_hot || false,
          aiScore: d.ai_score || null,
          vehicleOfInterest: d.vehicle_of_interest || null,
          source: d.behavioral_metrics?.source || 'web',
          createdAt: d.created_at,
        })),
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
    if (!supabase) return;
    const channel = supabase
      .channel('leads-list-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const name = `${l.firstName} ${l.lastName}`.toLowerCase();
      if (search && !name.includes(search.toLowerCase()) && !l.phone.includes(search) && !l.vehicleOfInterest?.toLowerCase().includes(search.toLowerCase())) return false;
      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (heatFilter === 'hot' && !l.isHot && l.category !== 'HOT') return false;
      if (heatFilter === 'warm' && l.category !== 'WARM' && l.category !== 'HIGH-YIELD') return false;
      if (heatFilter === 'cold' && (l.isHot || l.category === 'HOT' || l.category === 'WARM' || l.category === 'HIGH-YIELD')) return false;
      return true;
    });
  }, [leads, search, sourceFilter, heatFilter]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: leads.length,
      hot: leads.filter((l) => l.isHot || l.category === 'HOT').length,
      today: leads.filter((l) => new Date(l.createdAt).toDateString() === today).length,
      whatsapp: leads.filter((l) => l.source === 'whatsapp').length,
    };
  }, [leads]);

  const handleStatusCycle = async (lead: LeadRow) => {
    const next = STATUS_CYCLE[lead.status] || 'contacted';
    setUpdatingId(lead.id);
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: next } : l));
    await updateLeadStatus(lead.id, next as any).catch(console.error);
    setUpdatingId(null);
  };

  const sources = useMemo(() => {
    const unique = [...new Set(leads.map((l) => l.source))];
    return unique;
  }, [leads]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.total, icon: <Users size={16} />, color: 'text-cyan-400' },
          { label: 'HOT Leads', value: stats.hot, icon: <Flame size={16} className="fill-rose-400" />, color: 'text-rose-400' },
          { label: 'Hoy', value: stats.today, icon: <Clock size={16} />, color: 'text-amber-400' },
          { label: 'WhatsApp', value: stats.whatsapp, icon: <MessageSquare size={16} />, color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o vehículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">Todas las fuentes</option>
            {sources.map((s) => (
              <option key={s} value={s}>{SOURCE_LABELS[s]?.label ?? s}</option>
            ))}
          </select>

          {/* Heat filter */}
          {(['all', 'hot', 'warm', 'cold'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHeatFilter(h)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                heatFilter === h
                  ? h === 'hot' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : h === 'warm' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : h === 'cold' ? 'bg-slate-700 border-slate-600 text-slate-300'
                    : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'border-white/10 text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              {h === 'all' ? 'Todos' : h === 'hot' ? '🔥 HOT' : h === 'warm' ? '🌡 Warm' : '❄️ Cold'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''} {filtered.length !== leads.length ? `de ${leads.length}` : ''}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/5 text-[10px] uppercase tracking-widest text-slate-400">
              <th className="px-4 py-3 text-left w-8"></th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Teléfono</th>
              <th className="px-4 py-3 text-left">Fuente</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Vehículo</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Hace</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 text-slate-500 text-sm">
                  No hay leads con estos filtros.
                </td>
              </tr>
            )}
            {filtered.map((lead) => {
              const fullName = `${lead.firstName} ${lead.lastName}`.trim() || 'Sin nombre';
              const statusDef = STATUS_LABELS[lead.status] ?? STATUS_LABELS['new'];
              const isUpdating = updatingId === lead.id;
              return (
                <tr
                  key={lead.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  {/* Heat */}
                  <td className="px-4 py-3">
                    <HeatBadge category={lead.category} isHot={lead.isHot} />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <p className="font-bold text-white text-sm">{fullName}</p>
                    {lead.email && (
                      <p className="text-[10px] text-slate-500">{maskEmail(lead.email, ADMIN_ROLE)}</p>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-300 text-xs font-mono">{maskPhone(lead.phone, ADMIN_ROLE)}</span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <SourceBadge source={lead.source} />
                  </td>

                  {/* Vehicle */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {lead.vehicleOfInterest ? (
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <Car size={11} className="text-slate-500 shrink-0" />
                        {lead.vehicleOfInterest}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Time */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(lead.createdAt)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleStatusCycle(lead)}
                      disabled={isUpdating}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent transition-all hover:scale-105 active:scale-95 ${statusDef.color} ${isUpdating ? 'opacity-50' : ''}`}
                      title="Clic para avanzar estado"
                    >
                      {statusDef.label}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {lead.phone && (
                        <a
                          href={buildWhatsAppUrl(lead.phone, lead.firstName || 'cliente')}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all hover:scale-110"
                          title="WhatsApp"
                        >
                          <MessageSquare size={13} />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/30 transition-all hover:scale-110"
                          title="Llamar"
                        >
                          <Phone size={13} />
                        </a>
                      )}
                      {lead.status === 'new' && (
                        <button
                          onClick={() => handleStatusCycle(lead)}
                          className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-all hover:scale-110"
                          title="Marcar como contactado"
                        >
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
