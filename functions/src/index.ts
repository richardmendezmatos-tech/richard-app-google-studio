import { z } from 'genkit';
import { onCallGenkit } from 'firebase-functions/https';
import * as logger from 'firebase-functions/logger';
import { db } from './services/firebaseAdmin';
import { ai } from './services/aiManager';
import { orchestrateResponse } from './agents/rag-synergy-logic';

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
        const cacheKey = `car_desc_${carModel.toLowerCase().replace(/\s+/g, '_')}_${features?.join('_').toLowerCase().replace(/\s+/g, '_')}`;

        // 1. Check Cache
        const { cache } = await import('./services/cacheService');
        const cachedResult = await cache.get<string>(cacheKey);

        if (cachedResult) {
            logger.info(`Cache Hit for ${cacheKey}`);
            sendChunk(cachedResult);
            return cachedResult;
        }

        logger.info(`Cache Miss for ${cacheKey}. Generating via AI...`);

        const prompt = `
      Eres un experto en marketing automotriz para el mercado de Puerto Rico.
      Escribe una descripción persuasiva y emocionante para vender un ${carModel}.
      
      ${features && features.length > 0 ? `Destaca estas características: ${features.join(', ')}.` : ''}
      
      La descripción debe ser corta (máximo 3 párrafos), usar un tono profesional pero entusiasta, 
      y mencionar que está disponible en "Richard Automotive".
    `;

        const { response, stream } = await ai.generateStream(prompt);

        let fullText = '';
        for await (const chunk of stream) {
            fullText += chunk.text;
            sendChunk(chunk.text);
        }

        const result = await response;
        const output = result.text || fullText;

        // 2. Save to Cache (TTL 24 hours)
        await cache.set(cacheKey, output, 86400);

        return output;
    }
);

export const generateDescription = onCallGenkit({
    authPolicy: () => true, // Allow all for dev/demo purposes
    cors: true,
    minInstances: 1, // CTO: Eliminate Cold Start for CEO critical path
    memory: "512MiB",
}, generateCarDescription);

// --- Semantic Search Flow ---
export const semanticCarSearch = ai.defineFlow(
    {
        name: 'semanticCarSearch',
        inputSchema: z.object({ query: z.string() }),
        outputSchema: z.array(z.any()),
    },
    async (input) => {
        const { semanticSearch } = await import('./services/vectorService');
        return await semanticSearch(input.query);
    }
);

export const searchCarsSemantic = onCallGenkit({
    authPolicy: () => true,
    cors: true,
    minInstances: 1, // CTO: Instant AI search for premium UX
    memory: "512MiB",
}, semanticCarSearch);

export const reindexInventory = ai.defineFlow(
    { name: 'reindexInventory', inputSchema: z.void(), outputSchema: z.string() },
    async () => {
        const { db } = await import('./services/firebaseAdmin');
        const { updateCarEmbedding } = await import('./services/vectorService');
        const snapshot = await db.collection('cars').get();
        let count = 0;
        for (const doc of snapshot.docs) {
            await updateCarEmbedding(doc.id, doc.data());
            count++;
        }
        return `Re-indexed ${count} cars.`;
    }
);

export const triggerReindex = onCallGenkit({ authPolicy: () => true, cors: true }, reindexInventory);


// Import Cloud Functions v2
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { sendNotificationEmail } from './services/emailService';

// --- New Lead Notification & Analysis ---
import { calculateLeadScore } from './lead-scoring/lead-scoring-logic';

