import { z } from 'zod';
import { streamText, generateText } from 'ai';
import { gemini15Flash } from '../../../services/aiManager';

export const generateCarDescriptionFlow = async (
  input: { carModel: string; features?: string[] },
  onChunk?: (chunk: string) => void
) => {
  const { carModel, features } = input;
  const cacheKey = `car_desc_${carModel.toLowerCase().replace(/\s+/g, '_')}_${features?.join('_').toLowerCase().replace(/\s+/g, '_')}`;
  const { cache } = await import('../../../services/cacheService');
  const cachedResult = await cache.get<string>(cacheKey);

  if (cachedResult) {
    if (onChunk) onChunk(cachedResult);
    return cachedResult;
  }

  const prompt = `Eres un experto en marketing... Escribe una descripción persuasiva para un ${carModel}...`;

  if (onChunk) {
    const { textStream, text } = streamText({
      model: gemini15Flash,
      prompt,
    });
    for await (const chunk of textStream) {
      onChunk(chunk);
    }
    const finalResult = await text;
    await cache.set(cacheKey, finalResult, 86400);
    return finalResult;
  } else {
    const { text } = await generateText({
      model: gemini15Flash,
      prompt,
    });
    await cache.set(cacheKey, text, 86400);
    return text;
  }
};
