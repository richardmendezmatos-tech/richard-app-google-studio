import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { onCallGenkit } from 'firebase-functions/https';

// Initialize Genkit with Google AI plugin
const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-1.0-pro',
});

// Define the Flow
export const generateCarDescription = ai.defineFlow(
    {
        name: 'generateCarDescription',
        inputSchema: z.object({
            carModel: z.string(),
            features: z.array(z.string()).optional(),
        }),
        outputSchema: z.string(),
        streamSchema: z.string(),
    },
    async (input, { sendChunk }) => {
        const { carModel, features } = input;

        const prompt = `
      Eres un experto en marketing automotriz para el mercado de Puerto Rico.
      Escribe una descripción persuasiva y emocionante para vender un ${carModel}.
      
      ${features && features.length > 0 ? `Destaca estas características: ${features.join(', ')}.` : ''}
      
      La descripción debe ser corta (máximo 3 párrafos), usar un tono profesional pero entusiasta, 
      y mencionar que está disponible en "Richard Automotive".
    `;

        const { response, stream } = await ai.generateStream(prompt);

        for await (const chunk of stream) {
            sendChunk(chunk.text);
        }

        const result = await response;
        return result.text;
    }
);

export const generateDescription = onCallGenkit({
    authPolicy: () => true, // Allow all for dev/demo purposes
    cors: true,
}, generateCarDescription);


// Import Cloud Functions v2
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { sendNotificationEmail } from './services/emailService';

// --- New Lead Notification & Analysis ---

// Define a Flow for Lead Analysis
export const analyzeLead = ai.defineFlow(
    {
        name: 'analyzeLead',
        inputSchema: z.object({
            monthlyIncome: z.string(),
            timeAtJob: z.string(),
            jobTitle: z.string(),
            employer: z.string(),
            vehicleId: z.string().optional()
        }),
        outputSchema: z.object({
            score: z.number().describe("Score from 1-100 based on financial stability"),
            category: z.enum(["High Potential", "Standard", "Needs Review"]),
            summary: z.string().describe("Brief analysis for the sales agent"),
            recommendedAction: z.string()
        })
    },
    async (input) => {
        // RAG-Lite: Fetch Vehicle Context
        let vehicleContext = "No vehicle specified.";
        if (input.vehicleId) {
            try {
                const carDoc = await db.collection('cars').doc(input.vehicleId).get();
                if (carDoc.exists) {
                    const car = carDoc.data();
                    vehicleContext = `Vehicle: ${car?.year} ${car?.make} ${car?.model}, Price: $${car?.price}, Mileage: ${car?.mileage}`;
                }
            } catch (e) {
                console.error("Error fetching vehicle context:", e);
            }
        }

        const prompt = `
        Analiza este lead para un concesionario de autos:
        - Ingreso Mensual: ${input.monthlyIncome}
        - Tiempo en Empleo: ${input.timeAtJob}
        - Título: ${input.jobTitle}
        - Empleador: ${input.employer}
        - Contexto del Vehículo: ${vehicleContext}

        Si el vehículo es costoso y el ingreso bajo, ajusta el score y la recomendación.
        
        Responde ESTRICTAMENTE con este JSON:
        {
            "score": (número 1-100 basado en estabilidad financiera y capacidad de compra),
            "category": ("High Potential" | "Standard" | "Needs Review"),
            "summary": (Breve análisis de 1 frase considerando el auto de interés),
            "recommendedAction": (Acción recomendada para el vendedor)
        }
        `;

        const result = await ai.generate({
            prompt: prompt,
            output: { format: 'json' }
        });

        return result.output;
    }
);

// --- Conversational AI (Chat / WhatsApp) ---

