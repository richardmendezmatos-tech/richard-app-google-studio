import { useState, useCallback } from 'react';
import { analyzeCarImage, VisualSearchResult, findMatches } from '@/services/aiService';
import { Car } from '@/types/types';
import { useInventoryAnalytics } from './useInventoryAnalytics';

export const useVisualSearch = (inventory: Car[]) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matches, setMatches] = useState<Car[]>([]);
    const [analysis, setAnalysis] = useState<VisualSearchResult | null>(null);
    const analytics = useInventoryAnalytics();

    const handleImageAnalyze = useCallback(async (file: File) => {
        setIsAnalyzing(true);
        setError(null);
        setMatches([]);
        setAnalysis(null);

        try {
            // 1. Analyze Image
            const result = await analyzeCarImage(file);
            setAnalysis(result);

            // 2. Find Matches
            const foundCars = findMatches(result, inventory);
            setMatches(foundCars);

            // 3. Track
            analytics.trackVisualSearch(result.type || 'unknown');

            return {
                analysis: result,
                matches: foundCars
            };

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error analyzing image";
            setError(msg);
            console.error(err);
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, [inventory, analytics]);

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
        reset
    };
};

