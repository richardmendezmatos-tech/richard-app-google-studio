import { z } from 'genkit';
import { ai } from './aiManager';
import * as logger from 'firebase-functions/logger';
import { logFlowExecution } from './persistenceService';
import { OperationalSentinel } from '../application/use-cases/OperationalSentinel';

export const raSentinelFlow = ai.defineFlow(
    {
        name: 'raSentinel',
        inputSchema: z.object({
            type: z.enum(['lead_health', 'inventory_risk', 'system_performance']),
            context: z.any()
        }),
        outputSchema: z.object({
            status: z.string(),
            insights: z.array(z.string()),
            riskLevel: z.enum(['low', 'medium', 'high']),
            recommendations: z.array(z.string()),
            operational_score: z.number()
        })
    },
    async (input) => {
        logger.info(`🛡️ Richard Automotive Sentinel [CLEAN]: Analyzing ${input.type}...`);

        const aiService = async (prompt: string) => {
            const result = await ai.generate(prompt);
            return result.output() || JSON.parse(result.text);
        };

        const output = await OperationalSentinel.execute(input.type, input.context, aiService);

        // Automate Persistence Protocol
        await logFlowExecution('raSentinel', input, output);

        return output;
    }
);