const SALES_STAGES = `
1. Introduction: Start conversation, introduce Richard Automotive. Verify they are speaking to the right person if needed.
2. Qualification: Confirm if they are buying, trading-in, or just looking. Ask for budget or specific needs.
3. Value Proposition: Explain why Richard Automotive is the best (Lifetime Warranty, fast service).
4. Needs Analysis: detailed questions about what they need in a car (SUV vs Sedan, Gas vs Hybrid).
5. Solution Presentation: Recommend specific cars from inventory based on needs.
6. Objection Handling: Address price/financing concerns politely.
7. Close: Ask to schedule a Test Drive or Visit.
8. End: Polite goodbye.
`;

export const chatWithLead = ai.defineFlow(
    {
        name: 'chatWithLead',
        inputSchema: z.object({
            history: z.array(z.object({ role: z.enum(['user', 'model']), content: z.string() })),
            message: z.string(),
            vehicleId: z.string().optional()
        }),
        outputSchema: z.string()
    },
    async (input) => {
        // RAG-Lite: Fetch Vehicle Data for Context
        let knowledgeBase = `Eres Richard IA, el vendedor estrella de Richard Automotive.
Tu objetivo es mover al cliente a través de estas ETAPAS DE VENTA:
${SALES_STAGES}

INSTRUCCIONES:
- Analiza el historial para determinar la ETAPA ACTUAL.
- Tu respuesta debe intentar mover la conversación a la siguiente etapa lógica.
- Sé breve y profesional.
- Si el cliente pregunta precio, DÁSELO. No lo escondas.
- Si el cliente muestra interés claro, intenta CERRAR (Agendar Cita).
`;

        if (input.vehicleId) {
            const carDoc = await db.collection('cars').doc(input.vehicleId).get();
            if (carDoc.exists) {
                const car = carDoc.data();
                knowledgeBase += `\nCONTEXTO DEL VEHÍCULO DE INTERÉS:
                Marca/Modelo: ${car?.year} ${car?.make} ${car?.model}. 
                Precio: $${car?.price}. Millaje: ${car?.mileage || 'N/A'}. 
                Características: ${car?.features?.join(', ') || 'No listadas'}.
                Usa esto para la etapa de "Solution Presentation".`;
            }
        }

        const result = await ai.generate({
            prompt: `${knowledgeBase}\n\nHISTORIAL DE CONVERSACIÓN:\n${JSON.stringify(input.history)}\n\nCLIENTE (Mensaje Actual): "${input.message}"\n\nRICHARD IA:`,
        });

        return result.text;
    }
);

import { onRequest } from 'firebase-functions/v2/https';

// Generic Webhook for WhatsApp (compatible with Twilio payload)
export const incomingWhatsAppMessage = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Twilio sends form-urlencoded POST requests
    const { Body, From, VehicleId } = req.body;

    logger.info(`WhatsApp Message from ${From}: ${Body}`);

    try {
        const chatId = From.replace(/\D/g, ''); // Use numbers only for ID
        const chatRef = db.collection('chats').doc(chatId);
        const chatDoc = await chatRef.get();

        let localHistory: { role: 'user' | 'model'; content: string }[] = [];

        if (chatDoc.exists) {
            const data = chatDoc.data();
            if (data?.messages) {
                // Keep last 10 messages for context window
                localHistory = data.messages.slice(-10).map((m: any) => ({
                    role: m.role,
                    content: m.content
                }));
            }
        }

        const replyText = await chatWithLead({
            history: localHistory,
            message: Body || "Hola",
            vehicleId: VehicleId
        });

        // Save new interaction to history
        await chatRef.set({
            messages: [
                ...(chatDoc.exists ? chatDoc.data()?.messages || [] : []),
                { role: 'user', content: Body || '', timestamp: new Date() },
                { role: 'model', content: replyText, timestamp: new Date() }
            ],
            lastUpdated: new Date(),
            phone: From
        }, { merge: true });

        // Use Twilio Service to generate TwiML XML
        const { createTwiMLReply } = await import('./services/twilioService');
        const twiml = createTwiMLReply(replyText);

        // Log the reply for debugging
        logger.info(`AI Reply to ${From}: ${replyText}`);

        // Return XML content type for Twilio
        res.set('Content-Type', 'text/xml');
        res.status(200).send(twiml);

    } catch (error) {
        logger.error("Error processing WhatsApp message", error);
        res.status(500).send('AI Error');
    }
});

