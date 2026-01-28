
import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function (Edge or Node)
// Handles secure communication with Gemini API
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    try {
        const { prompt, systemInstruction, model: modelName, config } = await request.json();

        // 1. Secure API Key Access (Server-Side Only)
        // Helper to ensure we don't accidentally leak if env is missing
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY missing on server.");
            return Response.json({ error: 'Server Configuration Error' }, { status: 500 });
        }

        // 2. Instantiate SDK
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: modelName || "gemini-1.5-flash",
            systemInstruction,
            generationConfig: config
        });

        // 3. Generate Content (Waits for full response)
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Return formatted JSON response
        return Response.json({ text });

    } catch (error: any) {
        console.error("Gemini API Proxy Error:", error);
        return Response.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
