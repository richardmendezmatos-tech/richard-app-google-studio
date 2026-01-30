import { useState, useCallback } from 'react';
import { analyzeCarImage, VisualSearchResult, findMatches } from '../services/aiService';
import { Car } from '../types';

export const useVisualSearch = (inventory: Car[]) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matches, setMatches] = useState<Car[]>([]);
    const [analysis, setAnalysis] = useState<VisualSearchResult | null>(null);

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

            return {
                analysis: result,
                matches: foundCars
            };

        } catch (err: any) {
            const msg = err.message || "Error analyzing image";
            setError(msg);
            console.error(err);
            return null;
        } finally {
            setIsAnalyzing(false);
        }
    }, [inventory]);

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
