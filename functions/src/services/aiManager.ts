import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

export const ai = genkit({
    plugins: [
        googleAI({ apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY }),
        vertexAI({ location: 'us-central1' })
    ],
    model: gemini15Flash,
});
