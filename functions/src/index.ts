import { z } from 'genkit';
import { onCallGenkit } from 'firebase-functions/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as logger from 'firebase-functions/logger';
import { ai } from './services/aiManager';
import { orchestrateResponse } from './agents/rag-synergy-logic';
import { requireAdmin, requireSignedIn } from './security/policies';
import { getRequestUrlForSignature, shouldEnforceWebhookSignatures } from './security/webhooks';
import { logFlowExecution } from './services/persistenceService';
// import { sendNotificationEmail } from './services/emailService';
import { InventoryMatchingService } from './services/inventoryMatchingService';
import { FirestoreLeadRepository } from './infrastructure/repositories/FirestoreLeadRepository';
import { FirestoreInventoryRepository } from './infrastructure/repositories/FirestoreInventoryRepository';
import { FirestoreLogRepository } from './infrastructure/repositories/FirestoreLogRepository';
import { FirestoreChatRepository } from './infrastructure/repositories/FirestoreChatRepository';
import { SendGridEmailRepository } from './infrastructure/repositories/SendGridEmailRepository';
import { TwilioSMSRepository } from './infrastructure/repositories/TwilioSMSRepository';
import { MetaCapiRepository } from './infrastructure/repositories/MetaCapiRepository';
import { ReindexInventory } from './application/use-cases/ReindexInventory';
import { AnalyzeLead } from './application/use-cases/AnalyzeLead';
import { NudgeStaleLeads } from './application/use-cases/NudgeStaleLeads';
import { CleanAuditLogs } from './application/use-cases/CleanAuditLogs';
import { NotifyPriceDrop } from './application/use-cases/NotifyPriceDrop';
import { NotifyLeadStatusChange } from './application/use-cases/NotifyLeadStatusChange';
import { GenkitAgentOrchestrator } from './infrastructure/repositories/GenkitAgentOrchestrator';
import { ProcessWhatsAppMessage } from './application/use-cases/ProcessWhatsAppMessage';
import { ProcessNewLeadApplication } from './application/use-cases/ProcessNewLeadApplication';
import { Lead } from './domain/entities';

// Infrastructure Instantiation (Singleton-like)
const leadRepository = new FirestoreLeadRepository();
const inventoryRepository = new FirestoreInventoryRepository();
const logRepository = new FirestoreLogRepository();
const emailRepository = new SendGridEmailRepository();
const smsRepository = new TwilioSMSRepository();
const metaRepository = new MetaCapiRepository();
const chatRepository = new FirestoreChatRepository();
const aiOrchestrator = new GenkitAgentOrchestrator();

// Use Cases
const whatsAppProcessor = new ProcessWhatsAppMessage(chatRepository, leadRepository, aiOrchestrator, inventoryRepository);
const leadAppProcessor = new ProcessNewLeadApplication(leadRepository, emailRepository, smsRepository, metaRepository);

const ALLOWED_ORIGINS = [
    "https://richard-automotive.vercel.app",
    "https://richard-automotive-dev.web.app",
    "http://localhost:5173"
];

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
    authPolicy: (auth) => requireSignedIn(auth),
    cors: ALLOWED_ORIGINS,
    secrets: ["GEMINI_API_KEY"],
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
    authPolicy: (auth) => requireSignedIn(auth),
    cors: ALLOWED_ORIGINS,
    secrets: ["GEMINI_API_KEY"],
    minInstances: 1, // CTO: Instant AI search for premium UX
    memory: "512MiB",
}, semanticCarSearch);

export const reindexInventory = ai.defineFlow(
    { name: 'reindexInventory', inputSchema: z.void(), outputSchema: z.string() },
    async () => {
        const { updateCarEmbedding } = await import('./services/vectorService');
        const useCase = new ReindexInventory(inventoryRepository);
        const count = await useCase.execute(async (id, data) => {
            await updateCarEmbedding(id, data);
        });
        return `Re-indexed ${count} cars.`;
    }
);

export const triggerReindex = onCallGenkit({
    authPolicy: (auth) => requireAdmin(auth),
    cors: ALLOWED_ORIGINS,
    secrets: ["GEMINI_API_KEY"],
}, reindexInventory);



