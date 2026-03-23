import { useMemo } from 'react';
import { Lead, VehicleHealthStatus } from '@/shared/types/types';
import { calculateLeadScore, ScoringResult } from '@/entities/lead';

/**
 * Hook to provide dynamic scoring for a specific lead.
 * This should ideally be used in a list context or per-card.
 */
export const useLeadScoring = (lead: Lead, health?: VehicleHealthStatus | null): ScoringResult => {
  return useMemo(() => {
    return calculateLeadScore(lead, health);
  }, [lead, health]);
};
