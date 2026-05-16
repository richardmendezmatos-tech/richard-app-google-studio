import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.VITE_GEMINI_API_KEY;

async function test() {
  if (!apiKey) {
    console.error('API Key missing');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hola, di test.');
    const response = await result.response;
    console.log('Success with direct SDK (gemini-1.5-flash):', response.text());
  } catch (e) {
    console.error('Failed with direct SDK (gemini-1.5-flash):', e.message);
  }
}

test();
