import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Try standard backend key first, then frontend key
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.VITE_FIREBASE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Configuration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { imageUrl, prompt: userPrompt } = req.body;

        if (!imageUrl) {
            throw new Error('imageUrl is required');
        }

        if (!apiKey) {
            throw new Error('Server-side API Key configuration missing');
        }

        console.log(`[Visual Cortex] Processing image: ${imageUrl}`);

        // 1. Fetch the Image
        // Use built-in fetch (Node 18+)
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image (${imageResponse.status}): ${imageResponse.statusText}`);
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        console.log(`[Visual Cortex] Image fetched. Size: ${buffer.length} bytes. Mime: ${mimeType}`);

        // 2. Prepare Gemini Request
        // Try precise version if alias fails
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const systemPrompt = `
        ACT AS: Expert Automotive Appraiser & Inventory Manager.
        TASK: Analyze this vehicle image (or auction sheet/window sticker).
        
        EXTRACT & ESTIMATE the following data points in Strict JSON format.
        If a field cannot be determined, use null.
        
        JSON STRUCTURE:
        {
            "make": "String (e.g. Toyota)",
            "model": "String (e.g. Corolla)",
            "year": Number (Estimate if needed, e.g. 2020),
            "trim": "String (e.g. LE, XSE, Lariat)",
            "color": "String",
            "type": "SUV | Sedan | Pickup | Coupe | Van",
            "condition": "Excellent | Good | Fair | Poor",
            "visualDamages": ["List", "of", "visible", "defects"],
            "aftermarketMods": ["List", "of", "mods"],
            "estimatedMarketValue": Number (Conservative estimate in USD),
            "marketingDescription": "2 sentence exciting sales hook in Spanish"
        }
        `;

        const finalPrompt = userPrompt ? `${systemPrompt}\nUSER NOTE: ${userPrompt}` : systemPrompt;

        // 3. Generate Content
        const socketStart = Date.now();
        const result = await model.generateContent([
            finalPrompt,
            {
                inlineData: {
                    data: base64,
                    mimeType
                }
            }
        ]);

        const aiResponse = await result.response;
        const text = aiResponse.text();

        console.log(`[Visual Cortex] Analysis complete in ${Date.now() - socketStart}ms`);

        // 4. Sanitize and Parse JSON
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let data;
        try {
            data = JSON.parse(cleanText);
        } catch (e) {
            console.error("JSON Parse Error on AI response:", text);
            // Fallback: return raw text if JSON fails
            return res.status(200).json({ success: true, raw: text, warning: "JSON parse failed" });
        }

        // 5. Return Result
        return res.status(200).json({
            success: true,
            data: data,
            metadata: {
                model: "gemini-1.5-flash",
                processingTime: Date.now() - socketStart
            }
        });

    } catch (error: any) {
        console.error('Visual Cortex Critical Error:', error);

        let hint = "Unknown error";
        if (error.message?.includes("404")) hint = "Model not found. Ensure 'GEMINI_API_KEY' has access to 'gemini-1.5-flash' in Google AI Studio.";
        if (error.message?.includes("403")) hint = "Permission denied. Check API Key quotas or HTTP Referrer restrictions.";

        return res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error',
            hint
        });
    }
}
