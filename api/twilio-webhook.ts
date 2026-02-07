import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import twilio from 'twilio';

/**
 * RICHARD AUTOMOTIVE - TWILIO WEBHOOK
 * Handles incoming WhatsApp messages and media.
 * 
 * Logic:
 * 1. Receive POST from Twilio.
 * 2. Check for Media (Images).
 * 3. If Image -> Visual Cortex Analysis -> Reply with Appraisal.
 * 4. If Text -> Standard Chatbot (Placeholder for now).
 */

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "");
// Temporary diagnostic: Use gemini-pro (text-only) to check basic access
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize Twilio Client (for proactive replies if TwiML is too limited)
const twilioClient = new twilio.Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const body = req.body;

        // Twilio Payload parsing
        // Note: Vercel might parse body automatically if content-type is correct, 
        // but Twilio sends application/x-www-form-urlencoded.
        // If req.body is already an object, great. If string, we verify.

        const incomingMsg = body.Body || "";
        const sender = body.From; // "whatsapp:+1..."
        const numMedia = parseInt(body.NumMedia || "0");

        console.log(`[Twilio Webhook] From: ${sender}, Media: ${numMedia}, Text: "${incomingMsg}"`);

        let responseText = "";

        // 1. IMAGE HANDLING (Visual Cortex)
        if (numMedia > 0) {
            const mediaUrl = body.MediaUrl0;
            const mediaType = body.MediaContentType0;

            console.log(`[Twilio Webhook] Processing Image: ${mediaUrl} (${mediaType})`);

            if (mediaType.startsWith('image/')) {
                // Determine user intent from caption or default to appraisal
                const intentPrompt = incomingMsg ? `User said: "${incomingMsg}".` : "";

                // Fetch Image Buffer
                const imageResp = await fetch(mediaUrl);
                const arrayBuffer = await imageResp.arrayBuffer();
                const b64 = Buffer.from(arrayBuffer).toString('base64');

                // Analyze with Gemini
                const prompt = `
                    ACT AS: Richard Automotive F&I Manager.
                    TASK: Analyze this car photo sent by a customer via WhatsApp.
                    CONTEXT: ${intentPrompt}
                    
                    OUTPUT: A friendly, short WhatsApp response (in Spanish from Puerto Rico).
                    - Identify the car (Make, Model, Year approx).
                    - Give a rough "Trade-in Range" estimate based on market value (be conservative).
                    - Ask if they want to schedule an inspection.
                    - Tone: Helpful, fast, professional.
                    - Max length: 3 sentences.
                `;

                const result = await model.generateContent([
                    prompt,
                    { inlineData: { data: b64, mimeType: mediaType } }
                ]);

                responseText = (await result.response).text();
            } else {
                responseText = "📁 Recibí tu archivo, pero por ahora solo puedo analizar fotos de vehículos (JPG/PNG).";
            }
        }
        // 2. TEXT HANDLING (Standard Chat)
        else {
            // For now, simple echo or redirect to agent. 
            // Phase 11 will connect this to the full RAG memory.
            responseText = `Hola! Soy el asistente virtual de Richard Automotive. Recibí tu mensaje: "${incomingMsg}". \n\nPara tasaciones, envíame una foto de tu auto. Para ventas, llama al 787-368-2880.`;
        }

        // 3. SEND RESPONSE (TwiML)
        // We use TwiML for immediate synchronous reply which is faster/cheaper than API call.
        res.setHeader('Content-Type', 'text/xml');
        const twiml = `
            <Response>
                <Message>
                    <Body>${escapeXml(responseText)}</Body>
                </Message>
            </Response>
        `;

        return res.status(200).send(twiml);

    } catch (error: any) {
        console.error("Webhook Error:", error);
        // Fallback TwiML
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(`
            <Response>
                <Message>Lo siento, tuve un error técnico procesando tu mensaje. Intenta nuevamente.</Message>
            </Response>
        `);
    }
}

// Simple XML escaper
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
        return c;
    });
}