// Initialized above

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
        const useCase = new AnalyzeLead(inventoryRepository);
        return await useCase.execute(input);
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
        // Fetch Lead Context if leadId is provided (Agnostic via Repository)
        let leadContext = {};
        if (input.leadId) {
            const leadData = await leadRepository.getById(input.leadId);
            leadContext = leadData || {};
        }

        // Fetch Vehicle Context (Agnostic via Repository)
        let vehicleContext = null;
        if (input.vehicleId) {
            vehicleContext = await inventoryRepository.getById(input.vehicleId);
        }

        const result = await aiOrchestrator.orchestrate({
            message: input.message,
            history: input.history || [],
            leadContext,
            vehicleContext,
            leadId: input.leadId
        });

        // Automate Persistence Protocol (Richard Automotive Standard)
        await logFlowExecution('chatWithLead', input, result.response);

        return result.response;
    }
);

// --- Richard Automotive Sentinel ---
import { raSentinelFlow } from './services/raSentinel';
export { raSentinelFlow };

export const raSentinel = onCallGenkit({
    authPolicy: (auth) => requireSignedIn(auth),
    cors: ALLOWED_ORIGINS,
    secrets: ["GEMINI_API_KEY"],
    minInstances: 1,
}, raSentinelFlow);

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
        return await leadRepository.getGarageByUserId(input.userId);
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
        const leadData = await leadRepository.getById(input.leadId);

        return await orchestrateResponse({
            message: input.message,
            history: [],
            leadContext: leadData,
            leadId: input.leadId
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
export const incomingWhatsAppMessage = onRequest({ secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"] }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Optional (recommended) signature verification
    // Enable enforcement via WEBHOOK_SIGNATURE_ENFORCE=true once configured.
    try {
        const enforce = shouldEnforceWebhookSignatures();
        const twilioAuthToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
        const signature = String(req.get('x-twilio-signature') || '').trim();

        if (twilioAuthToken && signature) {
            // Twilio validates against the full URL configured in the console.
            const twilio = (await import('twilio')).default;
            const url = getRequestUrlForSignature(req);
            const ok = twilio.validateRequest(twilioAuthToken, signature, url, req.body || {});
            if (!ok) {
                logger.warn('Rejected Twilio webhook: invalid signature', { url });
                res.status(403).send('Forbidden');
                return;
            }
        } else if (enforce) {
            logger.warn('Rejected Twilio webhook: missing signature config', {
                hasAuthToken: !!twilioAuthToken,
                hasSignature: !!signature,
            });
            res.status(403).send('Forbidden');
            return;
        } else {
            logger.warn('Twilio webhook signature not verified (set WEBHOOK_SIGNATURE_ENFORCE=true to enforce).');
        }
    } catch (e) {
        logger.warn('Twilio webhook signature verification error', { error: String(e) });
        if (shouldEnforceWebhookSignatures()) {
            res.status(403).send('Forbidden');
            return;
        }
    }

    // Twilio sends form-urlencoded POST requests
    // Security Hardening: Validate schema and force string casting to prevent object-injection
    const WhatsAppPayloadSchema = z.object({
        Body: z.preprocess((val) => String(val || ""), z.string()),
        From: z.preprocess((val) => String(val || ""), z.string()),
        VehicleId: z.preprocess((val) => (val ? String(val) : undefined), z.string().optional()),
    });

    const validation = WhatsAppPayloadSchema.safeParse(req.body);

    if (!validation.success) {
        logger.warn('Rejected WhatsApp webhook: Invalid payload schema', { errors: validation.error.format() });
        res.status(400).send('Bad Request');
        return;
    }

    const { Body, From, VehicleId } = validation.data;

    logger.info(`WhatsApp Message from ${From}: ${Body}`);

    try {
        const replyText = await whatsAppProcessor.execute({
            from: From,
            body: Body || "Hola",
            vehicleId: VehicleId
        });

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

    logger.info(`Indexing new car [CLEAN]: ${event.params.carId}`);
    try {
        const { updateCarEmbedding } = await import('./services/vectorService');
        await updateCarEmbedding(event.params.carId, data);

        // Proactive Matching Motor (Richard Automotive Command Center)
        await InventoryMatchingService.matchInventoryToLeads(event.params.carId, data);
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
    secrets: ["SENDGRID_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", "VITE_META_PIXEL_ID", "META_ACCESS_TOKEN"],
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as Lead;
    const appId = event.params.applicationId;

    logger.info(`[NIVEL 12] Processing New Lead: ${appId}`, { email: data.email });

    try {
        await leadAppProcessor.execute({
            id: appId,
            data: data
        });
        logger.info(`[NIVEL 12] Lead ${appId} processed successfully via Use Case.`);
    } catch (err) {
        logger.error(`[NIVEL 12] Error processing lead ${appId}`, err);
    }
});

// --- Scheduled Marketing Automation ---

export const checkStaleLeads = onSchedule({
    schedule: 'every day 09:00',
    secrets: ["SENDGRID_API_KEY"],
}, async () => {
    logger.info("Checking for stale leads (Agnostic Flow)...");

    try {
        const useCase = new NudgeStaleLeads(leadRepository, emailRepository);
        const nudgeCount = await useCase.execute();
        logger.info(`Nudge campaign completed. Emailed ${nudgeCount} leads.`);
    } catch (error) {
        logger.error("Error in checkStaleLeads", error);
    }
});

export const cleanupOldLogs = onSchedule('every sunday 00:00', async () => {
    logger.info("Running Log Cleanup...");
    try {
        const useCase = new CleanAuditLogs(logRepository);
        const deletedCount = await useCase.execute(30);
        logger.info(`Log Cleanup complete. Deleted ${deletedCount} logs.`);
    } catch (error) {
        logger.error("Error in cleanupOldLogs", error);
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
        try {
            const useCase = new NotifyPriceDrop(leadRepository, emailRepository);
            await useCase.execute(
                event.params.carId,
                Number(before.price),
                Number(after.price),
                after.name || after.model
            );
            logger.info(`Price Drop Alert executed for ${event.params.carId}`);
        } catch (error) {
            logger.error(`Error in onVehicleUpdate price drop alert`, error);
        }
    }
});

export const onLeadStatusChange = onDocumentUpdated({
    document: 'applications/{leadId}',
    secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    // Only react if status CHANGED
    if (before.status === after.status) return;

    try {
        const useCase = new NotifyLeadStatusChange(emailRepository);
        await useCase.execute(after as Lead, before.status, after.status);
        logger.info(`Lead Status Change notification executed for ${event.params.leadId}`);
    } catch (error) {
        logger.error(`Error in onLeadStatusChange`, error);
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

// --- Phase 6: Voice & WhatsApp Exports ---
export const processVoiceChunk = onCallGenkit({
    authPolicy: (auth) => requireSignedIn(auth),
    cors: ALLOWED_ORIGINS,
    secrets: ["GEMINI_API_KEY"],
}, ai.defineFlow(
    { name: 'processVoiceChunk', inputSchema: z.object({ leadId: z.string(), text: z.string() }), outputSchema: z.void() },
    async (input) => {
        const { voiceIntelligenceService } = await import('./services/voiceIntelligenceService');
        await voiceIntelligenceService.processCallChunk(input.leadId, input.text);
    }
));

export const getLeadMemory = onCallGenkit({
    authPolicy: (auth) => requireSignedIn(auth),
    cors: ALLOWED_ORIGINS,
    secrets: ["GEMINI_API_KEY"],
}, ai.defineFlow(
    { name: 'getLeadMemory', inputSchema: z.object({ leadId: z.string() }), outputSchema: z.any() },
    async (input) => {
        const { customerMemoryService } = await import('./services/customerMemoryService');
        return await customerMemoryService.getMemory(input.leadId);
    }
));
// --- Copilot SDK Migration ---
export { chatWithAgent } from './copilot';

// --- Market Intel Cron Job ---
export const dailyMarketScraper = onSchedule({
    schedule: 'every day 02:00',
    timeZone: 'America/Puerto_Rico',
    timeoutSeconds: 300,
}, async () => {
    const { runMarketIntelScraper } = await import('./services/marketIntelService');
    await runMarketIntelScraper();
});
