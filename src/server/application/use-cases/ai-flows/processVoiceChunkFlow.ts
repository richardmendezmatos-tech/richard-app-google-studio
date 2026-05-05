import { z } from 'zod';

export const processVoiceChunkFlow = async (input: { leadId: string; text: string }) => {
  const { voiceIntelligenceService } = await import('../../../infrastructure/external-apis/VoiceIntelligenceAdapter');
  await voiceIntelligenceService.processCallChunk(input.leadId, input.text);
};
