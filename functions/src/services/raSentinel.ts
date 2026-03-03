import { z } from 'genkit';
import { ai } from './aiManager';
import * as logger from 'firebase-functions/logger';
import { logFlowExecution } from './persistenceService';
import { OperationalSentinel, OperationalScoreResultSchema } from '../application/use-cases/ops/OperationalSentinel.usecase';

export const raSentinelFlow = ai.defineFlow(
    {
        name: 'raSentinel',
        inputSchema: z.object({
            type: z.enum(['lead_health', 'inventory_risk', 'system_performance']),
            context: z.any()
        }),
        outputSchema: OperationalScoreResultSchema // Usamos el esquema del caso de uso
    },
    async (input) => {
        logger.info(`🛡️ Richard Automotive Sentinel [CLEAN]: Analyzing ${input.type}...`);

        const aiService = async (prompt: string) => {
            const result = await ai.generate(prompt);
            return result.output() || JSON.parse(result.text);
        };

        const result = await OperationalSentinel.execute(input.type, input.context, aiService);

        if (result.isFailure()) {
            logger.error(`[raSentinel] Error analyzing ${input.type}:`, result.error);
            throw new Error(result.error.message);
        }

        const output = result.value;

        // Automate Persistence Protocol
        await logFlowExecution('raSentinel', input, output);

        return output;
    }
);


