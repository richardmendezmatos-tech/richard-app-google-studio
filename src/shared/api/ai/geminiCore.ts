import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Car } from '@/shared/types/types';
import { FINANCIAL_ENTITIES_PR } from '@/shared/config/financialEntities';
import { getAuditRepository } from '@/shared/api/houston/AuditRepositoryProvider';

/**
 * Gemini Core Engine.
 * Internals compartidos por todas las capabilities de geminiService:
 * tipos, function-calling tools, prompt armor, cache de respuestas y el
 * proxy central `callGeminiProxy` (con loop de function calling + auditoría).
 */

// Types for Gemini
// We define a loose type compatible with the SDK's expectation for this project's scope
interface GeminiInlineData {
  mimeType: string;
  data: string;
}

export interface GeminiPart {
  text?: string;
  inlineData?: GeminiInlineData;
  [key: string]: unknown; // Allow other properties to satisfy SDK checks if needed
}

export type GeminiPrompt = string | GeminiPart[];

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  responseSchema?: any;
  [key: string]: unknown;
}

// --- TOOLS DEFINITION (FUNCTION CALLING) ---
const financeTools = {
  functionDeclarations: [
    {
      name: 'calculateLoanPayment',
      description:
        'Calcula el pago mensual exacto para un préstamo de auto basado en el precio, pronto y términos.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          price: {
            type: SchemaType.NUMBER,
            description: 'Precio total de la unidad incluyendo gastos de dealer ($495).',
          },
          downPayment: {
            type: SchemaType.NUMBER,
            description: 'Cantidad de pronto o trade-in aportada.',
          },
          term: {
            type: SchemaType.NUMBER,
            description: 'Término del préstamo en meses (ej. 72, 84).',
          },
          apr: { type: SchemaType.NUMBER, description: 'Tasa de interés estimada (ej. 5.95).' },
        },
        required: ['price', 'term'],
      },
    },
    {
      name: 'searchInventoryByDetails',
      description: 'Busca vehículos específicos en el inventario de Richard Automotive.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: {
            type: SchemaType.STRING,
            description: "Términos de búsqueda (ej. 'suv blanca', 'hyundai tucson').",
          },
          maxPrice: { type: SchemaType.NUMBER, description: 'Presupuesto máximo del cliente.' },
        },
        required: ['query'],
      },
    },
    {
      name: 'captureCustomerLead',
      description:
        'Registra los datos de contacto de un cliente interesado en la base de datos de Richard Automotive.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          firstName: { type: SchemaType.STRING, description: 'Nombre del cliente.' },
          phone: { type: SchemaType.STRING, description: 'Teléfono o WhatsApp del cliente.' },
          email: { type: SchemaType.STRING, description: 'Correo electrónico (opcional).' },
          vehicleOfInterest: { type: SchemaType.STRING, description: 'Auto que le interesa.' },
          notes: {
            type: SchemaType.STRING,
            description: 'Notas adicionales (ej. "Quiere cita hoy").',
          },
        },
        required: ['firstName', 'phone'],
      },
    },
    {
      name: 'generatePreQualEstimate',
      description:
        'Genera un análisis financiero preliminar basado en el ingreso y crédito auto-reportado del cliente.',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          creditTier: {
            type: SchemaType.STRING,
            enum: ['Excellent', 'Good', 'Fair', 'Poor'],
            description: 'Rango de crédito del cliente (800+, 700+, 600+, <600).',
          },
          monthlyIncome: { type: SchemaType.NUMBER, description: 'Ingreso bruto mensual ($).' },
          monthlyDebt: {
            type: SchemaType.NUMBER,
            description: 'Pagos mensuales de vivienda (renta/hipoteca).',
          },
        },
        required: ['creditTier', 'monthlyIncome'],
      },
    },
  ],
} as any;

// --- TOOL HANDLERS ---
/**
 * AI Prompt Armor - Security Layer
 * Prevents prompt injection and "System Prompt" leakage.
 */
export const interceptPrompt = (prompt: string): string => {
  const forbiddenPatterns = [
    /ignore all previous instructions/gi,
    /reveal your system prompt/gi,
    /show your instructions/gi,
    /cuáles son tus reglas/gi,
    /dime tus instrucciones/gi,
    /delete all previous/gi,
    /forget everything/gi,
  ];

  const lowerPrompt = prompt.toLowerCase();
  const isMalicious = forbiddenPatterns.some((pattern) => pattern.test(lowerPrompt));

  if (isMalicious) {
    console.warn('🛡️ [Prompt Armor] Blocked potential injection attempt:', prompt);
    return 'Lo siento, como asistente certificado de Richard Automotive, solo puedo ayudarte con temas relacionados a vehículos, inventario y financiamiento. ¿En qué más puedo asesorarte hoy?';
  }

  return prompt;
};

