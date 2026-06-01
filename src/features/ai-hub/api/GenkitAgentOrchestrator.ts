import { AgentOrchestrator } from '@/features/ai-hub/api';
import { orchestrateResponse } from '@/features/ai-hub/api/rag-synergy-logic';

export class GenkitAgentOrchestrator implements AgentOrchestrator {
  async orchestrate(input: {
    message: string;
    history: any[];
    leadContext: any;
    vehicleContext?: any;
    leadId?: string;
    metadata?: any;
    isWhatsApp?: boolean;
  }): Promise<{ response: string; metadata: any }> {
    return await orchestrateResponse(input);
  }
}
