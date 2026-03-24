import { z } from 'genkit';
import { ai } from '../../../services/aiManager';

export const generateCarDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCarDescription',
    inputSchema: z.object({ carModel: z.string(), features: z.array(z.string()).optional() }),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (input, { sendChunk }) => {
    const { carModel, features } = input;
    const cacheKey = `car_desc_${carModel.toLowerCase().replace(/\s+/g, '_')}_${features?.join('_').toLowerCase().replace(/\s+/g, '_')}`;
    const { cache } = await import('../../../services/cacheService');
    const cachedResult = await cache.get<string>(cacheKey);
    if (cachedResult) {
      sendChunk(cachedResult);
      return cachedResult;
    }
    const prompt = `Eres un experto en marketing... Escribe una descripción persuasiva para un ${carModel}...`;
    const { response, stream } = await ai.generateStream(prompt);
    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk.text;
      sendChunk(chunk.text);
    }
    const result = await response;
    const output = result.text || fullText;
    await cache.set(cacheKey, output, 86400);
    return output;
  },
);
