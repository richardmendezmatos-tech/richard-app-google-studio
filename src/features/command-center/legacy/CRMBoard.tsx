"use client";

"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from '@/shared/lib/next-route-adapter';
import confetti from 'canvas-confetti';
import {
  Activity,
  Zap,
  Target,
  BarChart3,
  CloudDownload,
  Filter,
  Users,
  BadgeDollarSign,
  LayoutGrid,
  ChevronUp,
  AreaChart,
  Loader2,
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
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { Lead, subscribeToLeads, updateLeadStatus } from '@/shared/api/adapters/leads/crmService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { UserRole } from '@/shared/lib/utils/privacyUtils';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';
import { CommandCenterContextType } from './CommandCenterLayout';

// Componentes Modulares y Memoizados para Rendimiento Senior
import LeadCard from './components/LeadCard';
import SortableLeadItem from './components/SortableLeadItem';
import LeadDetailModal from './components/LeadDetailModal';
import styles from './CRMBoard.module.css';

// Lazy Loading para reducir el Bundle Inicial (~15% ahorro estimado)
const SmartDealSheetModal = React.lazy(
  () => import('@/features/sales-automation/ui/SmartDealSheetModal'),
);
const OmnichannelInbox = React.lazy(() => import('./OmnichannelInbox'));

const COLUMNS = [
  {
    id: 'new',
    title: 'Input / New',
    color: 'bg-cyan-500',
    glow: 'rgba(34, 211, 238, 0.4)',
    step: '01',
  },
  {
    id: 'contacted',
    title: 'Engagement',
    color: 'bg-amber-500',
    glow: 'rgba(245, 158, 11, 0.4)',
    step: '02',
  },
  {
    id: 'negotiation',
    title: 'Strategy Lab',
    color: 'bg-indigo-500',
    glow: 'rgba(99, 102, 241, 0.4)',
    step: '03',
  },
  {
    id: 'sold',
    title: 'Revenue',
    color: 'bg-emerald-500',
    glow: 'rgba(16, 185, 129, 0.4)',
    step: '04',
  },
  {
    id: 'lost',
    title: 'Archive',
    color: 'bg-slate-500',
    glow: 'rgba(100, 116, 139, 0.4)',
    step: '05',
  },
];

interface DroppableColumnProps {
  col: (typeof COLUMNS)[0];
  colLeads: Lead[];
  userRole: UserRole;
  isAnalyticsExpanded: boolean;
  onOpenDealSheet: (lead: Lead) => void;
  onOpenInbox: (lead: Lead) => void;
  onOpenDetail: (lead: Lead) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  col,
  colLeads,
  userRole,
  onOpenDealSheet,
  onOpenInbox,
  onOpenDetail,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-w-full md:min-w-[340px] w-full glass-sentinel rounded-[2.5rem] p-6 flex flex-col h-auto md:h-[calc(100vh-280px)] border transition-all duration-500 ease-[0.16, 1, 0.3, 1] ${styles.scanline} ${styles.columnGlow} ${
        isOver ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/5'
      }`}
      data-glow-color={col.glow}
    >
      <div className="flex items-center gap-4 mb-8 px-2">
        <div
          className={`w-1 h-8 rounded-full ${col.color} shadow-[0_0_15px_var(--column-glow-color)]`}
        />
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">
            Fase {col.step}
          </span>
          <h3 className="text-sm font-black uppercase tracking-[0.1em] text-white">{col.title}</h3>
        </div>
        <div className="ml-auto bg-white/5 border border-white/5 px-3 py-1 rounded-xl text-[10px] font-black text-slate-400">
          {colLeads.length}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        <SortableContext items={colLeads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {colLeads.map((lead) => (
            <SortableLeadItem
              key={lead.id}
              lead={lead}
              userRole={userRole}
              onOpenDealSheet={onOpenDealSheet}
              onOpenInbox={onOpenInbox}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </SortableContext>
        {colLeads.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-30 mt-4 group">
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center mb-3 group-hover:border-primary/50 transition-all">
              <Loader2 size={12} className="text-white/20 group-hover:animate-spin" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Awaiting Leads
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CRMBoard: React.FC = () => {
  const ctx = useOutletContext<CommandCenterContextType>();
  const [leads, setLeads] = React.useState<Lead[]>(() => {
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
  const [selectedLeadForInbox, setSelectedLeadForInbox] = useState<Lead | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'finance'>('all');
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics' | 'tools'>('leads');
  const { addNotification } = useNotification();
  const { containerRef } = useMouseGlow();
  const navigate = useNavigate();
  const userRole: UserRole = 'admin';

  // Metrics Logic
  const metrics = useMemo(() => {
    if (!ctx?.inventory) {
      return { totalPipelineValue: 0, avgScore: 100, soldCount: 0 };
    }

    const totalPipelineValue = leads.reduce((sum, lead) => {
      const vehicle = ctx.inventory.find(
        (v) => v.id === lead.carId || v.name === lead.vehicleOfInterest,
      );
      return sum + (vehicle ? Number(vehicle.price || 0) : 0);
    }, 0);

    const avgScore =
      leads.length > 0
        ? Math.round(leads.reduce((sum, l) => sum + (l.aiAnalysis?.score || 0), 0) / leads.length)
        : 100;

    const soldCount = leads.filter((l) => l.status === 'sold').length;

    return { totalPipelineValue, avgScore, soldCount };
  }, [leads, ctx.inventory]);

  // Handlers Optimizados con useCallback para evitar romper la memoización de los items
  const handleOpenDealSheet = React.useCallback((lead: Lead) => {
    setSelectedLeadForDealSheet(lead);
  }, []);

  const handleOpenInbox = React.useCallback((lead: Lead) => {
    setSelectedLeadForInbox(lead);
  }, []);

  const handleCloseDealSheet = React.useCallback(() => {
    setSelectedLeadForDealSheet(null);
  }, []);

  const handleCloseInbox = React.useCallback(() => {
    setSelectedLeadForInbox(null);
  }, []);

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

  const filteredLeads = useMemo(() => {
    if (filterType === 'all') return leads;
    return leads.filter((l) => l.type === filterType);
  }, [leads, filterType]);

  const groupedLeads = useMemo(() => {
    return COLUMNS.reduce(
      (acc, col) => {
        acc[col.id] = filteredLeads.filter((l) => (l.status || 'new') === col.id);
        return acc;
      },
      {} as Record<string, Lead[]>,
    );
  }, [filteredLeads]);

  // Helper para encontrar a qué contenedor pertenece un ID (sea de lead o de columna)
  const findContainer = (id: string) => {
    if (COLUMNS.some((col) => col.id === id)) return id;

    // Si no es un ID de columna, buscamos en qué columna está el lead
    for (const [colId, items] of Object.entries(groupedLeads)) {
      if (items.some((lead) => lead.id === id)) return colId;
    }
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeLeadId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      const newStatus = overContainer;
      await updateLeadStatus(activeLeadId, newStatus as any);

      if (newStatus === 'sold') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addNotification('success', '¡Vehículo vendido!');
      }

      // Actualización optimista local para fluidez inmediata
      setLeads((prev) =>
        prev.map((l) => (l.id === activeLeadId ? { ...l, status: newStatus as any } : l)),
      );
    }

    setActiveId(null);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      addNotification('error', 'No hay datos para exportar.');
      return;
    }

    const headers = [
      'ID',
      'Nombre',
      'Email',
      'Teléfono',
      'Estado',
      'Tipo',
      'Vehículo Interés',
      'AI Score',
      'Fecha',
    ];
    const rows = leads.map((l) => [
      l.id,
      l.name || `${l.firstName || ''} ${l.lastName || ''}`.trim(),
      l.email || 'N/A',
      l.phone || 'N/A',
      l.status,
      l.type || 'Standard',
      l.vehicleOfInterest || l.message || 'N/A',
      l.aiAnalysis?.score || 'N/A',
      l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `RA_Leads_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification('success', 'Reporte de telemetría generado con éxito.');
  };

  const renderLeadsTab = () => (
    <div className="flex flex-col space-y-8 h-full">
      {/* NAVIGATION & SEGMENTATION CONTROLS - MINIMALIST */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <div className="flex p-1.5 bg-slate-900/60 rounded-[2rem] border border-white/5 backdrop-blur-xl">
            {[
              { id: 'all', label: 'Todos', icon: LayoutGrid },
              { id: 'contact', label: 'Aplicaciones', icon: Users },
              { id: 'finance', label: 'Crédito', icon: BadgeDollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterType === tab.id
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-6 pl-4 border-l border-white/5 h-8">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
                Pipeline
              </span>
              <span className="text-xs font-black text-emerald-400">
                ${(metrics.totalPipelineValue / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">
                Leads
              </span>
              <span className="text-xs font-black text-white">{leads.length}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <Filter size={14} />
          Segmentación Activa:{' '}
          <span className="text-white">
            {filterType === 'finance'
              ? 'Credit Applications'
              : filterType === 'contact'
                ? 'General Leads'
                : 'Full Pipeline'}
          </span>
        </div>
      </div>

      <div
        ref={containerRef as any}
        className="flex flex-col md:flex-row gap-6 flex-1 overflow-y-auto md:overflow-x-auto custom-scrollbar px-1 snap-y md:snap-x snap-mandatory pb-8"
      >
        {COLUMNS.map((col) => {
          const colLeads = groupedLeads[col.id] || [];
          return (
            <DroppableColumn
              key={col.id}
              col={col}
              colLeads={colLeads}
              userRole={userRole}
              isAnalyticsExpanded={false}
              onOpenDealSheet={handleOpenDealSheet}
              onOpenInbox={handleOpenInbox}
              onOpenDetail={setSelectedLeadForDetail}
            />
          );
        })}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
        <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-4 group hover:border-cyan-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Activity size={24} className="group-hover:animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Pipeline Health
            </div>
            <div className="text-3xl font-black text-white metricValue">{metrics.avgScore}%</div>
          </div>
        </div>

        <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Zap size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Potential Revenue
            </div>
            <div className="text-3xl font-black text-white metricValue">
              ${(metrics.totalPipelineValue / 1000).toFixed(1)}k
            </div>
          </div>
        </div>

        <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-4 group hover:border-indigo-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Target size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Active Conversions
            </div>
            <div className="text-3xl font-black text-white metricValue">{metrics.soldCount}</div>
          </div>
        </div>

        <div className="glass-premium rounded-3xl p-8 border border-white/5 flex flex-col gap-4 group hover:border-amber-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              Escalation Status
            </div>
            <div className="text-3xl font-black text-white metricValue">OPTIMAL</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-premium rounded-3xl p-8 border border-white/5">
        <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight">
          Data Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <CloudDownload size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white tracking-tight">Full CRM Export</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  CSV Format • Cloud Secure
                </div>
              </div>
            </div>
            <LayoutGrid
              size={16}
              className="text-slate-600 group-hover:text-white transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full space-y-8 pb-8 pr-4">
        {/* TAB NAVIGATION - EXECUTIVE ARCHITECTURE */}
        <div className="flex items-center gap-8 border-b border-white/5 px-2 mb-4">
          {[
            { id: 'leads', label: 'Leads', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'tools', label: 'Tools', icon: LayoutGrid },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <tab.icon size={12} className={activeTab === tab.id ? 'text-cyan-400' : ''} />
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'leads' && renderLeadsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'tools' && renderToolsTab()}
        </div>
      </div>

      {createPortal(
        <DragOverlay adjustScale={false}>
          {activeId ? (
            <div className="rotate-2 scale-105 transition-transform">
              <LeadCard
                lead={leads.find((l) => l.id === activeId)!}
                onPrint={() => {}}
                onOpenDealSheet={() => {}}
                onOpenInbox={() => {}}
                onOpenDetail={() => {}}
                userRole={userRole}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}

      {/* Smart Deal Sheet Modal - Wrapped in Suspense */}
      <React.Suspense
        fallback={
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center">
            <Loader2 className="text-primary animate-spin" />
          </div>
        }
      >
        {selectedLeadForDealSheet && (
          <SmartDealSheetModal
            lead={selectedLeadForDealSheet}
            onClose={handleCloseDealSheet}
            onExportPDF={(data, lead) => {
              addNotification('info', 'Exportación premium iniciada.');
            }}
          />
        )}

        {/* Omnichannel Inbox Modal */}
        {selectedLeadForInbox && (
          <OmnichannelInbox lead={selectedLeadForInbox} onClose={handleCloseInbox} />
        )}

        <LeadDetailModal
          lead={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
        />
      </React.Suspense>
    </DndContext>
  );
};

export default CRMBoard;