// Define a Flow for Lead Analysis
export const analyzeLead = ai.defineFlow(
    {
        name: 'analyzeLead',
        inputSchema: z.object({
            monthlyIncome: z.string(),
            timeAtJob: z.string(),
            jobTitle: z.string(),
            employer: z.string(),
            vehicleId: z.string().optional(),
            hasPronto: z.boolean().optional(),
            chatInteractions: z.number().optional(),
            viewedInventoryMultipleTimes: z.boolean().optional(),
            location: z.string().optional()
        }),
        outputSchema: z.object({
            score: z.number(),
            category: z.string(),
            insights: z.array(z.string()),
            nextAction: z.string(),
            reasoning: z.string(),
            unidad_interes: z.string()
        })
    },
    async (input) => {
        // RAG-Lite: Fetch Vehicle Context
        let vehicleContext = "No vehicle specified.";
        let unidad_interes = input.vehicleId || "General";

        if (input.vehicleId) {
            try {
                const carDoc = await db.collection('cars').doc(input.vehicleId).get();
                if (carDoc.exists) {
                    const car = carDoc.data();
                    unidad_interes = `${car?.year} ${car?.make} ${car?.model}`;
                    vehicleContext = `Vehicle: ${unidad_interes}, Price: $${car?.price}, Mileage: ${car?.mileage}`;
                    console.log(`Analyzing lead with vehicle context: ${vehicleContext}`);
                }
            } catch (e) {
                console.error("Error fetching vehicle context:", e);
            }
        }

        const scoringResult = calculateLeadScore(input);

        return {
            ...scoringResult,
            unidad_interes
        };
    }
);

// --- Conversational AI (Chat / WhatsApp) ---

export const chatWithLead = ai.defineFlow(
    {
        name: 'chatWithLead',
        inputSchema: z.object({
            leadId: z.string().optional(),
            message: z.string(),
            vehicleId: z.string().optional(),
            history: z.array(z.object({
                role: z.enum(['user', 'model']),
                content: z.string()
            })).optional()
        }),
        outputSchema: z.string()
    },
    async (input) => {
        // Fetch Lead Context if leadId is provided
        let leadContext = {};
        if (input.leadId) {
            const leadDoc = await db.collection('applications').doc(input.leadId).get();
            if (leadDoc.exists) {
                leadContext = leadDoc.data() || {};
            }
        }

        // Fetch Vehicle Context
        let vehicleContext = null;
        if (input.vehicleId) {
            const carDoc = await db.collection('cars').doc(input.vehicleId).get();
            if (carDoc.exists) {
                vehicleContext = carDoc.data();
            }
        }

        const result = await orchestrateResponse({
            message: input.message,
            history: input.history || [],
            leadContext,
            vehicleContext
        });

        return result.response;
    }
);

// --- Phase 4: Smart Garage & Predictive Retention ---

export const predictTradeInValue = ai.defineFlow(
    {
        name: 'predictTradeInValue',
        inputSchema: z.object({
            make: z.string(),
            model: z.string(),
            year: z.number(),
            mileage: z.number(),
            condition: z.enum(['excellent', 'good', 'fair', 'poor'])
        }),
        outputSchema: z.object({
            estimatedValue: z.number(),
            confidence: z.number(),
            marketTrends: z.string()
        })
    },
    async (input) => {
        logger.info(`Predicting trade-in value for ${input.year} ${input.make} ${input.model}`);

        const result = await ai.generate({
            prompt: `Eres un experto en valoración de autos en Puerto Rico. 
            Analiza: ${input.year} ${input.make} ${input.model}, Millaje: ${input.mileage}, Condición: ${input.condition}.
            RETORNA JSON: { "estimatedValue": number, "marketTrends": "string" }`,
            config: { temperature: 0.1 }
        });

        const data = JSON.parse(result.text);
        return {
            ...data,
            confidence: 0.85
        };
    }
);

