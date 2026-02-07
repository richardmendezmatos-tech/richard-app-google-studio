import * as logger from 'firebase-functions/logger';
import { db } from './firebaseAdmin';

export interface AIUsageMetrics {
    model: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    feature: string;
    leadId?: string;
}

/**
 * ObservabilityService: Monitorización de costos y rendimiento de IA.
 * Permite a Richard ver el retorno de inversión y costos operativos en tiempo real.
 */
export class ObservabilityService {

    static async logAIUsage(metrics: AIUsageMetrics): Promise<void> {
        const totalTokens = metrics.promptTokens + metrics.completionTokens;

        // Estimación básica de costo (basada en Gemini 1.5 Flash approx)
        const estimatedCost = (totalTokens / 1000000) * 0.075; // $0.075 per 1M tokens approx for Flash

        logger.info(`AI Usage: ${metrics.feature} | ${metrics.model} | ${totalTokens} tokens | ${metrics.latencyMs}ms`);

        try {
            await db.collection('observability_ia').add({
                ...metrics,
                totalTokens,
                estimatedCost,
                timestamp: new Date(),
            });
        } catch (error) {
            logger.error('Failed to log AI observability data', error);
        }
    }

    static async trackOperation<T>(feature: string, model: string, leadId: string | undefined, operation: () => Promise<{ tokens: { prompt: number, completion: number }, result: T }>): Promise<T> {
        const start = Date.now();
        const { tokens, result } = await operation();
        const end = Date.now();

        await this.logAIUsage({
            feature,
            model,
            leadId,
            promptTokens: tokens.prompt,
            completionTokens: tokens.completion,
            latencyMs: end - start
        });

        return result;
    }
}
