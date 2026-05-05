import { z } from 'zod';
import { generateText } from 'ai';
import { gemini15Flash } from '../../../services/aiManager';

export const askGeminiFlow = async (input: {
  contents: any[];
  model?: string;
  systemInstruction?: string;
  config?: any;
}) => {
  // Convert contents array to prompt string for Vercel AI SDK
  const promptText = Array.isArray(input.contents)
    ? input.contents.map(c => typeof c === 'string' ? c : JSON.stringify(c)).join('\n')
    : String(input.contents);

  const { text } = await generateText({
    model: gemini15Flash,
    system: input.systemInstruction,
    prompt: promptText,
    temperature: input.config?.temperature,
  });

  return text;
};
