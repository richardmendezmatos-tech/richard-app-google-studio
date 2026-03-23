import { z } from 'genkit';
import { ai } from './services/aiManager';
import { onCallGenkit } from 'firebase-functions/https';
import { requireAdmin, requireSignedIn } from './security/policies';
import { FirestoreLeadRepository } from './infrastructure/persistence/firestore/FirestoreLeadRepository';
import { FirestoreInventoryRepository } from './infrastructure/persistence/firestore/FirestoreInventoryRepository';
import { GenkitAgentOrchestrator } from './infrastructure/ai/GenkitAgentOrchestrator';
import { ReindexInventory, AnalyzeLead, AnalyzeLeadOutputSchema } from './application/use-cases';
import { logFlowExecution } from './services/persistenceService';

// RE-EXPORTS (Public API)
// RE-EXPORTS (Public API)
export {
  onCarCreated,
  onCarUpdated,
  onNewApplication,
  onVehicleUpdate,
  onLeadStatusChange,
  onLeadMetricsUpdate,
} from './triggers/firestoreTriggers';
export { cleanupOldLogs, dailyMarketScraper } from './scheduled/maintenanceScheduler';
export { sendgridWebhook } from './webhooks/sendgridWebhook';
export { verifyGoogleToken } from './googleOneTap';

export { saveFiProgress } from './webhooks/notionWebhook';
export { sendSmsLead } from './webhooks/twilioWebhook';
export { incomingWhatsAppMessage as onWhatsAppMessage } from './triggers/whatsappTrigger';

import { transcribeVoiceFlow } from './voiceTranscription';
export { transcribeVoiceFlow };

export { chatWithAgent } from './copilot';
import { raSentinelFlow } from './services/raSentinel';
export { raSentinelFlow };

import authApp from './authApp';
import { onRequest } from 'firebase-functions/v2/https';
export const authApi = onRequest({ cors: true }, authApp);

const ALLOWED_ORIGINS = [
  'https://richard-automotive.vercel.app',
  'https://richard-automotive-dev.web.app',
  'http://localhost:5173',
];

// Shared Infrastructure (For Flows)
const leadRepository = new FirestoreLeadRepository();
const inventoryRepository = new FirestoreInventoryRepository();
const aiOrchestrator = new GenkitAgentOrchestrator();

// FLOWS

export const generateCarDescription = ai.defineFlow(
  {
    name: 'generateCarDescription',
    inputSchema: z.object({ carModel: z.string(), features: z.array(z.string()).optional() }),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (input, { sendChunk }) => {
    const { carModel, features } = input;
    const cacheKey = `car_desc_${carModel.toLowerCase().replace(/\s+/g, '_')}_${features?.join('_').toLowerCase().replace(/\s+/g, '_')}`;
    const { cache } = await import('./services/cacheService');
    const cachedResult = await cache.get<string>(cacheKey);
    if (cachedResult) {
      sendChunk(cachedResult);
      return cachedResult;
    }
    const prompt = `Eres un experto en marketing... Escribe una descripción persuasiva para un ${carModel}...`;
    const { response, stream } = await ai.generateStream(prompt);
    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk.text;
      sendChunk(chunk.text);
    }
    const result = await response;
    const output = result.text || fullText;
    await cache.set(cacheKey, output, 86400);
    return output;
  },
);

export const generateDescription = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
    minInstances: 1,
    memory: '512MiB',
  },
  generateCarDescription,
);

export const semanticCarSearch = ai.defineFlow(
  {
    name: 'semanticCarSearch',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    const { semanticSearch } = await import('./infrastructure/ai/VectorAdapter');
    return await semanticSearch(input.query);
  },
);

export const searchCarsSemantic = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
    minInstances: 1,
  },
  semanticCarSearch,
);

export const reindexInventoryFlow = ai.defineFlow(
  { name: 'reindexInventory', inputSchema: z.void(), outputSchema: z.string() },
  async () => {
    const { updateCarEmbedding } = await import('./infrastructure/ai/VectorAdapter');
    const useCase = new ReindexInventory(inventoryRepository);
    const result = await useCase.execute(async (id, data) => {
      await updateCarEmbedding(id, data);
    });

    if (result.isFailure()) {
      throw new Error(result.error.message);
    }

    return `Re-indexed ${result.value} cars.`;
  },
);

export const triggerReindex = onCallGenkit(
  {
    authPolicy: (auth) => requireAdmin(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
  },
  reindexInventoryFlow,
);

export const analyzeLeadFlow = ai.defineFlow(
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
      location: z.string().optional(),
    }),
    outputSchema: AnalyzeLeadOutputSchema,
  },
  async (input) => {
    const useCase = new AnalyzeLead(inventoryRepository);
    const result = await useCase.execute(input);

    if (result.isFailure()) {
      throw new Error(result.error.message);
    }

    return result.value;
  },
);

export const analyzeLead = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
  },
  analyzeLeadFlow,
);

export const chatWithLeadFlow = ai.defineFlow(
  {
    name: 'chatWithLead',
    inputSchema: z.object({
      leadId: z.string().optional(),
      message: z.string(),
      vehicleId: z.string().optional(),
      history: z.array(z.any()).optional(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    let leadContext = {};
    if (input.leadId) {
      const leadData = await leadRepository.getById(input.leadId);
      leadContext = leadData || {};
    }
    let vehicleContext = null;
    if (input.vehicleId) {
      vehicleContext = await inventoryRepository.getById(input.vehicleId);
    }
    const result = await aiOrchestrator.orchestrate({
      message: input.message,
      history: input.history || [],
      leadContext,
      vehicleContext,
      leadId: input.leadId,
    });
    await logFlowExecution('chatWithLead', input, result.response);
    return result.response;
  },
);

export const chatWithLead = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
  },
  chatWithLeadFlow,
);

export const processVoiceChunk = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
  },
  ai.defineFlow(
    {
      name: 'processVoiceChunk',
      inputSchema: z.object({ leadId: z.string(), text: z.string() }),
      outputSchema: z.void(),
    },
    async (input) => {
      const { voiceIntelligenceService } =
        await import('./infrastructure/external-apis/VoiceIntelligenceAdapter');
      await voiceIntelligenceService.processCallChunk(input.leadId, input.text);
    },
  ),
);

export const transcribeVoice = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
  },
  transcribeVoiceFlow,
);

export const raSentinel = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
    minInstances: 1,
  },
  raSentinelFlow,
);

export const askGemini = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
    minInstances: 1,
  },
  ai.defineFlow(
    {
      name: 'askGemini',
      inputSchema: z.object({
        contents: z.array(z.any()),
        model: z.string().optional(),
        systemInstruction: z.string().optional(),
        config: z.any().optional(),
      }),
      outputSchema: z.string(),
    },
    async (input) => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = process.env.GEMINI_API_KEY || "";
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
         model: input.model || "gemini-m-1.5-flash",
         systemInstruction: input.systemInstruction,
         generationConfig: input.config as any
      });
      const result = await model.generateContent(input.contents as any);
      const response = await result.response;
      return response.text();
    }
  )
);
