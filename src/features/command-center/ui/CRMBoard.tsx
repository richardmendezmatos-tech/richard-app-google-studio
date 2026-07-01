'use client';

import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import confetti from 'canvas-confetti';
import {
  GripVertical,
  Loader2,
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
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  createPortal,
} from 'react-dom';
import {
  Lead,
  subscribeToLeads,
  updateLeadStatus,
} from '@/shared/api/adapters/leads/crmService';
import {
  UserRole,
} from '@/shared/types/types';
import {
  automationService,
} from '@/features/automation/api/automationService';

import {
  useNotification,
} from '@/shared/ui/providers/NotificationProvider';

import {
  useMouseGlow,
} from '@/shared/ui/hooks/useMouseGlow';

import styles from './CRMBoard.module.css';

const COLUMNS = [
  { id: 'new', title: 'Nuevos', color: 'bg-primary', glow: 'shadow-primary/20' },
  { id: 'contacted', title: 'Contactados', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
  { id: 'negotiation', title: 'Negociando', color: 'bg-purple-500', glow: 'shadow-purple-500/20' },
  { id: 'sold', title: 'Ventas Cerradas', color: 'bg-emerald-500', glow: 'shadow-emerald-500/20' },
  { id: 'lost', title: 'Perdidos', color: 'bg-red-500', glow: 'shadow-red-500/20' },
];

import { LeadCard, SortableLeadItem } from './CRMLeadCard';


const CRMBoard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('e2e_bypass') === 'true') {
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
      } else if (typeof window !== 'undefined' && localStorage.getItem('e2e_bypass') !== 'true') {
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
      const eligibleLeads = leads.filter((l) => l.status === 'new' || l.status === 'contacted');
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
                className="min-w-[360px] w-full bg-slate-900/40 backdrop-blur-2xl rounded-4xl p-6 flex flex-col h-full border border-white/5 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6 px-2">
                  <div
                    className={`w-3 h-3 rounded-full ${col.color} animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
                  />
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
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-4xl opacity-50 bg-slate-900/20">
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
      {typeof window !== 'undefined' &&
        createPortal(
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
