import { z } from 'genkit';
import { ai } from './services/aiManager';
import { gemini15Flash } from '@genkit-ai/googleai';
import { cache } from './services/cacheService';
import * as logger from 'firebase-functions/logger';
import { createHash } from 'crypto';

export const transcribeVoiceFlow = ai.defineFlow(
  {
    name: 'transcribeVoice',
    inputSchema: z.object({
      audioBase64: z.string(),
      mimeType: z.string().default('audio/wav'),
    }),
    outputSchema: z.object({
      text: z.string(),
    }),
  },
  async (input) => {
    const { audioBase64, mimeType } = input;

    // P4.1: Caching and Logging
    const audioHash = createHash('md5').update(audioBase64).digest('hex');
    const cacheKey = `transcribe_${audioHash}`;

    const cachedResult = await cache.get<{ text: string }>(cacheKey);
    if (cachedResult) {
      logger.info(`Voice transcription cache hit for ${audioHash}`);
      return cachedResult;
    }

    logger.info(`Starting voice transcription for hash ${audioHash}`);

    const response = await ai.generate({
      model: gemini15Flash,
      prompt: [
        {
          text: `Transcribe the following audio precisely into Spanish. 
          CONTEXT: Richard Automotive, Puerto Rico. 
          TERMINOLOGY: Use automotive terms like "guagua", "unidad", "pronto", "trade-in", "sucursal", "financiamiento".
          FORMAT: Return ONLY the transcription text, no preamble.`,
        },
        {
          media: {
            url: `data:${mimeType};base64,${audioBase64}`,
            contentType: mimeType,
          },
        },
      ],
    });

    const result = {
      text: response.text || '',
    };

    // Cache the result for 1 hour
    await cache.set(cacheKey, result, 3600);
    logger.info(`Completed voice transcription for hash ${audioHash}`);

    return result;
  },
);
