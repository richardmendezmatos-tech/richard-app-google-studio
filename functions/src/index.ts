import { onCallGenkit } from 'firebase-functions/https';
import { requireAdmin, requireSignedIn } from './security/policies';

// RE-EXPORTS (Public API)
export {
  onCarCreated,
  onCarUpdated,
  onNewApplication,
  onVehicleUpdate,
  onLeadStatusChange,
  onLeadMetricsUpdate,
} from './triggers/firestoreTriggers';
export { onCreditApplicationCreated } from './triggers/onCreditApplicationCreated';
export { onLeadInactivityNurturing } from './triggers/marketingAutomation';
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

export { generateSitemap } from './infrastructure/seo/sitemapGenerator';
export { generateMerchantFeed } from './infrastructure/seo/merchantFeedGenerator';

const ALLOWED_ORIGINS = [
  'https://richard-automotive.com',
  'https://www.richard-automotive.com',
  'https://richard-automotive.vercel.app',
  'https://richard-automotive-dev.web.app',
  'http://localhost:5173',
];

// ----------------------------------------------------------------------
// IMPORT ISOLATED FLOWS
// ----------------------------------------------------------------------
import { generateCarDescriptionFlow } from './application/use-cases/ai-flows/generateCarDescriptionFlow';
import { semanticCarSearchFlow, reindexInventoryFlow } from './application/use-cases/ai-flows/semanticSearchFlows';
import { analyzeLeadFlow, chatWithLeadFlow } from './application/use-cases/ai-flows/leadAnalysisFlows';
import { askGeminiFlow } from './application/use-cases/ai-flows/askGeminiFlow';
import { processVoiceChunkFlow } from './application/use-cases/ai-flows/processVoiceChunkFlow';

// ----------------------------------------------------------------------
// EXPOSED FIREBASE CLOUD FUNCTIONS (Endpoints)
// ----------------------------------------------------------------------

export const generateDescription = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
    minInstances: 1,
    memory: '512MiB',
  },
  generateCarDescriptionFlow,
);

export const searchCarsSemantic = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
    minInstances: 1,
  },
  semanticCarSearchFlow,
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

export const analyzeLead = onCallGenkit(
  {
    authPolicy: (auth) => requireSignedIn(auth),
    enforceAppCheck: true,
    cors: ALLOWED_ORIGINS,
    secrets: ['GEMINI_API_KEY'],
  },
  analyzeLeadFlow,
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
  processVoiceChunkFlow,
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
  askGeminiFlow,
);
