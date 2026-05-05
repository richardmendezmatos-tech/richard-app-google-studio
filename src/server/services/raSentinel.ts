import { z } from 'zod';
import { generateText } from 'ai';
import { gemini15Flash } from './aiManager';
import { logFlowExecution } from './persistenceService';
import { OperationalSentinel, OperationalScoreResultSchema } from '../application/use-cases/ops/OperationalSentinel.usecase';

export const raSentinelFlow = async (input: {
    type: 'lead_health' | 'inventory_risk' | 'system_performance';
    context: any;
}) => {
    console.log(`🛡️ Richard Automotive Sentinel [CLEAN]: Analyzing ${input.type}...`);

    const aiService = async (prompt: string) => {
        const { text } = await generateText({
            model: gemini15Flash,
            prompt
        });
        return JSON.parse(text);
    };

    const result = await OperationalSentinel.execute(input.type, input.context, aiService);

    if (result.isFailure()) {
        console.error(`[raSentinel] Error analyzing ${input.type}:`, result.error);
        throw new Error(result.error.message);
    }

    const output = result.value;

    // Automate Persistence Protocol
    await logFlowExecution('raSentinel', input, output);

    return output;
};



