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

    /**
     * Sentinel Watchdog: Sends critical alerts to admin when system health is compromised.
     */
    static async triggerCriticalAlert(title: string, message: string, source: string): Promise<void> {
        if (typeof window !== 'undefined') return;

        console.warn(`🚨 [Sentinel Alert] ${title}: ${message} (${source})`);

        try {
            const { sendNotificationEmail } = await import('./emailService');
            const adminEmail = process.env.ADMIN_EMAIL || 'richard@richard-automotive.com';

            await sendNotificationEmail({
                to: adminEmail,
                subject: `🚨 SENTINEL CRITICAL: ${title}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px;">
                        <h1 style="color: #ef4444; margin-top: 0;">Alerta de Sistema Sentinel</h1>
                        <p><strong>Nivel:</strong> CRITICAL</p>
                        <p><strong>Fuente:</strong> ${source}</p>
                        <p><strong>Evento:</strong> ${title}</p>
                        <p><strong>Detalle:</strong> ${message}</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #64748b;">Richard Automotive Command Center - Houston Engine</p>
                    </div>
                `
            });
        } catch (error) {
            console.error('Failed to send sentinel alert:', error);
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

