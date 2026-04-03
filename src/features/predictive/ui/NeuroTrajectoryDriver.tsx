'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTrajectoryStore } from '@/entities/session/model/useTrajectoryStore';
import { TrajectoryAnalyzer } from '@/features/predictive/model/TrajectoryAnalyzer';
import { NudgeService } from '@/features/automation/api/NudgeService';
import { houstonBus, HoustonEventType } from '@/shared/lib/events/HoustonBus';

export const NeuroTrajectoryDriver: React.FC = () => {
  const pathname = usePathname();
  const { addEvent, updateDwellTime, events, dwellTimes } = useTrajectoryStore();
  const lastPathRef = useRef<string | null>(pathname);
  const startTimeRef = useRef<number>(0);

  // Initialize start time on mount
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // 1. Rastreo de Transiciones de Página
  useEffect(() => {
    // Calcular dwell time de la página anterior
    const duration = Date.now() - startTimeRef.current;
    if (lastPathRef.current) {
      updateDwellTime(lastPathRef.current, duration);
    }

    // Registrar nueva página
    addEvent({
      type: 'page_view',
      path: pathname || '',
      metadata: { referrer: lastPathRef.current || '' }
    });

    // Resetear refs para la nueva página
    lastPathRef.current = pathname;
    startTimeRef.current = Date.now();

    // 2. Análisis de Intención al cambiar de página
    const insight = TrajectoryAnalyzer.analyze(events, dwellTimes);
    
    // Sincronizar con el store para telemetría
    const { setScore, setFactors } = useTrajectoryStore.getState();
    setScore(insight.score);
    setFactors(insight.signals);

    // Si la intención es alta, emitir evento global
    if (insight.score >= 60) {
        houstonBus.emit(HoustonEventType.PREDICTIVE_HIGH_INTENT, insight, 'NeuroTrajectoryDriver');
        
        const currentLeadId = typeof window !== 'undefined' ? localStorage.getItem('last_lead_id') : null;
        const leadPhone = typeof window !== 'undefined' ? localStorage.getItem('last_lead_phone') : null;
        const leadName = typeof window !== 'undefined' ? localStorage.getItem('last_lead_name') : null;

        if (currentLeadId && leadPhone && leadName) {
            NudgeService.evaluateAndDispatch(currentLeadId, leadPhone, leadName, insight)
                .then(result => {
                    if (result.dispatched) {
                        houstonBus.emit(HoustonEventType.PREDICTIVE_NUDGE_DISPATCHED, result, 'NudgeService');
                    }
                });
        }
    }
  }, [pathname, events, dwellTimes, addEvent, updateDwellTime]);

  // Handle Visibility Change for Dwell Time
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const duration = Date.now() - startTimeRef.current;
        updateDwellTime(lastPathRef.current || '', duration);
      } else {
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateDwellTime]);

  return null; // Invisible Driver
};
