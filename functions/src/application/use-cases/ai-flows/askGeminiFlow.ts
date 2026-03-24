import { z } from 'genkit';
import { ai } from '../../../services/aiManager';

export const askGeminiFlow = ai.defineFlow(
  {
    name: 'askGemini',
    inputSchema: z.object({
      contents: z.array(z.any()),
      model: z.string().optional(),
      systemInstruction: z.string().optional(),
      config: z.any().optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const apiKey = process.env.GEMINI_API_KEY || "";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
       model: input.model || "gemini-m-1.5-flash",
       systemInstruction: input.systemInstruction,
       generationConfig: input.config as any
    });
    const result = await model.generateContent(input.contents as any);
    const response = await result.response;
    return response.text();
  }
);
