import { useState, useCallback } from 'react';
import { autonomousDistributionAgent } from '../api/distributionAgent';
import { Car } from '@/entities/inventory';

/**
 * useDistributionAgent
 *
 * Interface for the UI to interact with the Sentinel Distribution Agent.
 */
export function useDistributionAgent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<{ processed: number; errors: number } | null>(null);

  /**
   * Triggers a full autonomous distribution cycle.
   */
  const runFullCycle = useCallback(async () => {
    setIsProcessing(true);
    try {
      const result = await autonomousDistributionAgent.runCycle();
      setLastResult(result);
      return result;
    } catch (error) {
      console.error('[useDistributionAgent] Cycle failed:', error);
      return { processed: 0, errors: 1 };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Triggers distribution for a single unit.
   */
  const distributeUnit = useCallback(async (car: Car) => {
    setIsProcessing(true);
    try {
      const success = await autonomousDistributionAgent.processUnit(car);
      return success;
    } catch (error) {
      console.error(`[useDistributionAgent] Unit distribution failed for ${car.id}:`, error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    runFullCycle,
    distributeUnit,
    isProcessing,
    lastResult,
  };
}
