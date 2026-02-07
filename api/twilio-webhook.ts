import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import twilio from 'twilio';

/**
 * RICHARD AUTOMOTIVE - TWILIO WEBHOOK (Phase 11 Enhanced)
 * Handles incoming WhatsApp messages with:
 * - Automatic lead creation
 * - Conversation history tracking
 * - Enhanced RAG with context
 * - Visual Cortex integration
 */

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "");

// Initialize Twilio Client
const twilioClient = new twilio.Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Helper: Get or create lead from phone number
async function getOrCreateLead(phone: string, firstMessage: string) {
    try {
        // This would normally call leadService, but we'll use a simple in-memory approach
        // for the serverless environment
        return {
            id: phone.replace(/\D/g, ''), // Use phone as ID for now
            phone,
            source: 'whatsapp' as const,
            status: 'new' as const,
            firstMessage
        };
    } catch (error) {
        console.error('Error getting/creating lead:', error);
        return null;
    }
}

// Helper: Save message to conversation history
async function saveMessage(leadId: string, role: 'user' | 'assistant', content: string) {
    try {
        // In a real implementation, this would call conversationService
        // For serverless, we'll log it for now
        console.log(`[Conversation] ${leadId} - ${role}: ${content.substring(0, 50)}...`);
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

// Helper: Generate contextual response
async function generateResponse(userMessage: string, leadId: string): Promise<string> {
    try {
        // Simple contextual response for now
        // In full implementation, this would call generateContextualResponse from geminiService
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Eres el asistente virtual de Richard Automotive en Puerto Rico.
        
Cliente dice: "${userMessage}"

Responde de forma profesional, cercana y útil. Si preguntan por autos, menciona que pueden enviar fotos para tasación.
Si preguntan por financiamiento, ofrece agendar una cita al 787-368-2880.

Mantén la respuesta corta (máximo 2-3 líneas).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating response:', error);
        return `Hola! Soy el asistente virtual de Richard Automotive. Recibí tu mensaje: "${userMessage}". \n\nPara tasaciones, envíame una foto de tu auto. Para ventas, llama al 787-368-2880.`;
    }
}

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

        // PHASE 11: Get or create lead
        const lead = await getOrCreateLead(sender, incomingMsg);
        if (!lead) {
            throw new Error('Failed to create/retrieve lead');
        }

        // PHASE 11: Save user message
        await saveMessage(lead.id, 'user', incomingMsg);

        let responseText = "";

        // 1. IMAGE HANDLING (Visual Cortex via Internal API)
        if (numMedia > 0) {
            const mediaUrl = body.MediaUrl0;
            const mediaType = body.MediaContentType0;

            console.log(`[Twilio Webhook] Processing Image: ${mediaUrl} (${mediaType})`);

            if (mediaType.startsWith('image/')) {
                try {
                    // Call our internal Visual Cortex endpoint
                    const baseUrl = process.env.VERCEL_URL
                        ? `https://${process.env.VERCEL_URL}`
                        : 'https://www.richard-automotive.com';

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
        // 2. TEXT HANDLING (PHASE 11: Enhanced RAG)
        else {
            responseText = await generateResponse(incomingMsg, lead.id);
        }

        // PHASE 11: Save assistant response
        await saveMessage(lead.id, 'assistant', responseText);

        // 3. SEND RESPONSE (TwiML)
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
