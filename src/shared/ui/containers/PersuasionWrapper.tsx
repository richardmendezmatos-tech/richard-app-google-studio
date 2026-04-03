'use client';

import React from 'react';
import { PersuasionProfile } from '@/features/leads/model/customerMemoryService';

interface PersuasionWrapperProps {
  profile: PersuasionProfile;
  variants: {
    Analytical: React.ReactNode;
    Impulsive: React.ReactNode;
    Conservative: React.ReactNode;
    Unknown?: React.ReactNode;
  };
}

/**
 * PersuasionWrapper: El corazón de la UI Adaptativa (Nivel 16).
 * Inyecta variaciones de contenido basadas en el perfil cognitivo del usuario.
 */
export const PersuasionWrapper: React.FC<PersuasionWrapperProps> = ({
  profile,
  variants,
}) => {
  const content = variants[profile as keyof typeof variants] || variants.Unknown || variants.Analytical;

  return (
    <div className="animate-in fade-in duration-700">
      {content}
    </div>
  );
};
