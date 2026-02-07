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
        const incomingMsg = body.Body || "";
        const sender = body.From; // "whatsapp:+1..."
        const numMedia = parseInt(body.NumMedia || "0");

        console.log(`[Twilio Webhook] From: ${sender}, Media: ${numMedia}, Text: "${incomingMsg}"`);

        let responseText = "";

        // 1. IMAGE HANDLING (Visual Cortex via Internal API)
        if (numMedia > 0) {
            const mediaUrl = body.MediaUrl0;
            const mediaType = body.MediaContentType0;

            console.log(`[Twilio Webhook] Processing Image: ${mediaUrl} (${mediaType})`);

            if (mediaType.startsWith('image/')) {
                try {
                    // Call our internal Visual Cortex endpoint
                    // This bypasses the direct SDK limitation by using the serverless function
                    const baseUrl = process.env.VERCEL_URL
                        ? `https://${process.env.VERCEL_URL}`
                        : 'http://localhost:3000';

                    const cortexResponse = await fetch(`${baseUrl}/api/process-image`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            imageUrl: mediaUrl,
                            prompt: incomingMsg || "Analyze this car for trade-in appraisal"
                        })
                    });

                    const cortexData = await cortexResponse.json();

                    if (cortexData.success && cortexData.data) {
                        const car = cortexData.data;
                        responseText = `🚗 Veo un **${car.make || 'vehículo'} ${car.model || ''}** ${car.year ? `(${car.year})` : ''}.\n\n` +
                            `Basado en el mercado actual, el valor estimado es **$${car.estimatedMarketValue?.toLocaleString() || 'por determinar'}**.\n\n` +
                            `¿Te gustaría agendar una inspección para una tasación oficial? 📞 787-368-2880`;
                    } else {
                        responseText = "📷 Recibí tu foto, pero no pude identificar el vehículo claramente. ¿Puedes enviar otra foto más nítida o decirme el modelo?";
                    }
                } catch (error) {
                    console.error("Visual Cortex Internal Call Error:", error);
                    responseText = "📷 Recibí tu foto. Estoy procesándola, pero tuve un problema técnico. Intenta nuevamente o llama al 787-368-2880.";
                }
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