export const onNewApplication = onDocumentCreated('applications/{applicationId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        return;
    }

    const data = snapshot.data();
    const appId = event.params.applicationId;

    logger.info(`[NEW LEAD]Application received: ${appId}`, { email: data.email });

    try {
        // Run AI Analysis
        // Note: We intentionally call the flow directly here since we are in the same runtime.
        const analysis = await analyzeLead({
            monthlyIncome: data.monthlyIncome || "0",
            timeAtJob: data.timeAtJob || "Unspecified",
            jobTitle: data.jobTitle || "Unspecified",
            employer: data.employer || "Unspecified"
        });

        // Send Real Email to Admin
        try {
            await sendNotificationEmail({
                to: 'richardmendezmatos@gmail.com',
                subject: `New Lead - ${data.firstName} ${data.lastName} (${analysis.category})`,
                html: `
                    <h2>New Lead Received</h2>
                    <p><strong>Applicant:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <hr>
                    <h3>AI Analysis</h3>
                    <p><strong>Score:</strong> ${analysis.score}/100</p>
                    <p><strong>Category:</strong> ${analysis.category}</p>
                    <p><strong>Summary:</strong> ${analysis.summary}</p>
                    <p><strong>Recommended Action:</strong> ${analysis.recommendedAction}</p>
                `
            });

            // Send Automated Welcome Email to Client
            if (data.email) {
                const { getWelcomeEmailTemplate } = await import('./emailTemplates');
                await sendNotificationEmail({
                    to: data.email,
                    subject: `🚗 Recibimos tu solicitud para: ${data.vehicleOfInterest || 'Richard Automotive'}`,
                    html: getWelcomeEmailTemplate(data)
                });
                logger.info(`Welcome email sent to: ${data.email}`);
            }

        } catch (emailError) {
            logger.error("Failed to send email", emailError);
        }

        await snapshot.ref.update({
            aiAnalysis: analysis,
            status: analysis.score > 80 ? 'pre-approved' : 'new', // Use normalized 'new' instead of pending_review
            emailSent: true,
            lastContacted: new Date()
        });

    } catch (err) {
        logger.error("Error analyzing lead", err);
    }
});

// --- Scheduled Marketing Automation ---

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Admin SDK (if not already done)
if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

export const checkStaleLeads = onSchedule('every day 09:00', async (event) => {
    logger.info("Running Stale Lead Check...");

    // 3 Days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    try {
        const leadsRef = db.collection('applications');
        const snapshot = await leadsRef
            .where('status', '==', 'new')
            .where('timestamp', '<=', Timestamp.fromDate(threeDaysAgo))
            // .where('nudgeSent', '!=', true) // Requires index or separate query
            .limit(50)
            .get();

        if (snapshot.empty) {
            logger.info("No stale leads found.");
            return;
        }

        const { getNudgeEmailTemplate } = await import('./emailTemplates');

        let emailCount = 0;
        const batch = db.batch();

        for (const doc of snapshot.docs) {
            const lead = doc.data();

            // Client-side filtering if index is missing/complex
            if (lead.nudgeSent || !lead.email) continue;

            try {
                await sendNotificationEmail({
                    to: lead.email,
                    subject: `¿Sigues buscando auto, ${lead.firstName}? 🤔`,
                    html: getNudgeEmailTemplate(lead)
                });

                batch.update(doc.ref, {
                    nudgeSent: true,
                    lastContacted: new Date(),
                    aiSummary: lead.aiSummary + " [Auto-Nudge Sent]"
                });
                emailCount++;
            } catch (e) {
                logger.error(`Failed to nudge lead ${doc.id}`, e);
            }
        }

        await batch.commit();
        logger.info(`Nudge campaign completed. Emailed ${emailCount} leads.`);

    } catch (error) {
        logger.error("Error in checkStaleLeads", error);
    }
});

