import { z } from 'genkit';
import { ai } from '../../../services/aiManager';

export const processVoiceChunkFlow = ai.defineFlow(
  {
    name: 'processVoiceChunk',
    inputSchema: z.object({ leadId: z.string(), text: z.string() }),
    outputSchema: z.void(),
  },
  async (input) => {
    const { voiceIntelligenceService } = await import('../../../infrastructure/external-apis/VoiceIntelligenceAdapter');
    await voiceIntelligenceService.processCallChunk(input.leadId, input.text);
  },
);
