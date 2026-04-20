'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTrajectoryStore } from '@/entities/session/model/useTrajectoryStore';
import { TrajectoryAnalyzer } from '@/features/predictive/model/TrajectoryAnalyzer';
import { NudgeService } from '@/features/automation/api/NudgeService';
import { houstonBus, HoustonEventType } from '@/shared/lib/events/HoustonBus';

/**
 * NeuroTrajectoryDriver (Sentinel N23)
 * Componente invisible que orquestra la telemetría predictiva de la sesión.
 * Analiza el comportamiento del usuario y dispara eventos de alta intención.
 */
export const NeuroTrajectoryDriver: React.FC = () => {
  const pathname = usePathname();
  const { addEvent, updateDwellTime, events, dwellTimes, setScore, setFactors } = useTrajectoryStore();
  
  const lastPathRef = useRef<string | null>(pathname);
  const startTimeRef = useRef<number>(0);

  // Inicialización segura del tiempo de inicio
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  // 1. Rastreo de Transiciones de Página y Registro de Eventos
  useEffect(() => {
    const now = Date.now();
    const duration = now - startTimeRef.current;
    
    // Guardar tiempo de permanencia en la página anterior
    if (lastPathRef.current) {
      updateDwellTime(lastPathRef.current, duration);
    }

    // Registrar el nuevo evento de vista de página
    addEvent({
      type: 'page_view',
      path: pathname || '',
      metadata: { 
        referrer: lastPathRef.current || '',
        timestamp: new Date().toISOString()
      }
    });

    // Actualizar estado para la nueva página
    lastPathRef.current = pathname;
    startTimeRef.current = now;
  }, [pathname, addEvent, updateDwellTime]);

  // 2. Análisis de Intención y Disparo de Automatizaciones (Sentinel Logic)
  // Se ejecuta cuando cambian los eventos o el dwellTime acumulado
  useEffect(() => {
    const insight = TrajectoryAnalyzer.analyze(events, dwellTimes);
    
    // Sincronización proactiva con el store
    setScore(insight.score);
    setFactors(insight.signals);

    // Lógica de "High Intent" (Criterio de Nivel 13+)
    if (insight.score >= 60) {
      houstonBus.emit(HoustonEventType.PREDICTIVE_HIGH_INTENT, insight, 'NeuroTrajectoryDriver');
      
      // Intentar recuperar contexto de lead persistido para Nudge proactivo
      const context = {
        id: typeof window !== 'undefined' ? localStorage.getItem('last_lead_id') : null,
        phone: typeof window !== 'undefined' ? localStorage.getItem('last_lead_phone') : null,
        name: typeof window !== 'undefined' ? localStorage.getItem('last_lead_name') : null
      };

      if (context.id && context.phone && context.name) {
        NudgeService.evaluateAndDispatch(context.id, context.phone, context.name, insight)
          .then(result => {
            if (result.dispatched) {
              houstonBus.emit(HoustonEventType.PREDICTIVE_NUDGE_DISPATCHED, result, 'NudgeService');
            }
          })
          .catch(err => console.error('[NeuroDriver] Nudge error:', err));
      }
    }
  }, [events, dwellTimes, setScore, setFactors]);

  // 3. Manejo de Visibilidad (Background/Foreground Dwell Tracking)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === 'hidden') {
        const duration = now - startTimeRef.current;
        if (lastPathRef.current) {
          updateDwellTime(lastPathRef.current, duration);
        }
      } else {
        startTimeRef.current = now;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateDwellTime]);

  return null; // Invisible Proactive Driver
};