export const getUserGarage = ai.defineFlow(
    {
        name: 'getUserGarage',
        inputSchema: z.object({ userId: z.string() }),
        outputSchema: z.array(z.any())
    },
    async (input) => {
        const snapshot = await db.collection('users').doc(input.userId).collection('garage').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
);

// --- Phase 3: Advanced RAG & Voice AI Flows ---

export const multiAgentSync = ai.defineFlow(
    {
        name: 'multiAgentSync',
        inputSchema: z.object({ message: z.string(), leadId: z.string() }),
        outputSchema: z.any()
    },
    async (input) => {
        const leadDoc = await db.collection('applications').doc(input.leadId).get();
        const leadData = leadDoc.data();

        return await orchestrateResponse({
            message: input.message,
            history: [],
            leadContext: leadData
        });
    }
);

export const transcribeAudio = ai.defineFlow(
    {
        name: 'transcribeAudio',
        inputSchema: z.object({ audioBase64: z.string() }),
        outputSchema: z.object({ text: z.string(), confidence: z.number() })
    },
    async (_input) => {
        logger.info("Voice AI: Received audio for transcription");
        // Placeholder for Gemini 1.5 Flash Audio-to-Text
        return {
            text: "Simulated transcription: ¿Tienen la Toyota Tacoma 2024 en inventario?",
            confidence: 0.98
        };
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
                localHistory = (data.messages as { role: 'user' | 'model', content: string }[]).slice(-10).map((m) => ({
                    role: m.role,
                    content: m.content
                }));
            }
        }

        const replyText = await chatWithLead({
            history: localHistory,
            message: Body || "Hola",
            vehicleId: VehicleId,
            leadId: chatId
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

// --- Inventory Semantic Indexing ---

export const onCarCreated = onDocumentCreated('cars/{carId}', async (event) => {
    const data = event.data?.data();
    if (!data) return;

    logger.info(`Indexing new car: ${event.params.carId}`);
    try {
        const { updateCarEmbedding } = await import('./services/vectorService');
        await updateCarEmbedding(event.params.carId, data);
    } catch (e) {
        logger.error(`Error indexing car ${event.params.carId}:`, e);
    }
});

export const onCarUpdated = onDocumentUpdated('cars/{carId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const coreFieldsChanged =
        before.name !== after.name ||
        before.type !== after.type ||
        before.description !== after.description ||
        JSON.stringify(before.features) !== JSON.stringify(after.features);

    if (coreFieldsChanged) {
        logger.info(`Re-indexing car due to changes: ${event.params.carId}`);
        try {
            const { updateCarEmbedding } = await import('./services/vectorService');
            await updateCarEmbedding(event.params.carId, after);
        } catch (e) {
            logger.error(`Error re-indexing car ${event.params.carId}:`, e);
        }
    }
});

export const onNewApplication = onDocumentCreated({
    document: 'applications/{applicationId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
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
                subject: `New Lead - ${data.firstName} ${data.lastName} (Score: ${analysis.score})`,
                html: `
                    <h2>New Lead Received</h2>
                    <p><strong>Applicant:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <hr>
                    <h3>AI Analysis</h3>
                    <p><strong>Score:</strong> ${analysis.score}/100 (${analysis.category})</p>
                    <p><strong>Interés:</strong> ${analysis.unidad_interes}</p>
                    <p><strong>Resumen:</strong> ${analysis.reasoning}</p>
                    <p><strong>Siguiente Paso:</strong> ${analysis.nextAction}</p>
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
import { Timestamp } from 'firebase-admin/firestore';

export const checkStaleLeads = onSchedule({
    schedule: 'every day 09:00',
    secrets: ["SENDGRID_API_KEY"],
}, async () => {
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

export const cleanupOldLogs = onSchedule('every sunday 00:00', async () => {
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


export const onVehicleUpdate = onDocumentUpdated({
    document: 'cars/{carId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
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

export const onLeadStatusChange = onDocumentUpdated({
    document: 'applications/{leadId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
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

// Passport.js Integration
import authApp from './authApp';
export const authApi = onRequest({ cors: true }, authApp);

// Google One Tap Verification
export { verifyGoogleToken } from './googleOneTap';

// Start a flow server for local development handling stream requests
import { startFlowServer } from '@genkit-ai/express';
if (process.env.GENKIT_ENV === 'dev') {
    startFlowServer({
        flows: [generateCarDescription, analyzeLead],
        port: 3400,
        cors: { origin: '*' }
    });
}

// --- AI Evaluation Pipeline ---
export { triggerEval } from './evals';

// --- Email Automation & Marketing (SendGrid) ---
export { onLeadCreated, onAppointmentCompleted } from './triggers/emailTriggers';
export { processEmailQueue } from './scheduled/emailScheduler';
export { sendgridWebhook } from './webhooks/sendgridWebhook';

// --- Vercel AI SDK (Streaming) ---
export { chatStream } from './chatStream';
