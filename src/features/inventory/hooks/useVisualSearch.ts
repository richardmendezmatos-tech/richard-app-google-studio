import { useState, useCallback } from 'react';
import { analyzeCarVisuals, VisualSearchResult, findMatches } from '@/features/ai-agents/api/aiService';
import { Car } from '@/entities/shared';
import { useInventoryAnalytics } from './useInventoryAnalytics';

export const useVisualSearch = (inventory: Car[]) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Car[]>([]);
  const [analysis, setAnalysis] = useState<VisualSearchResult | null>(null);
  const analytics = useInventoryAnalytics();

  const handleImageAnalyze = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      setError(null);
      setMatches([]);
      setAnalysis(null);

      try {
        // 1. Analyze Image
        const result = await analyzeCarVisuals(file);
        setAnalysis(result);

        // 2. Find Matches
        const foundCars = findMatches(result, inventory);
        setMatches(foundCars);

        // 3. Track
        analytics.trackVisualSearch(result.type || 'unknown');

        return {
          analysis: result,
          matches: foundCars,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error analyzing image';
        setError(msg);
        console.error(err);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [inventory, analytics],
  );

  const reset = useCallback(() => {
    setMatches([]);
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    error,
    matches,
    analysis,
    analyze: handleImageAnalyze,
    reset,
  };
};
