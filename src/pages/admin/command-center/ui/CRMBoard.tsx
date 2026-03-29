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
} from '@/shared/api/adapters/leads/crmService';
import { useNotification } from '@/shared/ui/providers/NotificationProvider';
import { UserRole } from '@/shared/lib/utils/privacyUtils';
import { useMouseGlow } from '@/shared/ui/hooks/useMouseGlow';

// Componentes Modulares y Memoizados para Rendimiento Senior
import LeadCard from './components/LeadCard';
import SortableLeadItem from './components/SortableLeadItem';
import styles from './CRMBoard.module.css';

// Lazy Loading para reducir el Bundle Inicial (~15% ahorro estimado)
const SmartDealSheetModal = React.lazy(() => import('@/features/sales-automation/ui/SmartDealSheetModal'));
const OmnichannelInbox = React.lazy(() => import('./OmnichannelInbox'));

const COLUMNS = [
  {
    id: 'new',
    title: 'Input / New',
    color: 'bg-primary',
    glow: 'shadow-primary/20',
    step: '01'
  },
  {
    id: 'contacted',
    title: 'In Engagement',
    color: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
    step: '02'
  },
  {
    id: 'negotiation',
    title: 'Strategy Lab / Neg',
    color: 'bg-indigo-500',
    glow: 'shadow-indigo-500/20',
    step: '03'
  },
  {
    id: 'sold',
    title: 'Closed Revenue',
    color: 'bg-emerald-500',
    glow: 'shadow-emerald-500/20',
    step: '04'
  },
  {
    id: 'lost',
    title: 'Archive',
    color: 'bg-slate-600',
    glow: 'shadow-slate-500/20',
    step: '05'
  },
];

const CRMBoard: React.FC = () => {
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
  const { addNotification } = useNotification();
  const { containerRef } = useMouseGlow();
  const userRole: UserRole = 'admin'; // Hardcoded for now, should come from context

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
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className={`w-1.5 h-6 rounded-full ${col.color} shadow-[0_0_12px_var(--tw-shadow-color)]`} />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">
                    Stage {(col as any).step}
                  </span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">
                    {col.title}
                  </h3>
                </div>
                <div className="ml-auto bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-400">
                  {colLeads.length}
                </div>
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
                      onOpenDealSheet={handleOpenDealSheet}
                      onOpenInbox={handleOpenInbox}
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
              onOpenInbox={() => {}}
              userRole={userRole}
              isOverlay
            />
          ) : null}
        </DragOverlay>,
        document.body,
      )}
      
      {/* Smart Deal Sheet Modal - Wrapped in Suspense */}
      <React.Suspense fallback={<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-center justify-center"><Loader2 className="text-primary animate-spin" /></div>}>
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
          <OmnichannelInbox
            lead={selectedLeadForInbox}
            onClose={handleCloseInbox}
          />
        )}
      </React.Suspense>
    </DndContext>
  );
};

export default CRMBoard;