export const cleanupOldLogs = onSchedule('every sunday 00:00', async (event) => {
    logger.info("Running Log Cleanup...");
    // 30 Days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        const logsRef = db.collection('audit_logs');
        const snapshot = await logsRef
            .where('timestamp', '<=', Timestamp.fromDate(thirtyDaysAgo))
            .limit(500) // Batch limit
            .get();

        if (snapshot.empty) {
            logger.info("No old logs to clean.");
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        logger.info(`Deleted ${snapshot.size} old logs.`);
    } catch (error) {
        logger.error("Error cleaning logs", error);
    }
});

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';

export const onVehicleUpdate = onDocumentUpdated('cars/{carId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Check for Price Drop
    if (after.price < before.price) {
        const carId = event.params.carId;
        const oldPrice = Number(before.price);
        const newPrice = Number(after.price);

        logger.info(`Price Drop Detected for ${carId}: ${oldPrice} -> ${newPrice}`);

        // Find interested leads
        const leadsRef = db.collection('applications');
        const snapshot = await leadsRef
            .where('vehicleId', '==', carId)
            // Optional: Filter by status to avoid emailing sold leads
            // .where('status', 'in', ['new', 'contacted', 'negotiating']) 
            .get();

        if (snapshot.empty) {
            logger.info("No leads interested in this vehicle.");
            return;
        }

        const { getPriceDropEmailTemplate } = await import('./emailTemplates');
        let emailCount = 0;

        for (const doc of snapshot.docs) {
            const lead = doc.data();
            if (!lead.email) continue;

            try {
                await sendNotificationEmail({
                    to: lead.email,
                    subject: `🚨 ¡Bajó de Precio! ${lead.vehicleOfInterest || 'El auto que te gusta'}`,
                    html: getPriceDropEmailTemplate(lead, oldPrice, newPrice)
                });
                emailCount++;
            } catch (e) {
                logger.error(`Failed to send price drop alert to ${lead.email}`, e);
            }
        }
        logger.info(`Price Drop Alert sent to ${emailCount} leads.`);
    }
});

export const onLeadStatusChange = onDocumentUpdated('applications/{leadId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const oldStatus = before.status;
    const newStatus = after.status;

    // Only react if status CHANGED
    if (oldStatus === newStatus) return;

    logger.info(`Lead Status Changed: ${oldStatus} -> ${newStatus} for ${event.params.leadId}`);

    const lead = after;
    if (!lead.email) return;

    const { getContactedEmailTemplate, getSoldEmailTemplate } = await import('./emailTemplates');

    try {
        if (newStatus === 'contacted' && oldStatus === 'new') {
            await sendNotificationEmail({
                to: lead.email,
                subject: `📋 Actualización: Estamos revisando tu solicitud`,
                html: getContactedEmailTemplate(lead)
            });
            logger.info(`Contacted email sent to ${lead.email}`);
        } else if (newStatus === 'sold') {
            await sendNotificationEmail({
                to: lead.email,
                subject: `🎉 ¡Felicidades por tu nuevo auto!`,
                html: getSoldEmailTemplate(lead)
            });
            logger.info(`Sold email sent to ${lead.email}`);
        }
    } catch (e) {
        logger.error(`Failed to send status update email to ${lead.email}`, e);
    }
});

// Start a flow server for local development handling stream requests
import { startFlowServer } from '@genkit-ai/express';
if (process.env.GENKIT_ENV === 'dev') {
    startFlowServer({
        flows: [generateCarDescription, analyzeLead],
        port: 3400,
        cors: { origin: '*' }
    });
}

