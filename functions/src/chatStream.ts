import { onRequest } from 'firebase-functions/v2/https';
import { streamText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import * as logger from 'firebase-functions/logger';
import { db } from './services/firebaseAdmin';
import { customerMemoryService } from './services/customerMemoryService';
import { simulateLoan } from './services/financeService';
import { classificationFlow } from './services/classificationService';

interface Car {
  id: string;
  name?: string;
  type?: string;
  [key: string]: any;
}

const SYSTEM_PROMPT = `
ROL: Eres el Motor de Inteligencia "RA Sentinel", que orquesta a tres expertos: Ricardo (Ventas), Sofia (Finanzas) y Jordan (Cierre).
OBJETIVO: Convertir cada interacción en una oportunidad de negocio estructurada mediante Tool Calling nativo.

PROTOCOLOS DE EXPERTO:
1. RICARDO (Ventas): Usa 'checkInventory' para mostrar unidades reales. Atento a SUVs y Sedanes.
2. SOFIA (Analista Senior): Usa 'generatePreQualEstimate' si el cliente menciona ingresos o crédito. NUNCA pide SSN en el chat.
3. JORDAN (The Closer): Tan pronto el cliente muestre interés serio, usa 'captureCustomerLead'.
4. RESILIENCIA: Usa frases puente ("Analizando viabilidad en la red bancaria...", "Verificando inventario en tiempo real...") para ocultar latencias.
5. MEMORIA: Si el 'leadId' indica un cliente recurrente, personaliza la bienvenida.
`;

export const chatStream = onRequest({ cors: true, region: 'us-central1' }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { messages, leadId } = req.body;
  const lastMessage = messages[messages.length - 1]?.content || '';

  // --- Phase HOA: Intent Middleware (Semantic) ---
  const intent = await classificationFlow(lastMessage);
  const isFinanceQuery = intent === 'FINANCE_QUERY';

  const financeContext = isFinanceQuery
    ? `
    [BLOQUE DE SEGURIDAD F&I]
    - Tasas base: Popular (6.95%), BPPR (7.25%), COOP (5.95%).
    - REGLA: Nunca garantices estos números. Son estimados.
    - REGLA: Siempre menciona "Sujeto a aprobación de crédito".`
    : '';

  // --- Phase 6: Memory Retrieval ---
  const customerMemory = leadId ? await customerMemoryService.getMemory(leadId) : null;

  try {
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      maxRetries: 3,
      system: `${SYSTEM_PROMPT}
            ${financeContext}
            MEMORIA DEL CLIENTE: ${JSON.stringify(customerMemory || 'Nuevo Cliente')}
            Si el cliente ya ha visto ciertos autos, menciónalos para crear cercanía.`,
      messages,
      tools: {
        checkInventory: tool({
          description: 'Busca autos en el inventario por marca, modelo o tipo.',
          inputSchema: z.object({
            query: z.string().describe('Término de búsqueda, ej: "Toyota"'),
          }),
          execute: async ({ query }: { query: string }) => {
            const snapshot = await db
              .collection('cars')
              .where('dealerId', '==', 'richard-automotive')
              .limit(10)
              .get();
            const allCars = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Car[];
            const filtered = allCars.filter(
              (car: Car) =>
                car.name?.toLowerCase().includes(query.toLowerCase()) ||
                car.type?.toLowerCase().includes(query.toLowerCase()),
            );
            return filtered.length > 0 ? filtered.slice(0, 5) : allCars.slice(0, 3);
          },
        }),
        calculatePayment: tool({
          description: 'Calcula el pago mensual estimado de un auto basándose en crédito estimado.',
          inputSchema: z.object({
            price: z.number(),
            downPayment: z.number(),
            months: z.number().default(72),
            creditTier: z.enum(['Excellent', 'Good', 'Fair', 'Poor']).default('Good'),
          }),
          execute: async ({ price, downPayment, months, creditTier }) => {
            const aprMap: Record<string, number> = { Excellent: 6.95, Good: 8.95, Fair: 12.95, Poor: 18.95 };
            const scoreMap: Record<string, number> = { Excellent: 750, Good: 700, Fair: 640, Poor: 580 };
            const apr = aprMap[creditTier] || 8.95;
            const simulations = await simulateLoan(price, downPayment, months, scoreMap[creditTier] || 700); 
            return {
              apr,
              monthlyPayment: simulations[0]?.monthlyPayment || 0,
              disclaimer: 'Sujeto a aprobación crediticia formal.'
            };
          },
        }),
        captureCustomerLead: tool({
          description: 'Registra un prospecto de alta prioridad en el CRM de Richard Automotive.',
          inputSchema: z.object({
            firstName: z.string().describe('Nombre del cliente.'),
            phone: z.string().describe('Número de teléfono.'),
            email: z.string().optional().describe('Email opcional.'),
            vehicleOfInterest: z.string().optional().describe('Auto interesado.'),
          }),
          execute: async (data) => {
            await db.collection('applications').add({
              ...data,
              type: 'sentinel_chat',
              timestamp: new Date(),
              status: 'new',
            });
            return { success: true, message: `Lead de ${data.firstName} asegurado.` };
          },
        }),
        generatePreQualEstimate: tool({
          description: 'Genera un certificado de pre-cualificación preliminar basado en ingresos y crédito.',
          inputSchema: z.object({
            creditTier: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
            monthlyIncome: z.number(),
            monthlyDebt: z.number().optional(),
          }),
          execute: async ({ creditTier, monthlyIncome }) => {
            const aprMap: Record<string, number> = { Excellent: 6.95, Good: 8.95, Fair: 12.95, Poor: 18.95 };
            const apr = aprMap[creditTier] || 12.95;
            const maxPayment = Math.round(monthlyIncome * 0.15);
            const buyingPower = Math.round(maxPayment * 50); // Heuristic for car value
            return {
              apr,
              maxMonthlyPayment: maxPayment,
              buyingPower,
              creditTier,
              recommendation: `Basado en tus ingresos, calificas para unidades hasta $${buyingPower.toLocaleString()}.`
            };
          },
        }),
        updateMemory: tool({
          description: 'Actualiza la memoria del cliente con nuevas preferencias o notas.',
          inputSchema: z.object({
            leadId: z.string(),
            vehicleId: z.string().optional(),
            note: z.string(),
          }),
          execute: async ({ leadId, vehicleId, note }) => {
            await customerMemoryService.updateMemory(leadId, vehicleId, note);
            return { success: true };
          },
        }),
        requestLeadInfo: tool({
          description:
            'Solicita información específica al cliente (ingreso, trade-in, crédito) usando un formulario interactivo.',
          inputSchema: z.object({
            type: z.enum(['income', 'trade-in', 'credit']),
          }),
          execute: async ({ type }) => {
            return {
              status: 'form_requested',
              type,
              instruction: `Por favor completa el formulario de ${type} para continuar.`,
            };
          },
        }),
      },
    });

    // Stream Data Protocol so frontend useChat can parse both text and tool invocations
    if ('pipeDataStreamToResponse' in result) {
      (result as any).pipeDataStreamToResponse(res);
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      result.pipeTextStreamToResponse(res);
    }
  } catch (error) {
    logger.error('Chat Error:', error);

    // Protocolo de Falla Crítica y Retención de Contexto
    if (leadId && intent) {
      try {
        // Guardar la intención de la última pregunta para retomar luego
        await customerMemoryService.updateMemory(
          leadId,
          undefined,
          `[FALLA CRÍTICA] El sistema falló al responder. La última intención del cliente fue: ${intent}. Mensaje: "${lastMessage}"`,
        );
      } catch (e) {
        logger.error('Failed to save context during critical failure', e);
      }
    }

    const fallbackResponse =
      '¡Ups! Parece que mi conexión está un poco intermitente en este momento y no pude cargar la respuesta completa. ¿Te importaría escribirme tu pregunta de nuevo?';

    // Enviar respuesta natural en vez de un 500 error para mantener la fluidez
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(fallbackResponse);
  }
});
