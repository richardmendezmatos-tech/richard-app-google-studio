import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();
if (process.env.VITE_GEMINI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.VITE_GEMINI_API_KEY;
}

async function test() {
  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash-exp'),
      prompt: 'Hola, di test.',
    });
    console.log('Success with gemini-2.0-flash-exp:', text);
  } catch (e) {
    console.error('Failed with gemini-2.0-flash-exp:', e.message);
  }
}

test();
