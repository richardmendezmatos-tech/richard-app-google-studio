import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

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
        const supabase = createServerSupabaseClient();

        // Estimación básica de costo (basada en Gemini 1.5 Flash approx)
        const estimatedCost = (totalTokens / 1000000) * 0.075; // $0.075 per 1M tokens approx for Flash

        console.log(`AI Usage: ${metrics.feature} | ${metrics.model} | ${totalTokens} tokens | ${metrics.latencyMs}ms`);

        try {
            await supabase.from('ai_usage').insert({
                model: metrics.model,
                prompt_tokens: metrics.promptTokens,
                completion_tokens: metrics.completionTokens,
                total_tokens: totalTokens,
                latency_ms: metrics.latencyMs,
                feature: metrics.feature,
                lead_id: metrics.leadId,
                estimated_cost: estimatedCost,
                created_at: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Failed to log AI observability data', error);
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

