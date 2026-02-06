
import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function (Edge or Node)
// Handles secure communication with Gemini API
export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
    }

    try {
        const { prompt, contents, systemInstruction, model: modelName, config } = await request.json();

        // 1. Secure API Key Access (Server-Side Only)
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

        // 3. Generate Content (Supports strings and multimodal parts)
        // If contents is provided (multimodal), use it; otherwise fallback to prompt string.
        const result = await model.generateContent(contents || prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Return formatted JSON response
        return Response.json({ text });

    } catch (error: unknown) {
        console.error("Gemini API Proxy Error:", error);
        const err = error as Error;
        return Response.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
