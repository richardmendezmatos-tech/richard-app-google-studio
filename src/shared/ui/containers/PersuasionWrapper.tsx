'use client';

import React, { ReactNode, useEffect } from 'react';
import { useCustomerMemory, CognitiveProfile } from '@/shared/lib/persuasion/customerMemory';
import { raSentinel } from '@/shared/lib/monitoring/raSentinelService';

interface PersuasionWrapperProps {
  analytical: ReactNode;
  impulsive: ReactNode;
  conservative: ReactNode;
  neutral?: ReactNode;
  componentId: string;
}

/**
 * PersuasionWrapper (Nivel 16): Interfaz Adaptativa.
 * Renderiza condicionalmente el contenido basado en el perfil psicológico del lead.
 * Richard Automotive habla el idioma de la mente.
 */
export const PersuasionWrapper: React.FC<PersuasionWrapperProps> = ({
  analytical,
  impulsive,
  conservative,
  neutral,
  componentId,
}) => {
  const { profile } = useCustomerMemory();
  
  // Registrar intento de persuasión neuro-cognitiva (Nivel 16)
  useEffect(() => {
    if (profile !== 'neutral') {
      raSentinel.reportNeuroPersuasion(profile, componentId, {
        timestamp: Date.now(),
        location: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
      });
    }
  }, [profile, componentId]);

  // Selección de variante basada en el perfil
  switch (profile) {
    case 'analytical':
      return <>{analytical}</>;
    case 'impulsive':
      return <>{impulsive}</>;
    case 'conservative':
      return <>{conservative}</>;
    default:
      return <>{neutral || analytical}</>; // Por defecto usamos analítico si Richard prefiere dar datos
  }
};
