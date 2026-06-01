import { z } from 'zod';

export const processVoiceChunkFlow = async (input: { leadId: string; text: string }) => {
  const { voiceIntelligenceService } =
    await import('@/features/ai-hub/api/VoiceIntelligenceAdapter');
  await voiceIntelligenceService.processCallChunk(input.leadId, input.text);
};