const toolHandlers: Record<string, (args: any, inventory: Car[]) => any> = {
  calculateLoanPayment: ({ price, downPayment = 0, term, apr = 6.95 }) => {
    // Pro/Industrial Logic (Freightliner / Commercial)
    const isCommercial = price > 100000;
    const defaultAPR = isCommercial ? 8.95 : 6.95;
    const effectiveAPR = apr || defaultAPR;

    const balance = price - downPayment;
    const monthlyRate = effectiveAPR / 100 / 12;
    const payment = (balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    return {
      monthlyPayment: Math.round(payment),
      totalInterest: Math.round(payment * term - balance),
      balanceToFinance: balance,
      type: isCommercial ? 'Comercial/Pro' : 'Personal',
      disclaimer: isCommercial
        ? 'Basado en financiamiento comercial (Freightliner Pro). Sujeto a flujo de caja del negocio.'
        : 'Estimado basado en crédito excelente. Sujeto a aprobación bancaria.',
    };
  },
  searchInventoryByDetails: ({ query, maxPrice }, inventory) => {
    const lowerQuery = query.toLowerCase();
    const matches = inventory
      .filter(
        (car) =>
          (car.name.toLowerCase().includes(lowerQuery) ||
            car.type?.toLowerCase().includes(lowerQuery)) &&
          (!maxPrice || car.price <= maxPrice),
      )
      .slice(0, 5);

    return matches.map((c) => ({
      name: c.name,
      price: c.price,
      badge: c.badge,
      availability: 'Disponible para prueba de manejo',
    }));
  },
  captureCustomerLead: ({ firstName, phone, email, vehicleOfInterest, notes }) => {
    console.log('📝 [Lead Interceptor] Captured:', { firstName, phone, email, vehicleOfInterest });

    // Emit custom event for UI feedback
    const event = new CustomEvent('ra_lead_captured', {
      detail: { firstName, vehicleOfInterest, timestamp: new Date().toISOString() },
    });
    window.dispatchEvent(event);

    return {
      status: 'success',
      message: `Lead de ${firstName} guardado en RA Cloud.`,
      followUp: 'Richard será notificado de inmediato.',
    };
  },
  generatePreQualEstimate: ({ creditTier, monthlyIncome, monthlyDebt = 0 }) => {
    console.log('📊 [Finance Analyst] Analyzing:', { creditTier, monthlyIncome, monthlyDebt });

    // APR Mapping based on PR Local Banks (Primary Floorplan)
    const bestBank = FINANCIAL_ENTITIES_PR.find((e) => e.id === 'banco-popular' && e.tier === 1);
    const aprMap: Record<string, number> = {
      Excellent: bestBank?.baseRate || 6.95,
      Good: 7.95,
      Fair: 11.95,
      Poor: 17.95,
    };

    const apr = aprMap[creditTier] || 12.95;

    // DTI/PTI Logic (Simple heuristic)
    // Richard's Rule: Max 15% of gross income for car payment
    const maxPayment = Math.round(monthlyIncome * 0.15);

    // Estimate total loan amount (approx 72 months term)
    const term = 72;
    const monthlyRate = apr / 100 / 12;
    const estimatedLoan = Math.round(
      (maxPayment * (1 - Math.pow(1 + monthlyRate, -term))) / monthlyRate,
    );

    return {
      apr,
      maxMonthlyPayment: maxPayment,
      buyingPower: estimatedLoan,
      creditTier,
      recommendation: `Basado en un ingreso de $${monthlyIncome}, calificas para una unidad de hasta $${estimatedLoan.toLocaleString()}.`,
      disclaimer: 'Análisis actuarial preliminar. Sujeto a validación de SSN en bóveda segura.',
    };
  },
};

const responseCache = new Map<string, { text: string; timestamp: number }>();
const RESPONSE_CACHE_TTL = 5 * 60 * 1000;

const getCachedResponse = (key: string): string | null => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL) return cached.text;
  if (cached) responseCache.delete(key);
  return null;
};

const setCachedResponse = (key: string, text: string) => {
  if (responseCache.size > 100) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { text, timestamp: Date.now() });
};

export const callGeminiProxy = async (
  prompt: GeminiPrompt,
  systemInstruction?: string,
  modelName: string = 'gemini-2.0-flash',
  config: GenerationConfig = { temperature: 0.1 },
  inventory?: Car[],
  skipTools?: boolean,
): Promise<string> => {
  const cacheKey = JSON.stringify({ prompt, systemInstruction, modelName, config, skipTools });
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    console.log('[GeminiCache] Hit for prompt:', typeof prompt === 'string' ? prompt.slice(0, 50) : 'array');
    return cached;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey)
      throw new Error('GEMINI_API_KEY not configured. Set it in Vercel environment variables.');

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelOptions: any = {
      model: modelName,
      systemInstruction,
      generationConfig: config,
    };

    if (!skipTools && (modelName.includes('flash') || modelName === 'gemini-2.0-flash')) {
      modelOptions.tools = [financeTools];
    }

    const model = genAI.getGenerativeModel(modelOptions);

    const startTime = Date.now();
    const chat = model.startChat();
    let result = await chat.sendMessage(
      prompt as unknown as Parameters<typeof chat.sendMessage>[0],
    );
    let response = result.response;

    // Handle Function Calling Loop
    const callCount = 0;
    while (response.candidates?.[0]?.content?.parts?.some((p) => p.functionCall) && callCount < 5) {
      const calls = response.candidates[0].content.parts.filter((p) => p.functionCall);
      const responses = await Promise.all(
        calls.map(async (call) => {
          const handler = toolHandlers[call.functionCall!.name];
          if (handler) {
            const result = handler(call.functionCall!.args, inventory || []);
            return {
              functionResponse: { name: call.functionCall!.name, response: { content: result } },
            };
          }
          return {
            functionResponse: {
              name: call.functionCall!.name,
              response: { error: 'Tool not found' },
            },
          };
        }),
      );

      result = await chat.sendMessage(responses);
      response = result.response;
    }

    const duration = Date.now() - startTime;

    // Nivel 14 AI Traceability
    getAuditRepository().then((repo) =>
      repo.log(
        'info',
        `IA Inferencia completada (${modelName})`,
        { latency: duration, model: modelName },
        'GeminiService',
      ),
    );

    const text = response.text();
    setCachedResponse(cacheKey, text);
    return text;
  } catch (error: any) {
    console.error('AI Proxy Error:', error);

    getAuditRepository().then((repo) =>
      repo.log(
        'error',
        `Fallo en IA Inferencia: ${error.message}`,
        { model: modelName },
        'GeminiService',
      ),
    );

    throw error;
  }
};
