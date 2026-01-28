import { genkit } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';

export const ai = genkit({
    plugins: [
        googleAI(),
        vertexAI({ location: 'us-central1' })
    ],
    model: gemini15Flash,
});
